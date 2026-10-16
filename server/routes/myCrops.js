import express from 'express';
import { dbAll, dbRun, dbGet } from '../database/db.js';
import { optionalAuth, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET farmer's crops (mapped to unified crops table)
// If authenticated farmer, return only their crops; otherwise return all (for admin/buyer browsing)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    let query = `SELECT * FROM crops WHERE 1=1`;
    const params = [];

    if (req.user && req.user.role === 'farmer') {
      query += ` AND farmer_id = ?`;
      params.push(req.user.id);
    }

    query += ` ORDER BY created_at DESC`;
    const crops = await dbAll(query, params);
    
    const formatted = crops.map(c => ({
      id: c.id,
      cropName: c.crop_name,
      areaAcres: c.quantity || 5,
      sowingDate: c.sowing_date,
      expectedHarvestDate: c.expected_harvest_date,
      expectedYieldQuintals: c.expected_yield_quintals || c.quantity,
      productionCost: 28000,
      storageCost: 3,
      stage: c.stage || 'Vegetative Growth',
      progressPercent: c.progress_percent || 25,
      healthStatus: c.health_status || 'Good',
      location: c.location || 'Maharashtra',
      status: c.status || 'Growing',
      farmer_id: c.farmer_id,
      createdAt: c.created_at
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// POST add new crop to farm - requires auth
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { cropName, crop_name, areaAcres, quantity, sowingDate, sowing_date, expectedHarvestDate, expected_harvest_date, expectedYieldQuintals, expected_yield_quintals, stage, healthStatus, health_status, location } = req.body;
    const name = cropName || crop_name || 'Crop';
    const qty = Number(expectedYieldQuintals || expected_yield_quintals || areaAcres || quantity) || 10;
    const sDate = sowingDate || sowing_date || new Date().toISOString().split('T')[0];
    const hDate = expectedHarvestDate || expected_harvest_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    const id = `crp-${Date.now()}`;
    const progressPercent = 15;

    // Use authenticated user's ID
    const farmerId = req.user.id;

    await dbRun(
      `INSERT INTO crops 
       (id, farmer_id, crop_name, quantity, unit, location, sowing_date, expected_harvest_date, status, stage, progress_percent, health_status, expected_yield_quintals)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, farmerId, name, qty, 'Quintal', location || req.user.location || 'Maharashtra',
        sDate, hDate, 'Growing', stage || 'Vegetative Growth', progressPercent,
        healthStatus || health_status || 'Good', qty
      ]
    );

    const created = await dbGet(`SELECT * FROM crops WHERE id = ?`, [id]);
    res.status(201).json({
      id,
      cropName: created.crop_name,
      areaAcres: Number(areaAcres) || 5,
      sowingDate: created.sowing_date,
      expectedHarvestDate: created.expected_harvest_date,
      expectedYieldQuintals: created.expected_yield_quintals,
      stage: created.stage,
      progressPercent: created.progress_percent,
      healthStatus: created.health_status,
      location: created.location,
      status: created.status,
      farmer_id: created.farmer_id
    });
  } catch (err) {
    next(err);
  }
});

export default router;
