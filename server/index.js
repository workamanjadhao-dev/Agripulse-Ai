import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initDatabase } from './database/schema.js';
import { marketDataService } from './services/marketDataService.js';
import { geminiService } from './services/geminiService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import cropsRoutes from './routes/crops.js';
import marketPricesRoutes from './routes/marketPrices.js';
import forecastRoutes from './routes/forecast.js';
import buyersRoutes from './routes/buyers.js';
import warehousesRoutes from './routes/warehouses.js';
import vehiclesRoutes from './routes/vehicles.js';
import matchesRoutes from './routes/matches.js';
import aiRoutes from './routes/ai.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import bookingsRoutes from './routes/bookings.js';
import alertsRoutes from './routes/alerts.js';
import rentalsRoutes from './routes/rentals.js';
import marketsRoutes from './routes/markets.js';
import myCropsRoutes from './routes/myCrops.js';
import adminRoutes from './routes/admin.js';
import weatherRoutes from './routes/weather.js';

const app = express();
const PORT = config.port;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize SQLite database, seed tables, and run initial market data synchronization
initDatabase()
  .then(() => marketDataService.syncMarketData())
  .catch(err => {
    console.error('❌ Database initialization error:', err.message);
  });

// Periodic Automatic Background Real-Time Market Data Refresh (Every 3 minutes)
setInterval(() => {
  marketDataService.syncMarketData().catch(console.error);
}, 3 * 60 * 1000);

// Health Telemetry Endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    const syncStatus = await marketDataService.getSyncStatus();
    res.json({
      server: "healthy",
      database: "connected",
      marketData: {
        status: syncStatus.status === 'live' ? 'connected' : 'cached',
        badge: syncStatus.badge,
        lastSync: syncStatus.lastSync,
        minutesAgo: syncStatus.minutesAgo,
        source: syncStatus.source
      },
      gemini: {
        configured: geminiService.isConfigured()
      }
    });
  } catch (err) {
    next(err);
  }
});

// API Routes Mounted as Required
app.use('/api/crops', cropsRoutes);
app.use('/api/market-prices', marketPricesRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/buyers', buyersRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Retained existing routes for full backwards compatibility
app.use('/api/bookings', bookingsRoutes);
app.use('/api/price-alerts', alertsRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/markets', marketsRoutes);
app.use('/api/my-crops', myCropsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);

// 404 Handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist.`
  });
});

// Centralized Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AgriPulse REST API Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI Status: ${geminiService.isConfigured() ? 'Configured ✅' : 'Missing (Using Local Knowledge Grounding Engine)'}`);
});

export default app;
