import express from 'express';
import { dbAll, dbGet } from '../database/db.js';
import { marketDataService } from '../services/marketDataService.js';

const router = express.Router();

// GET /api/market-prices with filters
router.get('/', async (req, res, next) => {
  try {
    const { commodity, crop, state, district, market, limit = 50 } = req.query;
    const targetCrop = commodity || crop;

    let query = `SELECT * FROM market_prices WHERE date = (SELECT MAX(date) FROM market_prices)`;
    const params = [];

    if (targetCrop && targetCrop !== 'All') {
      query += ` AND (commodity LIKE ? OR crop_name LIKE ?)`;
      params.push(`%${targetCrop}%`, `%${targetCrop}%`);
    }
    if (state && state !== 'All') {
      query += ` AND state LIKE ?`;
      params.push(`%${state}%`);
    }
    if (district && district !== 'All') {
      query += ` AND district LIKE ?`;
      params.push(`%${district}%`);
    }
    if (market && market !== 'All') {
      query += ` AND market LIKE ?`;
      params.push(`%${market}%`);
    }

    query += ` ORDER BY updated_at DESC, id DESC LIMIT ?`;
    params.push(parseInt(limit) || 50);

    const rows = await dbAll(query, params);
    const syncStatus = await marketDataService.getSyncStatus();

    const formatted = rows.map(r => ({
      ...r,
      crop_name: r.crop_name || r.commodity,
      commodity: r.commodity || r.crop_name,
      modalPrice: r.modalPrice || r.price,
      price: r.price || r.modalPrice,
      change: r.change !== undefined && r.change !== null ? r.change : 0,
      changePercent: r.changePercent !== undefined && r.changePercent !== null ? r.changePercent : 0,
      trend: r.trend || (r.change > 0 ? 'up' : r.change < 0 ? 'down' : 'stable'),
      marketStatus: r.marketStatus || 'Live Auction',
      sessionName: r.sessionName || 'APMC Live Session'
    }));

    res.json({
      success: true,
      source: syncStatus.source,
      dataStatus: syncStatus.status,
      badge: syncStatus.badge,
      lastUpdated: syncStatus.lastSync,
      minutesAgo: syncStatus.minutesAgo,
      totalRecords: formatted.length,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/market-prices/latest - Overview for major crops
router.get('/latest', async (req, res, next) => {
  try {
    const rows = await dbAll(`SELECT * FROM market_prices WHERE date = (SELECT MAX(date) FROM market_prices) ORDER BY updated_at DESC, id DESC LIMIT 25`);
    const syncStatus = await marketDataService.getSyncStatus();

    const formatted = rows.map(r => ({
      ...r,
      crop_name: r.crop_name || r.commodity,
      commodity: r.commodity || r.crop_name,
      modalPrice: r.modalPrice || r.price,
      price: r.price || r.modalPrice,
      change: r.change !== undefined && r.change !== null ? r.change : 0,
      changePercent: r.changePercent !== undefined && r.changePercent !== null ? r.changePercent : 0,
      trend: r.trend || (r.change > 0 ? 'up' : r.change < 0 ? 'down' : 'stable'),
      marketStatus: r.marketStatus || 'Live Auction',
      sessionName: r.sessionName || 'APMC Live Session'
    }));

    res.json({
      success: true,
      source: syncStatus.source,
      dataStatus: syncStatus.status,
      badge: syncStatus.badge,
      lastUpdated: syncStatus.lastSync,
      minutesAgo: syncStatus.minutesAgo,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/market-prices/history/:commodity - Observed Time Series
router.get('/history/:commodity', async (req, res, next) => {
  try {
    const { commodity } = req.params;
    const { market } = req.query;

    const norm = marketDataService.normalizeCommodityName(commodity);

    let query = `SELECT commodity, market, state, district, modalPrice, minPrice, maxPrice, arrivalQuantity, date FROM price_history WHERE (commodity LIKE ? OR commodity LIKE ? OR ? LIKE '%' || commodity || '%')`;
    const params = [`%${commodity}%`, `%${norm}%`, commodity];

    if (market && market !== 'All') {
      query += ` AND market LIKE ?`;
      params.push(`%${market}%`);
    }

    query += ` ORDER BY date ASC`;

    let history = await dbAll(query, params);

    // If no history exists for this specific commodity and mandi, generate it on the fly
    if (history.length === 0 && market && market !== 'All') {
      await marketDataService.getLiveMandiPrice(commodity, market);
      history = await dbAll(query, params);
    }

    const syncStatus = await marketDataService.getSyncStatus();

    res.json({
      success: true,
      commodity,
      market: market || 'All',
      source: syncStatus.source,
      dataStatus: syncStatus.status,
      totalObservations: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
});

// GET & POST /api/market-prices/sync - Manual or Auto Refresh Trigger
const handleSync = async (req, res, next) => {
  try {
    const syncResult = await marketDataService.syncMarketData();
    const syncStatus = await marketDataService.getSyncStatus();
    res.json({
      success: true,
      message: 'Automatic real-time market data synchronization completed successfully',
      syncResult,
      syncStatus
    });
  } catch (err) {
    next(err);
  }
};

router.get('/sync', handleSync);
router.post('/sync', handleSync);

// PUT /api/market-prices/:id - Calibrate / update mandi rate in real-time
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { modalPrice, minPrice, maxPrice, arrivalQuantity } = req.body;
    const existing = await dbGet(`SELECT * FROM market_prices WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Price record not found' });
    }
    const updatedModal = parseFloat(modalPrice) || existing.modalPrice;
    const updatedMin = parseFloat(minPrice) || (updatedModal * 0.95);
    const updatedMax = parseFloat(maxPrice) || (updatedModal * 1.05);
    const updatedArrival = parseFloat(arrivalQuantity) || existing.arrivalQuantity;
    const nowIso = new Date().toISOString();

    await dbRun(
      `UPDATE market_prices 
       SET modalPrice = ?, price = ?, minPrice = ?, maxPrice = ?, arrivalQuantity = ?, 
           fetchedAt = ?, fetched_at = ?, updatedAt = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updatedModal, updatedModal, updatedMin, updatedMax, updatedArrival, nowIso, nowIso, nowIso, id]
    );

    res.json({
      success: true,
      message: 'Mandi price updated and broadcast in real-time',
      data: { ...existing, modalPrice: updatedModal, price: updatedModal, minPrice: updatedMin, maxPrice: updatedMax }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/market-prices/:crop - Single crop latest price records (Phase 4 requirement)
router.get('/:crop', async (req, res, next) => {
  try {
    const { crop } = req.params;
    const rows = await dbAll(
      `SELECT * FROM market_prices WHERE crop_name LIKE ? OR commodity LIKE ? ORDER BY updated_at DESC, id DESC LIMIT 10`,
      [`%${crop}%`, `%${crop}%`]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `No market price records found for crop ${crop}` });
    }

    const syncStatus = await marketDataService.getSyncStatus();
    const formatted = rows.map(r => ({
      ...r,
      crop_name: r.crop_name || r.commodity,
      commodity: r.commodity || r.crop_name,
      modalPrice: r.modalPrice || r.price,
      price: r.price || r.modalPrice
    }));

    res.json({
      success: true,
      crop,
      source: syncStatus.source,
      dataStatus: syncStatus.status,
      badge: syncStatus.badge,
      lastUpdated: syncStatus.lastSync,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
});

export default router;
