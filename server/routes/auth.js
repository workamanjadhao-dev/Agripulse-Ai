import express from 'express';
import { authController } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no token required)
router.post('/signup', authController.signup);
router.post('/register', authController.signup);   // backward compatibility alias
router.post('/login', authController.login);
router.post('/logout', authController.logout);      // JWT logout is client-side, but endpoint for completeness

// Protected routes (require valid JWT)
router.get('/me', verifyToken, authController.getMe);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

export default router;
