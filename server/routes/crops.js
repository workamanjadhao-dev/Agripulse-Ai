import express from 'express';
import { cropController } from '../controllers/cropController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all crops - optional auth; if authenticated farmer, returns own crops only; if admin, returns all; if no auth/buyer, returns publicly visible crops
router.get('/', optionalAuth, cropController.getAllCrops);

// POST create new crop - requires auth (farmer or admin only)
router.post('/', verifyToken, cropController.createCrop);

// GET crop by ID - optional auth
router.get('/:id', optionalAuth, cropController.getCropById);

// PUT update crop by ID - requires auth
router.put('/:id', verifyToken, cropController.updateCrop);

// DELETE crop by ID - requires auth
router.delete('/:id', verifyToken, cropController.deleteCrop);

export default router;
