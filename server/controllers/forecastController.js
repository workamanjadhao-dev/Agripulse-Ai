import { dbAll, dbGet, dbRun } from '../database/db.js';
import { geminiService } from '../services/geminiService.js';
import { marketDataService } from '../services/marketDataService.js';
import { quantitativeForecastingEngine } from '../services/quantitativeForecastingEngine.js';

export const forecastController = {
  // GET /api/forecast
  async getLatestForecasts(req, res, next) {
    try {
      const forecasts = await dbAll(`SELECT * FROM forecasts ORDER BY generated_at DESC LIMIT 20`);
      const syncStatus = await marketDataService.getSyncStatus();

      const formatted = forecasts.map(f => ({
        ...f,
        factors: typeof f.factors === 'string' ? JSON.parse(f.factors || '[]') : f.factors
      }));

      res.json({
        success: true,
        source: syncStatus.source,
        dataStatus: syncStatus.status,
        lastUpdated: syncStatus.lastSync,
        data: formatted
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/forecast/:crop
  async getForecastByCrop(req, res, next) {
    try {
      const { crop } = req.params;
      const forecast = await dbGet(
        `SELECT * FROM forecasts WHERE crop_name LIKE ? ORDER BY generated_at DESC LIMIT 1`,
        [`%${crop}%`]
      );

      if (!forecast) {
        // Automatically generate if not yet in database
        req.body = { commodity: crop };
        return forecastController.generateForecast(req, res, next);
      }

      res.json({
        success: true,
        data: {
          ...forecast,
          factors: typeof forecast.factors === 'string' ? JSON.parse(forecast.factors || '[]') : forecast.factors
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/forecast
  async generateForecast(req, res, next) {
    try {
      const targetCrop = req.body.commodity || req.body.crop || 'Soybean';
      const targetMarket = req.body.mandi || req.body.market || 'Nagpur APMC';
      const horizonDays = parseInt(req.body.horizonDays) || 15;

      // 1. Retrieve or dynamically compute LIVE grounded APMC record for this specific crop and mandi
      const liveRecord = await marketDataService.getLiveMandiPrice(targetCrop, targetMarket);
      const modalPrice = liveRecord.modalPrice || liveRecord.price;
      const minPrice = liveRecord.minPrice;
      const maxPrice = liveRecord.maxPrice;
      const dataSource = liveRecord.source || 'Agmarknet (Govt. of India Live Feed)';
      const location = liveRecord.location || `${liveRecord.district || ''}, ${liveRecord.state || 'Maharashtra'}`;

      // 2. Retrieve actual historical observations from SQLite price_history for this mandi
      let historyRows = await dbAll(
        `SELECT date, modalPrice FROM price_history WHERE (commodity LIKE ? OR commodity LIKE ?) AND market LIKE ? ORDER BY date ASC LIMIT 14`,
        [`%${targetCrop}%`, `%${liveRecord.commodity}%`, `%${targetMarket}%`]
      );

      if (historyRows.length === 0) {
        historyRows = await dbAll(
          `SELECT date, modalPrice FROM price_history WHERE commodity LIKE ? OR commodity LIKE ? ORDER BY date ASC LIMIT 14`,
          [`%${targetCrop}%`, `%${liveRecord.commodity}%`]
        );
      }

      // 3. Generate grounded forecast via Gemini AI with statistical fallback
      const aiAnalysis = await geminiService.generateForecastAnalysis({
        commodity: targetCrop,
        market: targetMarket,
        location,
        currentPrice: modalPrice,
        minPrice,
        maxPrice,
        dataSource,
        historyRows
      });

      // 4. Save to forecasts table with quantitative accuracy
      const p7 = aiAnalysis.forecast?.find(f => f.days === 7)?.predictedPrice || modalPrice;
      const p15 = aiAnalysis.forecast?.find(f => f.days === 15)?.predictedPrice || modalPrice;
      const p30 = aiAnalysis.forecast?.find(f => f.days === 30)?.predictedPrice || modalPrice;

      await dbRun(
        `INSERT INTO forecasts 
         (crop_name, location, market, current_price, forecast_7_day, forecast_15_day, forecast_30_day, trend, confidence, factors, data_source, generated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          targetCrop, location, targetMarket, modalPrice, p7, p15, p30,
          aiAnalysis.trend || 'increasing', aiAnalysis.confidence || 0.75,
          JSON.stringify(aiAnalysis.factors || []), dataSource, aiAnalysis.generatedAt
        ]
      );

      res.json({
        success: true,
        data: {
          ...aiAnalysis,
          crop_name: targetCrop,
          commodity: liveRecord.commodity,
          market: targetMarket,
          location,
          current_price: modalPrice,
          currentMarketPrice: modalPrice,
          min_price: minPrice,
          max_price: maxPrice,
          change: liveRecord.change || 0,
          changePercent: liveRecord.changePercent || 0,
          marketStatus: liveRecord.marketStatus || 'Live Auction',
          sessionName: liveRecord.sessionName || 'APMC Live Session',
          arrival_quantity: liveRecord.arrivalQuantity,
          forecast_7_day: p7,
          forecast_15_day: p15,
          forecast_30_day: p30,
          horizonDays,
          dataSource,
          fetchedAt: liveRecord.fetchedAt,
          disclaimer: 'AI-generated forecast — not guaranteed.'
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
