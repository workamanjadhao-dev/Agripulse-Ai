import express from 'express';
import { forecastController } from '../controllers/forecastController.js';

const router = express.Router();

// GET all latest stored forecasts
router.get('/', forecastController.getLatestForecasts);

// GET forecast for a specific crop
router.get('/:crop', forecastController.getForecastByCrop);

// POST generate new forecast
router.post('/', forecastController.generateForecast);

export default router;
