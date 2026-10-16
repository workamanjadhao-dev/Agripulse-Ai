import { dbAll, dbGet, dbRun } from '../database/db.js';

export const vehicleController = {
  // GET /api/vehicles
  async getAllVehicles(req, res, next) {
    try {
      const { location, vehicle_type, minCapacity, availability, search } = req.query;
      let query = `SELECT * FROM vehicles WHERE 1=1`;
      const params = [];

      if (location && location !== 'All') {
        query += ` AND location LIKE ?`;
        params.push(`%${location}%`);
      }
      if (vehicle_type && vehicle_type !== 'All') {
        query += ` AND vehicle_type LIKE ?`;
        params.push(`%${vehicle_type}%`);
      }
      if (minCapacity) {
        query += ` AND (capacity >= ? OR capacityQuintals >= ?)`;
        params.push(Number(minCapacity), Number(minCapacity));
      }
      if (availability !== undefined && availability !== 'All') {
        const availNum = (availability === 'true' || availability === '1') ? 1 : 0;
        query += ` AND availability = ?`;
        params.push(availNum);
      }
      if (search) {
        query += ` AND (vehicle_name LIKE ? OR title LIKE ? OR driver_name LIKE ? OR location LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY rating DESC, created_at DESC`;
      const vehicles = await dbAll(query, params);

      const formatted = vehicles.map(v => ({
        id: v.id,
        owner_id: v.owner_id,
        vehicle_type: v.vehicle_type,
        vehicle_name: v.vehicle_name || v.title,
        title: v.title || v.vehicle_name,
        type: v.vehicle_type,
        location: v.location,
        capacity: v.capacity || v.capacityQuintals,
        capacityQuintals: v.capacityQuintals || v.capacity,
        rental_price: v.rental_price || v.base_price,
        rate_per_km: v.rate_per_km || v.ratePerKm || 18,
        ratePerKm: v.ratePerKm || v.rate_per_km || 18,
        base_price: v.base_price || v.basePrice || 600,
        basePrice: v.basePrice || v.base_price || 600,
        availability: Boolean(v.availability),
        isAvailable: Boolean(v.isAvailable !== undefined ? v.isAvailable : v.availability),
        latitude: v.latitude,
        longitude: v.longitude,
        driver_name: v.driver_name || v.driverName,
        driverName: v.driverName || v.driver_name,
        driver_phone: v.driver_phone || v.driverPhone,
        driverPhone: v.driverPhone || v.driver_phone,
        rating: v.rating || 4.8,
        image: v.image || 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=600&auto=format&fit=crop&q=80',
        created_at: v.created_at
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

  // GET /api/vehicles/:id
  async getVehicleById(req, res, next) {
    try {
      const { id } = req.params;
      const v = await dbGet(`SELECT * FROM vehicles WHERE id = ?`, [id]);
      if (!v) {
        return res.status(404).json({ success: false, message: `Vehicle ${id} not found.` });
      }

      res.json({
        success: true,
        data: {
          ...v,
          title: v.title || v.vehicle_name,
          capacityQuintals: v.capacityQuintals || v.capacity,
          ratePerKm: v.ratePerKm || v.rate_per_km,
          basePrice: v.basePrice || v.base_price,
          driverName: v.driverName || v.driver_name,
          driverPhone: v.driverPhone || v.driver_phone,
          isAvailable: Boolean(v.isAvailable !== undefined ? v.isAvailable : v.availability)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/vehicles
  async createVehicle(req, res, next) {
    try {
      const {
        owner_id,
        vehicle_type,
        vehicle_name,
        location,
        capacity,
        rental_price,
        rate_per_km = 18,
        base_price = 600,
        availability = 1,
        driver_name,
        driver_phone,
        image
      } = req.body;

      if (!vehicle_type || !vehicle_name || !location || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'vehicle_type, vehicle_name, location, and capacity are required.'
        });
      }

      const id = `vh-${Date.now()}`;
      const defaultImg = image || 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=600&auto=format&fit=crop&q=80';

      await dbRun(
        `INSERT INTO vehicles 
         (id, owner_id, vehicle_type, vehicle_name, title, location, capacity, capacityQuintals, rental_price, rate_per_km, ratePerKm, base_price, basePrice, availability, isAvailable, driver_name, driverName, driver_phone, driverPhone, rating, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, (req && req.user ? req.user.id : owner_id) || owner_id || null, vehicle_type, vehicle_name, vehicle_name,
          location, Number(capacity), Number(capacity), Number(rental_price || base_price),
          Number(rate_per_km), Number(rate_per_km), Number(base_price), Number(base_price),
          Number(availability), Number(availability), driver_name || 'Verified Driver', driver_name || 'Verified Driver',
          driver_phone || '+91 98000 00000', driver_phone || '+91 98000 00000', 4.8, defaultImg
        ]
      );

      const created = await dbGet(`SELECT * FROM vehicles WHERE id = ?`, [id]);
      res.status(201).json({ success: true, message: 'Vehicle registered successfully.', data: created });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/vehicles/:id
  async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;
      await dbRun('DELETE FROM vehicles WHERE id = ?', [id]);
      res.json({ success: true, message: 'Vehicle removed successfully.', id });
    } catch (err) {
      next(err);
    }
  }
};
