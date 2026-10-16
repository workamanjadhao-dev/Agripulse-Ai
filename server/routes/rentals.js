import express from 'express';
import { dbAll, dbGet, dbRun } from '../database/db.js';
import { optionalAuth, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all tractors with live occupancy status from active bookings & ownership detection
router.get('/tractors', optionalAuth, async (req, res) => {
  try {
    const tractors = await dbAll('SELECT * FROM tractors ORDER BY ROWID DESC');
    
    // Fetch currently active or upcoming bookings to compute live occupied state
    const today = new Date().toISOString().split('T')[0];
    const activeBookings = await dbAll(
      `SELECT id, resourceId, item, startDate, endDate, status, user_id, owner_id, farmer_name, farmer_phone, duration
       FROM bookings 
       WHERE status IN ('Upcoming', 'Active')`
    );

    const formatted = tractors.map(t => {
      // Find matching bookings for this tractor
      const matchingBookings = activeBookings.filter(b => 
        b.resourceId === t.id || 
        (b.item && t.name && b.item.toLowerCase() === t.name.toLowerCase())
      );

      // Check if there is an active on-field booking or current-day reservation
      const currentActive = matchingBookings.find(b => 
        b.status === 'Active' || (b.startDate <= today && b.endDate >= today)
      );

      // Upcoming booking reservation
      const upcomingBooking = matchingBookings.find(b => b.startDate > today);

      const isBaseAvailable = Boolean(t.isAvailable);
      const isOccupied = !isBaseAvailable || Boolean(currentActive);

      let occupiedReason = '';
      if (!isBaseAvailable) {
        occupiedReason = 'Offline / In Maintenance';
      } else if (currentActive) {
        occupiedReason = `Occupied (Reserved until ${currentActive.endDate})`;
      } else if (upcomingBooking) {
        occupiedReason = `Reserved from ${upcomingBooking.startDate}`;
      }

      // Check if current user is owner/creator or admin
      const isOwner = Boolean(
        req.user && (
          req.user.role === 'admin' ||
          (t.owner_id && t.owner_id === req.user.id) ||
          (req.user.name && t.ownerName && t.ownerName.toLowerCase().includes(req.user.name.toLowerCase()))
        )
      );

      return {
        ...t,
        implementsIncluded: JSON.parse(t.implementsIncluded || '[]'),
        isAvailable: isBaseAvailable,
        isOccupied: isOccupied,
        occupiedReason: occupiedReason,
        currentBooking: currentActive || null,
        upcomingBookings: matchingBookings,
        isOwner: isOwner
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new tractor listing
router.post('/tractors', optionalAuth, async (req, res) => {
  try {
    const {
      name,
      brand,
      hp = 45,
      ratePerHour = 450,
      ratePerDay = 3200,
      ownerName = 'Verified Fleet Partner',
      ownerPhone = '+91 98230 44112',
      location = 'Nagpur, Maharashtra',
      distanceKm = 5.0,
      rating = 4.9,
      totalBookings = 0,
      isAvailable = true,
      implementsIncluded = [],
      image,
      owner_id
    } = req.body;

    const id = req.body.id || `tr-${Date.now()}`;
    const implementsJson = JSON.stringify(Array.isArray(implementsIncluded) ? implementsIncluded : []);
    const ownerId = (req && req.user ? req.user.id : null) || owner_id || null;
    const finalOwnerName = (req && req.user && req.user.name) ? req.user.name : ownerName;
    const finalOwnerPhone = (req && req.user && req.user.phone) ? req.user.phone : ownerPhone;

    await dbRun(
      `INSERT INTO tractors (id, owner_id, name, brand, hp, ratePerHour, ratePerDay, ownerName, ownerPhone, location, distanceKm, rating, totalBookings, isAvailable, implementsIncluded, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ownerId,
        name,
        brand || 'Mahindra',
        Number(hp),
        Number(ratePerHour),
        Number(ratePerDay),
        finalOwnerName,
        finalOwnerPhone,
        location,
        Number(distanceKm),
        Number(rating),
        Number(totalBookings),
        isAvailable ? 1 : 0,
        implementsJson,
        image || 'https://images.unsplash.com/photo-1530267981608-bc70a2796de6?w=600&auto=format&fit=crop&q=80'
      ]
    );

    res.status(201).json({
      id,
      owner_id: ownerId,
      name,
      brand: brand || 'Mahindra',
      hp: Number(hp),
      ratePerHour: Number(ratePerHour),
      ratePerDay: Number(ratePerDay),
      ownerName: finalOwnerName,
      ownerPhone: finalOwnerPhone,
      location,
      distanceKm: Number(distanceKm),
      rating: Number(rating),
      totalBookings: Number(totalBookings),
      isAvailable: Boolean(isAvailable),
      isOccupied: !Boolean(isAvailable),
      isOwner: true,
      implementsIncluded: Array.isArray(implementsIncluded) ? implementsIncluded : [],
      image: image || 'https://images.unsplash.com/photo-1530267981608-bc70a2796de6?w=600&auto=format&fit=crop&q=80'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tractors/:id/availability - ONLY Owner or Admin can update availability
router.patch('/tractors/:id/availability', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tractor = await dbGet('SELECT * FROM tractors WHERE id = ?', [id]);
    if (!tractor) {
      return res.status(404).json({ error: 'Tractor listing not found.' });
    }

    const isOwner = Boolean(
      req.user.role === 'admin' ||
      (tractor.owner_id && tractor.owner_id === req.user.id) ||
      (req.user.name && tractor.ownerName && tractor.ownerName.toLowerCase().includes(req.user.name.toLowerCase()))
    );

    if (!isOwner) {
      return res.status(403).json({ 
        error: `Permission Denied: Only the owner (${tractor.ownerName || 'driver'}) can update availability for this tractor.` 
      });
    }

    const newAvailable = req.body.isAvailable !== undefined 
      ? (req.body.isAvailable ? 1 : 0) 
      : (tractor.isAvailable ? 0 : 1);

    await dbRun('UPDATE tractors SET isAvailable = ? WHERE id = ?', [newAvailable, id]);

    res.json({
      success: true,
      id,
      isAvailable: Boolean(newAvailable),
      message: `Tractor availability updated to ${newAvailable ? 'Available' : 'Occupied / Unavailable'}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tractor listing - ONLY Owner or Admin can remove
router.delete('/tractors/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tractor = await dbGet('SELECT * FROM tractors WHERE id = ?', [id]);
    if (!tractor) {
      return res.status(404).json({ error: 'Tractor listing not found.' });
    }

    const isOwner = Boolean(
      req.user.role === 'admin' ||
      (tractor.owner_id && tractor.owner_id === req.user.id) ||
      (req.user.name && tractor.ownerName && tractor.ownerName.toLowerCase().includes(req.user.name.toLowerCase()))
    );

    if (!isOwner) {
      return res.status(403).json({ 
        error: `Permission Denied: Only the owner (${tractor.ownerName || 'driver'}) can remove this tractor listing.` 
      });
    }

    await dbRun('DELETE FROM tractors WHERE id = ?', [id]);
    res.json({ success: true, message: 'Tractor listing removed successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all equipment
router.get('/equipment', async (req, res) => {
  try {
    const equipment = await dbAll('SELECT * FROM equipment ORDER BY ROWID DESC');
    const formatted = equipment.map(e => ({
      ...e,
      isAvailable: Boolean(e.isAvailable)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new equipment listing
router.post('/equipment', optionalAuth, async (req, res) => {
  try {
    const {
      name,
      category = 'Rotavator',
      brand = 'Shaktiman',
      requiredHp = '45 HP',
      ratePerDay = 1200,
      location = 'Nagpur, Maharashtra',
      distanceKm = 8.0,
      rating = 4.8,
      suitability = 'High-efficiency agricultural implement.',
      image,
      isAvailable = true,
      owner_id
    } = req.body;

    const id = req.body.id || `eq-${Date.now()}`;
    const defaultImg = image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80';
    const ownerId = (req && req.user ? req.user.id : null) || owner_id || null;

    await dbRun(
      `INSERT INTO equipment (id, owner_id, name, category, brand, requiredHp, ratePerDay, location, distanceKm, rating, suitability, image, isAvailable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ownerId,
        name,
        category,
        brand,
        requiredHp,
        Number(ratePerDay),
        location,
        Number(distanceKm),
        Number(rating),
        suitability,
        defaultImg,
        isAvailable ? 1 : 0
      ]
    );

    res.status(201).json({
      id,
      name,
      category,
      brand,
      requiredHp,
      ratePerDay: Number(ratePerDay),
      location,
      distanceKm: Number(distanceKm),
      rating: Number(rating),
      suitability,
      image: defaultImg,
      isAvailable: Boolean(isAvailable)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE equipment listing
router.delete('/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM equipment WHERE id = ?', [id]);
    res.json({ success: true, message: 'Equipment listing removed successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await dbAll('SELECT * FROM vehicles');
    const formatted = vehicles.map(v => ({
      ...v,
      isAvailable: Boolean(v.isAvailable)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all cold storages
router.get('/storages', async (req, res) => {
  try {
    const storages = await dbAll('SELECT * FROM storages');
    const formatted = storages.map(s => ({
      ...s,
      suitableFor: JSON.parse(s.suitableFor || '[]')
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
