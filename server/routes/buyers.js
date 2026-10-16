import express from 'express';
import { buyerController } from '../controllers/buyerController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all buyers - optional auth (public marketplace browsing)
router.get('/', optionalAuth, buyerController.getAllBuyers);

// POST create buyer requirement listing - requires auth
router.post('/', verifyToken, buyerController.createBuyer);

// GET buyer by ID - optional auth
router.get('/:id', optionalAuth, buyerController.getBuyerById);

// PUT update buyer requirement by ID - requires auth
router.put('/:id', verifyToken, buyerController.updateBuyer);

// DELETE buyer requirement by ID - requires auth
router.delete('/:id', verifyToken, buyerController.deleteBuyer);

export default router;
