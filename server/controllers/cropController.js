import { dbAll, dbGet, dbRun } from '../database/db.js';

export const cropController = {
  // GET /api/crops
  // - Admin: returns all crops
  // - Farmer: returns only own crops
  // - Buyer/No auth: returns all crops (marketplace view, for buyer browsing)
  async getAllCrops(req, res, next) {
    try {
      const farmerId = req.query.farmer_id || req.query.farmerId;
      const { status, search, my_crops, marketplace } = req.query;
      let query = `SELECT c.*, u.name as farmer_name FROM crops c LEFT JOIN users u ON c.farmer_id = u.id WHERE 1=1`;
      const params = [];

      // Strict role scoping:
      // If user is a logged-in farmer and not explicitly requesting global marketplace crops, show ONLY their crops
      if (req.user && req.user.role === 'farmer' && marketplace !== 'true') {
        query += ` AND c.farmer_id = ?`;
        params.push(req.user.id);
      } else if (farmerId) {
        query += ` AND c.farmer_id = ?`;
        params.push(farmerId);
      }

      if (status) {
        query += ` AND c.status = ?`;
        params.push(status);
      }
      if (search) {
        query += ` AND (c.crop_name LIKE ? OR c.location LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY c.created_at DESC`;
      const crops = await dbAll(query, params);

      res.json({
        success: true,
        count: crops.length,
        data: crops
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/crops/:id
  async getCropById(req, res, next) {
    try {
      const { id } = req.params;
      const crop = await dbGet(`SELECT c.*, u.name as farmer_name FROM crops c LEFT JOIN users u ON c.farmer_id = u.id WHERE c.id = ?`, [id]);
      if (!crop) {
        return res.status(404).json({ success: false, message: `Crop with id ${id} not found.` });
      }

      // If authenticated farmer, verify ownership (unless admin)
      if (req.user && req.user.role === 'farmer' && crop.farmer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. This crop belongs to another farmer.' });
      }

      res.json({ success: true, data: crop });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/crops
  async createCrop(req, res, next) {
    try {
      const {
        crop_name,
        quantity,
        unit = 'Quintal',
        location,
        sowing_date,
        expected_harvest_date,
        status = 'Growing',
        stage = 'Vegetative Growth',
        progress_percent = 20,
        health_status = 'Good',
        expected_yield_quintals = 0,
        soil_type,
        notes
      } = req.body;

      if (!crop_name || quantity === undefined) {
        return res.status(400).json({ success: false, message: 'crop_name and quantity are required.' });
      }

      // Use authenticated user's ID as farmer_id (security: never trust client-provided farmer_id)
      const farmerId = req.user.id;

      const id = `crp-${Date.now()}`;
      await dbRun(
        `INSERT INTO crops 
         (id, farmer_id, crop_name, quantity, unit, location, sowing_date, expected_harvest_date, status, stage, progress_percent, health_status, expected_yield_quintals, soil_type, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, farmerId, crop_name, Number(quantity) || 0, unit,
          location || req.user.location || 'Maharashtra',
          sowing_date || new Date().toISOString().split('T')[0],
          expected_harvest_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          status, stage, Number(progress_percent) || 20, health_status,
          Number(expected_yield_quintals) || Number(quantity) || 0, soil_type || 'Black Soil', notes || ''
        ]
      );

      const created = await dbGet(`SELECT * FROM crops WHERE id = ?`, [id]);
      res.status(201).json({ success: true, message: 'Crop registered successfully.', data: created });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/crops/:id
  async updateCrop(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await dbGet(`SELECT * FROM crops WHERE id = ?`, [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Crop with id ${id} not found.` });
      }

      // Authorization: farmers can only update their own crops
      if (req.user.role === 'farmer' && existing.farmer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own crops.' });
      }

      const {
        crop_name = existing.crop_name,
        quantity = existing.quantity,
        unit = existing.unit,
        location = existing.location,
        sowing_date = existing.sowing_date,
        expected_harvest_date = existing.expected_harvest_date,
        status = existing.status,
        stage = existing.stage,
        progress_percent = existing.progress_percent,
        health_status = existing.health_status,
        expected_yield_quintals = existing.expected_yield_quintals,
        soil_type = existing.soil_type,
        notes = existing.notes
      } = req.body;

      await dbRun(
        `UPDATE crops SET
         crop_name = ?, quantity = ?, unit = ?, location = ?, sowing_date = ?,
         expected_harvest_date = ?, status = ?, stage = ?, progress_percent = ?,
         health_status = ?, expected_yield_quintals = ?, soil_type = ?, notes = ?
         WHERE id = ?`,
        [
          crop_name, Number(quantity), unit, location, sowing_date,
          expected_harvest_date, status, stage, Number(progress_percent),
          health_status, Number(expected_yield_quintals), soil_type, notes, id
        ]
      );

      const updated = await dbGet(`SELECT * FROM crops WHERE id = ?`, [id]);
      res.json({ success: true, message: 'Crop updated successfully.', data: updated });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/crops/:id
  async deleteCrop(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await dbGet(`SELECT * FROM crops WHERE id = ?`, [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Crop with id ${id} not found.` });
      }

      // Authorization: farmers can only delete their own crops
      if (req.user.role === 'farmer' && existing.farmer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own crops.' });
      }

      await dbRun(`DELETE FROM crops WHERE id = ?`, [id]);
      res.json({ success: true, message: `Crop ${id} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }
};
