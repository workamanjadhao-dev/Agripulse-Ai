import { dbAll, dbGet, dbRun } from '../database/db.js';
import { geminiService } from '../services/geminiService.js';
import { forecastController } from './forecastController.js';
import { marketDataService } from '../services/marketDataService.js';
import { quantitativeForecastingEngine } from '../services/quantitativeForecastingEngine.js';

export const aiController = {
  // POST /api/ai/chat
  async chat(req, res, next) {
    try {
      const { message, userRole, language, apiKey } = req.body;
      const customApiKey = apiKey || req.headers['x-gemini-key'] || null;
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Message query is required.' });
      }

      // Determine user role from authenticated user or body
      const effectiveRole = req.user?.role || userRole || 'farmer';
      const userId = req.user?.id || null;

      // 1. Retrieve latest verified APMC market records to ground the LLM
      const marketRecords = await dbAll(`SELECT * FROM market_prices ORDER BY updated_at DESC, id DESC LIMIT 10`);
      const contextLines = marketRecords.map(m => {
        const modal = m.modalPrice || m.price;
        const min = m.minPrice || (modal - 100);
        const max = m.maxPrice || (modal + 100);
        const crop = m.crop_name || m.commodity;
        return `• ${crop} at ${m.market} (${m.district || ''}): Modal Price ₹${modal}/qtl (Range: ₹${min} - ₹${max}), Source: ${m.source}, Date: ${m.date}`;
      });

      // 2. If farmer, also include their crops context
      let userCropsContext = '';
      if (userId && effectiveRole === 'farmer') {
        const userCrops = await dbAll(`SELECT crop_name, quantity, unit, status, location FROM crops WHERE farmer_id = ? LIMIT 5`, [userId]);
        if (userCrops.length > 0) {
          userCropsContext = `\n\nUser's registered crops: ${userCrops.map(c => `${c.crop_name} (${c.quantity} ${c.unit}, ${c.status}, ${c.location})`).join('; ')}`;
        }
      }

      const marketContext = contextLines.join('\n') + userCropsContext;

      // 3. Query Gemini Service with grounding context
      const response = await geminiService.answerChat({
        message,
        marketContext,
        userRole: effectiveRole,
        language,
        customApiKey
      });

      // 4. Save conversation to database (if user is authenticated)
      if (userId) {
        await dbRun(
          `INSERT INTO ai_conversations (user_id, message, response, source, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
          [userId, message.trim(), response.reply, response.source]
        ).catch(err => console.warn('Failed to save AI conversation:', err.message));
      }

      res.json({
        success: true,
        reply: response.reply,
        source: response.source
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/ai/history - get user's own conversation history
  async getHistory(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const conversations = await dbAll(
        `SELECT id, message, response, source, created_at FROM ai_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
        [req.user.id]
      );

      res.json({
        success: true,
        count: conversations.length,
        data: conversations
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/ai/forecast - delegating to forecastController
  forecast: forecastController.generateForecast,

  // POST /api/ai/sell-decision
  async sellDecision(req, res, next) {
    try {
      const {
        commodity = 'Soybean',
        crop = 'Soybean',
        market = 'Nagpur APMC',
        mandi = 'Nagpur APMC',
        quantity = 35,
        holdingDays = 10,
        storageCostPerDay = 3,
        transportCostPerQtl = 140,
        productionCost = 28000
      } = req.body;

      const targetCrop = commodity || crop;
      const targetMarket = mandi || market;

      // 1. Live market record & user-supplied spot rate
      const liveRecord = await marketDataService.getLiveMandiPrice(targetCrop, targetMarket);
      const userPrice = req.body.currentPrice ? Number(req.body.currentPrice) : null;
      const currentPrice = userPrice && userPrice > 0 ? userPrice : (liveRecord.modalPrice || liveRecord.price || 4700);

      // 2. Fetch recent 14-day history for OLS slope momentum
      const historyRows = await marketDataService.generateMandiPriceHistory(targetCrop, targetMarket, currentPrice);

      // 3. Run quantitative econometric engine to get true seasonal trajectory
      const quant = quantitativeForecastingEngine.generateQuantitativeForecast({
        commodity: targetCrop,
        market: targetMarket,
        location: liveRecord.location || targetMarket,
        currentPrice,
        minPrice: liveRecord.minPrice || (currentPrice - 150),
        maxPrice: liveRecord.maxPrice || (currentPrice + 150),
        dataSource: liveRecord.source,
        historyRows
      });

      const p7 = quant.forecast[0].predictedPrice;
      const p15 = quant.forecast[1].predictedPrice;
      const p30 = quant.forecast[2].predictedPrice;

      // Project price precisely for user's requested holdingDays
      const days = Math.max(1, Math.min(90, Number(holdingDays) || 10));
      let expectedPrice = currentPrice;
      if (days <= 7) {
        expectedPrice = Math.round(currentPrice + (p7 - currentPrice) * (days / 7));
      } else if (days <= 15) {
        expectedPrice = Math.round(p7 + (p15 - p7) * ((days - 7) / 8));
      } else if (days <= 30) {
        expectedPrice = Math.round(p15 + (p30 - p15) * ((days - 15) / 15));
      } else {
        const dailyDriftAfter30 = (p30 - p15) / 15;
        expectedPrice = Math.round(p30 + dailyDriftAfter30 * (days - 30));
      }

      // 4. Complete financial accounting
      const qty = Math.max(1, Number(quantity) || 1);
      const storageRate = Math.max(0, Number(storageCostPerDay) || 0);
      const freightRate = Math.max(0, Number(transportCostPerQtl) || 0);

      const immediateSpotGross = qty * currentPrice;
      const immediateFreight = qty * freightRate;
      const immediateSpotNet = immediateSpotGross - immediateFreight;

      const futureGross = qty * expectedPrice;
      const totalStorageCost = qty * storageRate * days;
      const futureFreight = qty * freightRate;
      const futureNet = futureGross - totalStorageCost - futureFreight;

      const netDifference = futureNet - immediateSpotNet;
      const breakEvenPrice = Math.round(currentPrice + (storageRate * days));

      const calculatedDecision = netDifference > 0 ? 'HOLD' : 'SELL';

      const decisionData = await geminiService.generateSellDecision({
        commodity: targetCrop,
        market: targetMarket,
        currentPrice,
        expectedPrice,
        breakEvenPrice,
        quantity: qty,
        holdingDays: days,
        storageCostPerDay: storageRate,
        transportCostPerQtl: freightRate,
        immediateSpotGross,
        immediateSpotNet,
        futureGross,
        totalStorageCost,
        totalTransportCost: futureFreight,
        futureNet,
        netDifference,
        calculatedDecision,
        trend: quant.trend
      });

      res.json({
        success: true,
        data: decisionData
      });
    } catch (err) {
      next(err);
    }
  }
};
