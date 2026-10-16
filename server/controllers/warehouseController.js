import { dbAll, dbGet, dbRun } from '../database/db.js';

export const warehouseController = {
  // GET /api/warehouses
  async getAllWarehouses(req, res, next) {
    try {
      const { location, crop, minCapacity, search } = req.query;
      let query = `SELECT * FROM warehouses WHERE 1=1`;
      const params = [];

      if (location && location !== 'All') {
        query += ` AND location LIKE ?`;
        params.push(`%${location}%`);
      }
      if (crop && crop !== 'All') {
        query += ` AND supported_crops LIKE ?`;
        params.push(`%${crop}%`);
      }
      if (minCapacity) {
        query += ` AND available_capacity >= ?`;
        params.push(Number(minCapacity));
      }
      if (search) {
        query += ` AND (name LIKE ? OR location LIKE ? OR supported_crops LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY rating DESC, available_capacity DESC`;
      const rows = await dbAll(query, params);

      const formatted = rows.map(w => ({
        ...w,
        supportedCrops: typeof w.supported_crops === 'string'
          ? (w.supported_crops.startsWith('[') ? JSON.parse(w.supported_crops) : w.supported_crops.split(',').map(s => s.trim()))
          : (w.supported_crops || [])
      }));

      res.json({
        success: true,
        count: formatted.length,
        data: formatted
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/warehouses/:id
  async getWarehouseById(req, res, next) {
    try {
      const { id } = req.params;
      const w = await dbGet(`SELECT * FROM warehouses WHERE id = ?`, [id]);
      if (!w) {
        return res.status(404).json({ success: false, message: `Warehouse ${id} not found.` });
      }

      const formatted = {
        ...w,
        supportedCrops: typeof w.supported_crops === 'string'
          ? (w.supported_crops.startsWith('[') ? JSON.parse(w.supported_crops) : w.supported_crops.split(',').map(s => s.trim()))
          : (w.supported_crops || [])
      };

      res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/warehouses
  async createWarehouse(req, res, next) {
    try {
      const {
        name,
        location,
        latitude = 21.1458,
        longitude = 79.0882,
        capacity,
        available_capacity,
        supported_crops,
        contact,
        type = 'Cold Storage',
        price_per_quintal_month = 80,
        temp_range = '2°C to 8°C'
      } = req.body;

      if (!name || !location || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'name, location, and capacity are required.'
        });
      }

      const id = `wh-${Date.now()}`;
      const cropsString = Array.isArray(supported_crops)
        ? JSON.stringify(supported_crops)
        : (supported_crops || '["General Agri Produce"]');

      const ownerId = (req && req.user ? req.user.id : null) || req.body.owner_id || null;

      await dbRun(
        `INSERT INTO warehouses 
         (id, owner_id, name, location, latitude, longitude, capacity, available_capacity, supported_crops, contact, type, price_per_quintal_month, temp_range, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, ownerId, name, location, Number(latitude), Number(longitude),
          Number(capacity), Number(available_capacity !== undefined ? available_capacity : capacity),
          cropsString, contact || '+91 712 2500000', type,
          Number(price_per_quintal_month) || 80, temp_range, 4.8
        ]
      );

      // Also insert into storages table for backward compatibility
      await dbRun(
        `INSERT OR REPLACE INTO storages (id, name, type, totalCapacityTons, availableCapacityTons, pricePerQuintalMonth, tempRange, location, distanceKm, rating, contact, suitableFor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, name, type, Number(capacity), Number(available_capacity !== undefined ? available_capacity : capacity),
          Number(price_per_quintal_month) || 80, temp_range, location, 15.0, 4.8, contact || '+91 712 2500000', cropsString
        ]
      );

      const created = await dbGet(`SELECT * FROM warehouses WHERE id = ?`, [id]);
      res.status(201).json({ success: true, message: 'Warehouse registered successfully.', data: created });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/warehouses/:id
  async deleteWarehouse(req, res, next) {
    try {
      const { id } = req.params;
      await dbRun('DELETE FROM warehouses WHERE id = ?', [id]);
      await dbRun('DELETE FROM storages WHERE id = ?', [id]);
      res.json({ success: true, message: 'Warehouse removed successfully.', id });
    } catch (err) {
      next(err);
    }
  }
};
