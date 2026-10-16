import express from 'express';
import { dbGet, dbAll, dbRun } from '../database/db.js';
import { marketDataService } from '../services/marketDataService.js';
import { geminiService } from '../services/geminiService.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require: (1) valid JWT, (2) admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats - System Statistics
router.get('/stats', async (req, res, next) => {
  try {
    const farmersCount = await dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'farmer'`);
    const buyersCount = await dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'buyer'`);
    const adminsCount = await dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`);
    const cropsCount = await dbGet(`SELECT COUNT(*) as count FROM crops`);
    const bookingsCount = await dbGet(`SELECT COUNT(*) as count FROM bookings`);
    const tractorsCount = await dbGet(`SELECT COUNT(*) as count FROM tractors`);
    const vehiclesCount = await dbGet(`SELECT COUNT(*) as count FROM vehicles`);
    const warehousesCount = await dbGet(`SELECT COUNT(*) as count FROM warehouses`);
    const mandisCount = await dbGet(`SELECT COUNT(*) as count FROM mandis`);
    const recordsCount = await dbGet(`SELECT COUNT(*) as count FROM market_prices`);
    const forecastsCount = await dbGet(`SELECT COUNT(*) as count FROM forecasts`);
    const buyerReqsCount = await dbGet(`SELECT COUNT(*) as count FROM buyers`);
    const aiConvCount = await dbGet(`SELECT COUNT(*) as count FROM ai_conversations`);
    const totalProduceSum = await dbGet(`SELECT SUM(quantity) as total FROM crops`);
    
    const syncStatus = await marketDataService.getSyncStatus();

    res.json({
      success: true,
      farmersRegistered: farmersCount?.count || 0,
      buyersRegistered: buyersCount?.count || 0,
      adminsRegistered: adminsCount?.count || 0,
      totalUsers: (farmersCount?.count || 0) + (buyersCount?.count || 0) + (adminsCount?.count || 0),
      cropsRegistered: cropsCount?.count || 0,
      buyerRequirements: buyerReqsCount?.count || 0,
      activeBookings: bookingsCount?.count || 0,
      machineryListings: (tractorsCount?.count || 0) + (vehiclesCount?.count || 0),
      warehousesCount: warehousesCount?.count || 0,
      mandisMonitored: mandisCount?.count || 0,
      marketRecordsCount: recordsCount?.count || 0,
      forecastsGenerated: forecastsCount?.count || 0,
      aiConversations: aiConvCount?.count || 0,
      totalProduceQuintals: Math.round(totalProduceSum?.total || 0),
      syncTelemetry: {
        marketApiStatus: syncStatus.badge,
        source: syncStatus.source,
        lastSync: syncStatus.lastSync,
        minutesAgo: syncStatus.minutesAgo,
        recordsFetched: syncStatus.recordsFetched || recordsCount?.count || 0,
        geminiStatus: geminiService.isConfigured() ? '🟢 Configured' : '🟡 Fallback Mode'
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - List all users (paginated)
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT id, name, email, role, location, phone, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role && role !== 'All') {
      query += ` AND role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(`SELECT id, name, email, role, location, phone, created_at FROM users`, `SELECT COUNT(*) as count FROM users`);
    const totalCount = await dbGet(countQuery, params);

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const users = await dbAll(query, params);

    res.json({
      success: true,
      count: users.length,
      total: totalCount?.count || 0,
      page: parseInt(page),
      data: users
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id - Remove a user (admin only)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await dbGet(`SELECT id, name, role FROM users WHERE id = ?`, [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await dbRun(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: `User ${user.name} (${user.role}) deleted successfully.` });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/crops - All crops with farmer details
router.get('/crops', async (req, res, next) => {
  try {
    const crops = await dbAll(`
      SELECT c.*, u.name as farmer_name, u.email as farmer_email 
      FROM crops c 
      LEFT JOIN users u ON c.farmer_id = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, count: crops.length, data: crops });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/market-data - Market prices with sync
router.get('/market-data', async (req, res, next) => {
  try {
    const prices = await dbAll(`SELECT * FROM market_prices ORDER BY updated_at DESC LIMIT 50`);
    const syncStatus = await marketDataService.getSyncStatus();
    res.json({ success: true, count: prices.length, syncStatus, data: prices });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/market-data/sync - Force sync
router.post('/market-data/sync', async (req, res, next) => {
  try {
    const result = await marketDataService.syncMarketData();
    res.json({ success: true, message: 'Market data synchronization triggered.', result });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/bookings - All bookings with user details
router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await dbAll(`
      SELECT b.*, u.name as user_name, u.email as user_email, u.role as user_role 
      FROM bookings b 
      LEFT JOIN users u ON b.user_id = u.id 
      ORDER BY b.createdAt DESC
    `);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
});

export default router;
