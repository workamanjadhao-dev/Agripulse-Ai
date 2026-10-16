import express from 'express';
import { dbAll } from '../db.js';

const router = express.Router();

// GET all mandis
router.get('/', async (req, res) => {
  try {
    const mandis = await dbAll('SELECT * FROM mandis');
    const formatted = mandis.map(m => ({
      ...m,
      cropPrices: JSON.parse(m.cropPrices || '[]')
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
