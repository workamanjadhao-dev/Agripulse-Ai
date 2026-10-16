import express from 'express';
import { aiController } from '../controllers/aiController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Grounded AI Chat Assistant Endpoint - optional auth (saves history if authenticated)
router.post('/chat', optionalAuth, aiController.chat);

// Grounded AI Crop Price Forecast Endpoint
router.post('/forecast', optionalAuth, aiController.forecast);

// Grounded AI Sell / Hold Decision Endpoint
router.post('/sell-decision', optionalAuth, aiController.sellDecision);

// GET conversation history - requires authentication
router.get('/history', verifyToken, aiController.getHistory);

export default router;
