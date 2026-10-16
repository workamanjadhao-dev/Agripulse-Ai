import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../database/db.js';
import { config } from '../config/index.js';

// Salt rounds for bcrypt (12 is strong; 10 is standard, 12 for extra security)
const SALT_ROUNDS = 12;

// Roles that cannot be created via public signup
const ADMIN_ONLY_ROLES = ['admin'];

// Helper: generate JWT token for a user
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

// Helper: return safe user object (never expose password_hash)
function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location || '',
    phone: user.phone || '',
    farm_land: user.farm_land || user.farmLand || '',
    farmLand: user.farm_land || user.farmLand || '',
    farm_size_acres: user.farm_size_acres !== undefined ? user.farm_size_acres : (user.farmSizeAcres || null),
    soil_type: user.soil_type || user.soilType || '',
    soilType: user.soil_type || user.soilType || '',
    primary_commodities: user.primary_commodities || user.primaryCommodities || '',
    primaryCommodities: user.primary_commodities || user.primaryCommodities || '',
    business_name: user.business_name || user.businessName || '',
    businessName: user.business_name || user.businessName || '',
    default_mandi: user.default_mandi || user.defaultMandi || 'Nagpur APMC',
    defaultMandi: user.default_mandi || user.defaultMandi || 'Nagpur APMC',
    created_at: user.created_at
  };
}

