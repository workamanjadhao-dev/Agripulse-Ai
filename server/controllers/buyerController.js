import { dbAll, dbGet, dbRun } from '../database/db.js';

export const buyerController = {
  // GET /api/buyers
  async getAllBuyers(req, res, next) {
    try {
      const { crop, location, status, search, my_requirements } = req.query;
      let query = `SELECT b.*, u.name as buyer_user_name FROM buyers b LEFT JOIN users u ON b.user_id = u.id WHERE 1=1`;
      const params = [];

      // If authenticated buyer requesting their own requirements
      if (req.user && req.user.role === 'buyer' && my_requirements === 'true') {
        query += ` AND b.user_id = ?`;
        params.push(req.user.id);
      }

      if (crop && crop !== 'All') {
        query += ` AND b.crop_required LIKE ?`;
        params.push(`%${crop}%`);
      }
      if (location && location !== 'All') {
        query += ` AND b.location LIKE ?`;
        params.push(`%${location}%`);
      }
      if (status && status !== 'All') {
        query += ` AND b.status = ?`;
        params.push(status);
      }
      if (search) {
        query += ` AND (b.business_name LIKE ? OR b.crop_required LIKE ? OR b.location LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY b.created_at DESC`;
      const buyers = await dbAll(query, params);

      res.json({
        success: true,
        count: buyers.length,
        data: buyers
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/buyers/:id
  async getBuyerById(req, res, next) {
    try {
      const { id } = req.params;
      const buyer = await dbGet(`SELECT b.*, u.name as buyer_user_name FROM buyers b LEFT JOIN users u ON b.user_id = u.id WHERE b.id = ?`, [id]);
      if (!buyer) {
        return res.status(404).json({ success: false, message: `Buyer listing ${id} not found.` });
      }
      res.json({ success: true, data: buyer });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/buyers
  async createBuyer(req, res, next) {
    try {
      const {
        business_name,
        crop_required,
        quantity_required,
        location,
        price_offered,
        status = 'Active',
        contact_phone,
        notes
      } = req.body;

      if (!business_name || !crop_required || !quantity_required || !price_offered || !location) {
        return res.status(400).json({
          success: false,
          message: 'business_name, crop_required, quantity_required, location, and price_offered are required.'
        });
      }

      // Use authenticated user's ID (never trust client-provided user_id)
      const userId = req.user.id;

      const id = `byr-${Date.now()}`;
      await dbRun(
        `INSERT INTO buyers 
         (id, user_id, business_name, crop_required, quantity_required, location, price_offered, status, contact_phone, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, userId, business_name, crop_required,
          Number(quantity_required), location, Number(price_offered),
          status, contact_phone || req.user.phone || '+91 98220 00000', notes || ''
        ]
      );

      const created = await dbGet(`SELECT * FROM buyers WHERE id = ?`, [id]);
      res.status(201).json({ success: true, message: 'Buyer requirement listing created successfully.', data: created });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/buyers/:id
  async updateBuyer(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await dbGet(`SELECT * FROM buyers WHERE id = ?`, [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Buyer listing ${id} not found.` });
      }

      // Authorization: buyers can only update their own listings (admins can update any)
      if (req.user.role === 'buyer' && existing.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own requirements.' });
      }

      const {
        business_name = existing.business_name,
        crop_required = existing.crop_required,
        quantity_required = existing.quantity_required,
        location = existing.location,
        price_offered = existing.price_offered,
        status = existing.status,
        contact_phone = existing.contact_phone,
        notes = existing.notes
      } = req.body;

      await dbRun(
        `UPDATE buyers SET
         business_name = ?, crop_required = ?, quantity_required = ?, location = ?,
         price_offered = ?, status = ?, contact_phone = ?, notes = ?
         WHERE id = ?`,
        [
          business_name, crop_required, Number(quantity_required), location,
          Number(price_offered), status, contact_phone, notes, id
        ]
      );

      const updated = await dbGet(`SELECT * FROM buyers WHERE id = ?`, [id]);
      res.json({ success: true, message: 'Buyer listing updated successfully.', data: updated });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/buyers/:id
  async deleteBuyer(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await dbGet(`SELECT * FROM buyers WHERE id = ?`, [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Buyer listing ${id} not found.` });
      }

      // Authorization
      if (req.user.role === 'buyer' && existing.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own requirements.' });
      }

      await dbRun(`DELETE FROM buyers WHERE id = ?`, [id]);
      res.json({ success: true, message: `Buyer listing ${id} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }
};
