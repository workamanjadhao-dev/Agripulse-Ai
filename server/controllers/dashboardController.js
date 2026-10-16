import { dbGet, dbAll } from '../database/db.js';
import { marketDataService } from '../services/marketDataService.js';
import { geminiService } from '../services/geminiService.js';

export const dashboardController = {
  // GET /api/dashboard
  async getDashboardSummary(req, res, next) {
    try {
      // 1. Dynamic Counts from Database
      const farmersCount = await dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'farmer'`);
      const buyersCount = await dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'buyer'`);
      const cropsCount = await dbGet(`SELECT COUNT(*) as count FROM crops`);
      const activeBuyerReqs = await dbGet(`SELECT COUNT(*) as count FROM buyers WHERE status = 'Active'`);
      const warehousesAvailable = await dbGet(`SELECT COUNT(*) as count FROM warehouses WHERE available_capacity > 0`);
      const vehiclesAvailable = await dbGet(`SELECT COUNT(*) as count FROM vehicles WHERE availability = 1 OR isAvailable = 1`);
      const bookingsCount = await dbGet(`SELECT COUNT(*) as count FROM bookings WHERE status != 'Cancelled'`);
      const forecastsGenerated = await dbGet(`SELECT COUNT(*) as count FROM forecasts`);

      // 2. Latest Real Crop Prices
      const latestPrices = await dbAll(`SELECT * FROM market_prices ORDER BY updated_at DESC, id DESC LIMIT 8`);

      // 3. Price Trends (Commodities and trends)
      const latestForecasts = await dbAll(`SELECT crop_name, market, current_price, forecast_15_day, trend, confidence FROM forecasts ORDER BY generated_at DESC LIMIT 5`);

      // 4. Data freshness and system telemetry
      const syncStatus = await marketDataService.getSyncStatus();

      // 5. Total Produce Quantities
      const produceSummary = await dbGet(`SELECT SUM(quantity) as totalQuintals FROM crops`);

      res.json({
        success: true,
        stats: {
          totalFarmers: farmersCount?.count || 0,
          totalBuyers: buyersCount?.count || 0,
          totalCrops: cropsCount?.count || 0,
          activeBuyerRequirements: activeBuyerReqs?.count || 0,
          availableWarehouses: warehousesAvailable?.count || 0,
          availableVehicles: vehiclesAvailable?.count || 0,
          activeBookings: bookingsCount?.count || 0,
          forecastsGenerated: forecastsGenerated?.count || 0,
          totalProduceQuintals: produceSummary?.totalQuintals || 0
        },
        marketData: {
          status: syncStatus.status,
          badge: syncStatus.badge,
          source: syncStatus.source,
          lastSync: syncStatus.lastSync,
          minutesAgo: syncStatus.minutesAgo,
          recordsCount: latestPrices.length
        },
        gemini: {
          configured: geminiService.isConfigured()
        },
        latestPrices,
        latestForecasts
      });
    } catch (err) {
      next(err);
    }
  }
};