export const authController = {

  // POST /api/auth/signup  (also available as /api/auth/register for backward compat)
  async signup(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role = 'farmer',
        location,
        phone,
        farm_land,
        farmLand,
        farm_size_acres,
        farmSizeAcres,
        soil_type,
        soilType,
        primary_commodities,
        primaryCommodities,
        business_name,
        businessName,
        default_mandi,
        defaultMandi
      } = req.body;

      // --- Validation ---
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }
      if (!location || !location.trim()) {
        return res.status(400).json({ success: false, message: 'Location is required.' });
      }

      // Block admin role creation via public signup
      if (ADMIN_ONLY_ROLES.includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Admin accounts cannot be created through public registration.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existing = await dbGet(`SELECT id FROM users WHERE email = ?`, [normalizedEmail]);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered. Please log in or use a different email.'
        });
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user ID
      const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const finalFarmLand = farm_land || farmLand || (role === 'farmer' ? `${location.trim()} Farm` : '');
      const finalFarmSizeAcres = farm_size_acres !== undefined && farm_size_acres !== '' ? Number(farm_size_acres) : (farmSizeAcres !== undefined && farmSizeAcres !== '' ? Number(farmSizeAcres) : (role === 'farmer' ? 3.0 : null));
      const finalSoilType = soil_type || soilType || (role === 'farmer' ? 'Black Cotton Soil' : '');
      const finalPrimaryCommodities = primary_commodities || primaryCommodities || '';
      const finalBusinessName = business_name || businessName || (role === 'farmer' ? `${name.trim()} Agro Farm` : `${name.trim()} Logistics & Trade`);
      const finalDefaultMandi = default_mandi || defaultMandi || 'Nagpur APMC';

      // Insert into DB
      await dbRun(
        `INSERT INTO users (id, name, email, password, role, location, phone, farm_land, farm_size_acres, soil_type, primary_commodities, business_name, default_mandi, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          id,
          name.trim(),
          normalizedEmail,
          passwordHash,
          role,
          location.trim(),
          (phone || '').trim(),
          finalFarmLand,
          finalFarmSizeAcres,
          finalSoilType,
          finalPrimaryCommodities,
          finalBusinessName,
          finalDefaultMandi
        ]
      );

      // Fetch the created user
      const user = await dbGet(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );

      // Generate JWT
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: safeUser(user)
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Find user (include password hash for comparison, supporting both demo aliases)
      const user = await dbGet(
        `SELECT * FROM users WHERE email = ? OR (email = 'suresh@agripulse.in' AND ? = 'farmer2@agripulse.in') OR (email = 'farmer2@agripulse.in' AND ? = 'suresh@agripulse.in')`,
        [normalizedEmail, normalizedEmail, normalizedEmail]
      );
      if (!user) {
        // Generic message to prevent user enumeration
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.'
        });
      }

      // Compare password against hash
      // Handle legacy plaintext demo passwords (seeded before bcrypt was added)
      let passwordValid = false;
      if (user.password && user.password.startsWith('$2')) {
        // bcrypt hash - proper comparison
        passwordValid = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plaintext (seed data) - compare directly then migrate to hash
        passwordValid = (user.password === password);
        if (passwordValid) {
          // Migrate to bcrypt on first successful login
          const newHash = await bcrypt.hash(password, SALT_ROUNDS);
          await dbRun(`UPDATE users SET password = ? WHERE id = ?`, [newHash, user.id]);
          console.log(`🔒 Migrated password to bcrypt hash for user: ${user.email}`);
        }
      }

      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.'
        });
      }

      // Generate JWT
      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: safeUser(user)
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/logout
  async logout(req, res) {
    // For JWT, logout is client-side (discard token).
    // If using cookies, we'd clear the cookie here.
    res.json({
      success: true,
      message: 'Logged out successfully. Please discard your token.'
    });
  },

  // GET /api/auth/me  (requires verifyToken middleware)
  async getMe(req, res, next) {
    try {
      // req.user is already attached by verifyToken middleware
      return res.json({
        success: true,
        user: safeUser(req.user)
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/profile  (authenticated, returns current user's profile)
  async getProfile(req, res, next) {
    try {
      const userId = req.user ? req.user.id : req.query.userId;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID required.' });
      }

      const user = await dbGet(
        `SELECT * FROM users WHERE id = ?`,
        [userId]
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      return res.json({ success: true, data: safeUser(user) });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/auth/profile  (authenticated, update own profile)
  async updateProfile(req, res, next) {
    try {
      const userId = req.user ? req.user.id : req.body.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID required.' });
      }

      const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [userId]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const {
        name,
        location,
        phone,
        farm_land,
        farmLand,
        farm_size_acres,
        farmSizeAcres,
        soil_type,
        soilType,
        primary_commodities,
        primaryCommodities,
        business_name,
        businessName,
        default_mandi,
        defaultMandi,
        role
      } = req.body;

      const updatedFarmLand = farm_land !== undefined ? farm_land : (farmLand !== undefined ? farmLand : user.farm_land);
      const updatedFarmSize = farm_size_acres !== undefined && farm_size_acres !== '' ? Number(farm_size_acres) : (farmSizeAcres !== undefined && farmSizeAcres !== '' ? Number(farmSizeAcres) : user.farm_size_acres);
      const updatedSoilType = soil_type !== undefined ? soil_type : (soilType !== undefined ? soilType : user.soil_type);
      const updatedCommodities = primary_commodities !== undefined ? primary_commodities : (primaryCommodities !== undefined ? primaryCommodities : user.primary_commodities);
      const updatedBusinessName = business_name !== undefined ? business_name : (businessName !== undefined ? businessName : user.business_name);
      const updatedDefaultMandi = default_mandi !== undefined ? default_mandi : (defaultMandi !== undefined ? defaultMandi : user.default_mandi);
      const updatedRole = role || user.role;

      await dbRun(
        `UPDATE users SET 
          name = ?, 
          location = ?, 
          phone = ?,
          farm_land = ?,
          farm_size_acres = ?,
          soil_type = ?,
          primary_commodities = ?,
          business_name = ?,
          default_mandi = ?,
          role = ?
         WHERE id = ?`,
        [
          name !== undefined ? name : user.name,
          location !== undefined ? location : user.location,
          phone !== undefined ? phone : user.phone,
          updatedFarmLand,
          updatedFarmSize,
          updatedSoilType,
          updatedCommodities,
          updatedBusinessName,
          updatedDefaultMandi,
          updatedRole,
          userId
        ]
      );

      const updated = await dbGet(
        `SELECT * FROM users WHERE id = ?`,
        [userId]
      );

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: safeUser(updated)
      });
    } catch (err) {
      next(err);
    }
  }
};
