import express from 'express';
import { dbAll, dbGet, dbRun } from '../database/db.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all bookings - if authenticated, return user's own bookings; admin gets all
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    let query = `
      SELECT b.*, u.name as customer_name, u.phone as customer_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user && req.user.role === 'admin') {
      // Admin sees all bookings
    } else if (req.user) {
      if (req.user.role === 'driver' || req.user.role === 'owner') {
        // Driver or Machinery Owner sees:
        // 1. Inquiries/bookings assigned to them as driver/owner
        // 2. Bookings for machinery they own
        // 3. Bookings they booked themselves
        query += ` AND (
          b.user_id = ? 
          OR b.owner_id = ? 
          OR b.owner LIKE ? 
          OR b.resourceId IN (SELECT id FROM tractors WHERE owner_id = ? OR ownerName LIKE ?)
          OR b.resourceId IN (SELECT id FROM equipment WHERE owner_id = ?)
        )`;
        params.push(
          req.user.id, 
          req.user.id, 
          `%${req.user.name}%`, 
          req.user.id, 
          `%${req.user.name}%`,
          req.user.id
        );
      } else {
        // Farmer sees their own booked requests
        query += ` AND b.user_id = ?`;
        params.push(req.user.id);
      }
    } else {
      // Unauthenticated guest sees no private bookings
      return res.json({ success: true, count: 0, data: [] });
    }

    query += ` ORDER BY b.createdAt DESC`;
    const bookings = await dbAll(query, params);

    // Normalize dual keys for universal frontend compatibility
    const normalized = bookings.map(b => {
      const isBookingOwner = Boolean(
        req.user && (
          b.owner_id === req.user.id || 
          (req.user.name && b.owner && b.owner.toLowerCase().includes(req.user.name.toLowerCase()))
        )
      );

      const isBookingCustomer = Boolean(req.user && b.user_id === req.user.id);

      return {
        ...b,
        id: b.id,
        user_id: b.user_id,
        owner_id: b.owner_id,
        item: b.item || b.item_name || 'Agri Equipment',
        item_name: b.item || b.item_name || 'Agri Equipment',
        itemName: b.item || b.item_name || 'Agri Equipment',
        type: b.type || b.item_type || 'Rental',
        item_type: b.type || b.item_type || 'Rental',
        itemType: b.type || b.item_type || 'Rental',
        owner: b.owner || b.driver_name || 'Verified Partner',
        driver_name: b.owner || b.driver_name || 'Verified Partner',
        driverName: b.owner || b.driver_name || 'Verified Partner',
        driver_phone: b.contact_phone || '+91 98220 11223',
        driverPhone: b.contact_phone || '+91 98220 11223',
        farmer_name: b.farmer_name || b.customer_name || 'Farmer Client',
        farmerName: b.farmer_name || b.customer_name || 'Farmer Client',
        farmer_phone: b.farmer_phone || b.customer_phone || b.contact_phone || '+91 98220 11223',
        farmerPhone: b.farmer_phone || b.customer_phone || b.contact_phone || '+91 98220 11223',
        startDate: b.startDate || b.start_date || '',
        start_date: b.startDate || b.start_date || '',
        endDate: b.endDate || b.end_date || b.startDate || '',
        end_date: b.endDate || b.end_date || b.startDate || '',
        duration: b.duration || '1 Day',
        price: b.price !== undefined ? b.price : (b.total_cost || 0),
        total_cost: b.price !== undefined ? b.price : (b.total_cost || 0),
        totalCost: b.price !== undefined ? b.price : (b.total_cost || 0),
        status: b.status || 'Upcoming',
        location: b.location || 'Maharashtra',
        contact_phone: b.contact_phone || '+91 98220 11223',
        image: b.image || '',
        notes: b.notes || '',
        isBookingOwner,
        isBookingCustomer
      };
    });

    res.json({ success: true, count: normalized.length, data: normalized });
  } catch (err) {
    next(err);
  }
});

// POST new booking with overlap conflict prevention - requires auth
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const item = req.body.item || req.body.itemName || req.body.item_name;
    const resourceId = req.body.resourceId || req.body.itemId || item;
    const type = req.body.type || req.body.itemType || req.body.item_type || 'Rental';
    let owner = req.body.owner || req.body.driverName || req.body.driver_name || 'Verified Partner';
    const sDate = req.body.startDate || req.body.start_date || req.body.date || new Date().toISOString().split('T')[0];
    const duration = req.body.duration || '1 Day';
    const eDate = req.body.endDate || req.body.end_date || sDate;
    const price = Number(req.body.price ?? req.body.totalPrice ?? req.body.totalCost ?? req.body.total_cost ?? 0);
    const location = req.body.location || req.user.location || 'Maharashtra';
    let contact_phone = req.body.contact_phone || req.body.driverPhone || req.body.driver_phone || req.body.ownerPhone || '+91 98230 44112';
    const notes = req.body.notes || '';
    const image = req.body.image || '';

    if (!item) {
      return res.status(400).json({ success: false, message: 'Item name is required for booking.' });
    }

    // Resolve owner details from tractor / equipment catalog if available
    let resolvedOwnerId = req.body.owner_id || null;
    try {
      const tr = await dbGet('SELECT * FROM tractors WHERE id = ? OR name = ?', [resourceId, item]);
      if (tr) {
        if (tr.owner_id) resolvedOwnerId = tr.owner_id;
        if (tr.ownerName) owner = tr.ownerName;
        if (tr.ownerPhone) contact_phone = tr.ownerPhone;
      } else {
        const eq = await dbGet('SELECT * FROM equipment WHERE id = ? OR name = ?', [resourceId, item]);
        if (eq && eq.owner_id) resolvedOwnerId = eq.owner_id;
      }
    } catch (lookupErr) {
      console.warn('Resource owner lookup notice:', lookupErr.message);
    }

    // Check for overlapping bookings for the same resource
    const existingConflict = await dbGet(
      `SELECT * FROM bookings 
       WHERE (resourceId = ? OR item = ?) 
         AND status NOT IN ('Cancelled', 'Completed') 
         AND (startDate <= ? AND endDate >= ?)`,
      [resourceId, item, eDate, sDate]
    );

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        error: `Booking Conflict: ${item} is already reserved between ${existingConflict.startDate} and ${existingConflict.endDate}. Please choose different dates.`
      });
    }

    const id = req.body.id && req.body.id.startsWith('BK-') ? req.body.id : `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = req.body.status || 'Upcoming';
    const farmerName = req.user?.name || req.body.farmer_name || 'Farmer Aman';
    const farmerPhone = req.user?.phone || req.body.farmer_phone || req.body.contact_phone || '+91 98220 11223';

    await dbRun(
      `INSERT INTO bookings (id, user_id, resourceId, item, type, owner, startDate, endDate, duration, price, status, location, contact_phone, image, notes, owner_id, farmer_name, farmer_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        req.user.id, 
        resourceId, 
        item, 
        type, 
        owner, 
        sDate, 
        eDate, 
        duration, 
        price, 
        status, 
        location, 
        contact_phone, 
        image, 
        notes, 
        resolvedOwnerId, 
        farmerName, 
        farmerPhone
      ]
    );

    // Increment tractor total bookings count
    try {
      await dbRun('UPDATE tractors SET totalBookings = totalBookings + 1 WHERE id = ? OR name = ?', [resourceId, item]);
    } catch {}

    const record = {
      id,
      user_id: req.user.id,
      owner_id: resolvedOwnerId,
      resourceId,
      item,
      item_name: item,
      itemName: item,
      type,
      item_type: type,
      itemType: type,
      owner,
      driver_name: owner,
      driverName: owner,
      driver_phone: contact_phone,
      farmer_name: farmerName,
      farmer_phone: farmerPhone,
      startDate: sDate,
      start_date: sDate,
      endDate: eDate,
      end_date: eDate,
      duration,
      price,
      total_cost: price,
      totalCost: price,
      status,
      location,
      contact_phone,
      image,
      notes
    };

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: record
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/status - update booking status (e.g. Completed, Active, Cancelled)
router.patch('/:id/status', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const booking = await dbGet(`SELECT * FROM bookings WHERE id = ?`, [id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const isOwnerOrDriver = 
      req.user.role === 'admin' ||
      req.user.role === 'owner' || 
      req.user.role === 'driver' || 
      (booking.owner && booking.owner.toLowerCase().includes(req.user.name.toLowerCase())) ||
      (booking.owner_id && booking.owner_id === req.user.id);

    const isCustomer = booking.user_id === req.user.id;

    if (!isOwnerOrDriver && !isCustomer) {
      return res.status(403).json({ success: false, message: 'Access denied: You are neither the customer nor the assigned driver/owner.' });
    }

    await dbRun(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: `Booking status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
});

// DELETE booking - user can cancel their own booking
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await dbGet(`SELECT * FROM bookings WHERE id = ?`, [id]);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only allow user to cancel own bookings, admin can cancel any
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await dbRun(`UPDATE bookings SET status = 'Cancelled' WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Booking cancelled.' });
  } catch (err) {
    next(err);
  }
});

export default router;
