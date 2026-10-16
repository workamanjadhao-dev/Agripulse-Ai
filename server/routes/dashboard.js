import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

// GET dynamic dashboard statistics and telemetry
router.get('/', dashboardController.getDashboardSummary);

export default router;
