import express from 'express';
import { matchController } from '../controllers/matchController.js';

const router = express.Router();

// GET algorithmic farmer-buyer matches
router.get('/', matchController.getFarmerBuyerMatches);

export default router;
