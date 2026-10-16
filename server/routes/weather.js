import express from 'express';
import { weatherService } from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /api/weather
 * Query parameters:
 *   location: string (e.g. 'Nagpur', 'Wardha', 'Nashik')
 *   lat: number (optional custom latitude)
 *   lon: number (optional custom longitude)
 */
router.get('/', async (req, res, next) => {
  try {
    const { location, lat, lon, pastDays } = req.query;
    const customLat = lat ? parseFloat(lat) : null;
    const customLon = lon ? parseFloat(lon) : null;
    const pastDaysNum = pastDays ? parseInt(pastDays, 10) : 14;

    const data = await weatherService.getWeather(location || 'Nagpur', customLat, customLon, pastDaysNum);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/weather/search
 * Search any location/city/town/village/mandi across India
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await weatherService.searchIndiaLocations(q || '');
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/weather/reverse
 * Reverse geocode latitude and longitude to Indian address
 */
router.get('/reverse', async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }
    const info = await weatherService.reverseGeocode(parseFloat(lat), parseFloat(lon));
    res.json({
      success: true,
      data: info
    });
  } catch (err) {
    next(err);
  }
});

export default router;
