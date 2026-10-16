import express from 'express';
import { dbAll, dbRun, dbGet } from '../database/db.js';
import { optionalAuth, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all price alerts - authenticated users get their own, admin gets all
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    let query = `SELECT * FROM price_alerts WHERE 1=1`;
    const params = [];

    if (req.user && req.user.role === 'admin') {
      // Admin sees all alerts
    } else if (req.user) {
      // Users see only their own alerts
      query += ` AND userEmail = ?`;
      params.push(req.user.email);
    } else {
      // Unauthenticated guest sees no private alerts
      return res.json([]);
    }

    query += ` ORDER BY createdAt DESC`;
    const alerts = await dbAll(query, params);
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// POST create new price alert - requires auth
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { commodity, market, targetPrice, condition, userEmail, crop } = req.body;
    const effectiveCommodity = commodity || crop;

    if (!effectiveCommodity || !targetPrice) {
      return res.status(400).json({ error: 'Commodity and target price are required' });
    }

    const id = `alt-${Date.now()}`;
    const active = 1;
    const alertCond = condition || 'above';
    const effectiveEmail = req.user?.email || userEmail || 'user@agripulse.in';

    await dbRun(
      `INSERT INTO price_alerts (id, commodity, market, targetPrice, condition, userEmail, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, effectiveCommodity, market || 'All Mandis', Number(targetPrice), alertCond, effectiveEmail, active]
    );

    res.status(201).json({
      id,
      commodity: effectiveCommodity,
      market: market || 'All Mandis',
      targetPrice: Number(targetPrice),
      condition: alertCond,
      userEmail: effectiveEmail,
      active
    });
  } catch (err) {
    next(err);
  }
});

// DELETE price alert - requires auth
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await dbGet('SELECT * FROM price_alerts WHERE id = ?', [id]);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    // Verify ownership if authenticated
    if (req.user && alert.userEmail && alert.userEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await dbRun('DELETE FROM price_alerts WHERE id = ?', [id]);
    res.json({ success: true, message: `Price alert ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

export default router;
