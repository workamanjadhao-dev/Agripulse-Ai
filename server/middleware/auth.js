import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { dbGet } from '../database/db.js';

/**
 * Middleware: Verify JWT token from Authorization header (Bearer) or cookie.
 * Attaches req.user with the authenticated user's safe data.
 */
export async function verifyToken(req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // 2. Fallback: check cookie (for future cookie-based sessions)
    if (!token && req.cookies && req.cookies.agri_token) {
      token = req.cookies.agri_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user from DB to ensure they still exist and get latest role & farmland/profile
    const user = await dbGet(
      `SELECT * FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User account not found.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
}

/**
 * Middleware factory: Require a specific role (or one of several roles).
 * Usage: requireRole('admin'), requireRole('admin', 'farmer')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
      });
    }

    next();
  };
}

/**
 * Optional Auth: Attach user if token present, but don't block if missing.
 * Useful for routes that have optional auth (e.g., public + private data).
 */
export async function optionalAuth(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      return next(); // No token is fine
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await dbGet(
      `SELECT * FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (user) {
      req.user = user;
    }
  } catch {
    // Invalid token is silently ignored for optional auth
  }

  next();
}
