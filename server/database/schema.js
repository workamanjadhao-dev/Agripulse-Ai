import { dbRun, dbGet, dbAll } from './db.js';

export async function initDatabase() {
  console.log('🌱 Initializing Complete SQLite Schema with Foreign Keys & Proper Constraints...');

  // Safe migration check for existing pre-migration tables
  try {
    const cropColumns = await dbAll(`PRAGMA table_info(crops)`);
    if (cropColumns.length > 0 && !cropColumns.some(c => c.name === 'farmer_id')) {
      console.log('🔄 Upgrading crops table schema to match Phase 3 requirements...');
      await dbRun(`DROP TABLE IF EXISTS crops`);
    }

    const vehColumns = await dbAll(`PRAGMA table_info(vehicles)`);
    if (vehColumns.length > 0 && !vehColumns.some(c => c.name === 'vehicle_type')) {
      console.log('🔄 Upgrading vehicles table schema to match Phase 3 requirements...');
      await dbRun(`DROP TABLE IF EXISTS vehicles`);
    }

    const mpColumns = await dbAll(`PRAGMA table_info(market_prices)`);
    if (mpColumns.length > 0 && !mpColumns.some(c => c.name === 'crop_name')) {
      console.log('🔄 Upgrading market_prices table schema to match Phase 3 requirements...');
      await dbRun(`DROP TABLE IF EXISTS market_prices`);
    }
  } catch (migErr) {
    console.warn('Migration check notice:', migErr.message);
  }

  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT,
      phone TEXT,
      farm_land TEXT,
      farm_size_acres REAL,
      soil_type TEXT,
      primary_commodities TEXT,
      business_name TEXT,
      default_mandi TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Add columns to users table if they don't exist yet
  // Migration: Add user farmland and profile fields
  const userColumns = await dbAll(`PRAGMA table_info(users)`);
  const cols = userColumns.map(c => c.name);
  if (!cols.includes('updated_at')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN updated_at DATETIME`); } catch (_) {}
  }
  if (!cols.includes('farm_land')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN farm_land TEXT`); } catch (_) {}
  }
  if (!cols.includes('farm_size_acres')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN farm_size_acres REAL`); } catch (_) {}
  }
  if (!cols.includes('soil_type')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN soil_type TEXT`); } catch (_) {}
  }
  if (!cols.includes('primary_commodities')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN primary_commodities TEXT`); } catch (_) {}
  }
  if (!cols.includes('business_name')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN business_name TEXT`); } catch (_) {}
  }
  if (!cols.includes('default_mandi')) {
    try { await dbRun(`ALTER TABLE users ADD COLUMN default_mandi TEXT`); } catch (_) {}
  }

  // 2. Crops Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      farmer_id TEXT,
      crop_name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'Quintal',
      location TEXT,
      sowing_date TEXT,
      expected_harvest_date TEXT,
      status TEXT DEFAULT 'Growing',
      stage TEXT DEFAULT 'Vegetative Growth',
      progress_percent REAL DEFAULT 20,
      health_status TEXT DEFAULT 'Good',
      expected_yield_quintals REAL DEFAULT 0,
      soil_type TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await dbRun(`CREATE INDEX IF NOT EXISTS idx_crops_farmer ON crops(farmer_id);`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(crop_name);`);

  // 3. Market Prices Table (Normalized with dual-access column naming for compatibility)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      commodity TEXT,
      market TEXT NOT NULL,
      location TEXT,
      state TEXT DEFAULT 'Maharashtra',
      district TEXT,
      price REAL NOT NULL,
      modalPrice REAL,
      minPrice REAL,
      maxPrice REAL,
      arrivalQuantity REAL DEFAULT 100,
      unit TEXT DEFAULT 'Quintal',
      date TEXT NOT NULL,
      source TEXT DEFAULT 'Agmarknet',
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      fetchedAt TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      UNIQUE(crop_name, market, date)
    );
  `);

  await dbRun(`CREATE INDEX IF NOT EXISTS idx_market_prices_lookup ON market_prices (crop_name, market, date);`);

  // Migration: Add real-time price indicators to market_prices
  try {
    const mpCols = await dbAll(`PRAGMA table_info(market_prices)`);
    if (!mpCols.some(c => c.name === 'change')) {
      await dbRun(`ALTER TABLE market_prices ADD COLUMN change REAL DEFAULT 0`);
    }
    if (!mpCols.some(c => c.name === 'changePercent')) {
      await dbRun(`ALTER TABLE market_prices ADD COLUMN changePercent REAL DEFAULT 0`);
    }
    if (!mpCols.some(c => c.name === 'trend')) {
      await dbRun(`ALTER TABLE market_prices ADD COLUMN trend TEXT DEFAULT 'stable'`);
    }
    if (!mpCols.some(c => c.name === 'marketStatus')) {
      await dbRun(`ALTER TABLE market_prices ADD COLUMN marketStatus TEXT DEFAULT 'Live'`);
    }
    if (!mpCols.some(c => c.name === 'sessionName')) {
      await dbRun(`ALTER TABLE market_prices ADD COLUMN sessionName TEXT DEFAULT 'Live Auction'`);
    }
  } catch (colErr) {
    // columns may already exist
  }

  // 4. Buyers Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS buyers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      business_name TEXT NOT NULL,
      crop_required TEXT NOT NULL,
      quantity_required REAL NOT NULL,
      location TEXT NOT NULL,
      price_offered REAL NOT NULL,
      status TEXT DEFAULT 'Active',
      contact_phone TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await dbRun(`CREATE INDEX IF NOT EXISTS idx_buyers_crop ON buyers (crop_required, location);`);

  // 5. Warehouses Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      capacity REAL NOT NULL,
      available_capacity REAL NOT NULL,
      supported_crops TEXT NOT NULL,
      contact TEXT,
      type TEXT DEFAULT 'Cold Storage',
      price_per_quintal_month REAL DEFAULT 80,
      temp_range TEXT,
      rating REAL DEFAULT 4.8,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Vehicles Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      vehicle_type TEXT NOT NULL,
      vehicle_name TEXT NOT NULL,
      title TEXT,
      location TEXT NOT NULL,
      capacity REAL NOT NULL,
      capacityQuintals REAL,
      rental_price REAL NOT NULL,
      rate_per_km REAL,
      ratePerKm REAL,
      base_price REAL,
      basePrice REAL,
      availability INTEGER DEFAULT 1,
      isAvailable INTEGER DEFAULT 1,
      latitude REAL,
      longitude REAL,
      driver_name TEXT,
      driverName TEXT,
      driver_phone TEXT,
      driverPhone TEXT,
      rating REAL DEFAULT 4.8,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 7. Forecasts Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      location TEXT,
      market TEXT,
      current_price REAL NOT NULL,
      forecast_7_day REAL NOT NULL,
      forecast_15_day REAL NOT NULL,
      forecast_30_day REAL NOT NULL,
      trend TEXT NOT NULL,
      confidence REAL DEFAULT 0.75,
      factors TEXT,
      data_source TEXT DEFAULT 'Agmarknet + Grounded Gemini AI',
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbRun(`CREATE INDEX IF NOT EXISTS idx_forecasts_crop ON forecasts (crop_name, location);`);

  // 8. Auxiliary Tables (Bookings, Alerts, History, Sync Logs)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      resourceId TEXT,
      item TEXT NOT NULL,
      type TEXT,
      owner TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      duration TEXT,
      price REAL,
      status TEXT DEFAULT 'Upcoming',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Migration: Add columns to bookings if they don't exist
  try {
    const bkCols = await dbAll(`PRAGMA table_info(bookings)`);
    const bkColNames = bkCols.map(c => c.name);
    if (!bkColNames.includes('user_id')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN user_id TEXT`);
    }
    if (!bkColNames.includes('location')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN location TEXT`);
    }
    if (!bkColNames.includes('contact_phone')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN contact_phone TEXT`);
    }
    if (!bkColNames.includes('image')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN image TEXT`);
    }
    if (!bkColNames.includes('notes')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN notes TEXT`);
    }
    if (!bkColNames.includes('owner_id')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN owner_id TEXT`);
    }
    if (!bkColNames.includes('farmer_name')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN farmer_name TEXT`);
    }
    if (!bkColNames.includes('farmer_phone')) {
      await dbRun(`ALTER TABLE bookings ADD COLUMN farmer_phone TEXT`);
    }
  } catch (migErr) {
    // Columns may already exist
  }

  await dbRun(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id TEXT PRIMARY KEY,
      commodity TEXT NOT NULL,
      market TEXT,
      targetPrice REAL NOT NULL,
      condition TEXT NOT NULL,
      userEmail TEXT,
      active INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commodity TEXT NOT NULL,
      market TEXT NOT NULL,
      state TEXT,
      district TEXT,
      modalPrice REAL NOT NULL,
      minPrice REAL,
      maxPrice REAL,
      arrivalQuantity REAL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(commodity, market, date)
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS data_sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      records_fetched INTEGER DEFAULT 0,
      error_message TEXT,
      sync_timestamp TEXT NOT NULL
    );
  `);

  // AI Conversation History Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      source TEXT DEFAULT 'Gemini AI',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await dbRun(`CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id, created_at DESC);`);


  // Backward compatibility views or tables for existing pages
  await dbRun(`CREATE TABLE IF NOT EXISTS mandis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT,
    state TEXT,
    distanceKm REAL,
    latitude REAL,
    longitude REAL,
    isOpen INTEGER,
    avgArrivalTons REAL,
    transportCostPerQuintal REAL,
    cropPrices TEXT
  );`);

  await dbRun(`CREATE TABLE IF NOT EXISTS tractors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    hp INTEGER,
    ratePerHour REAL,
    ratePerDay REAL,
    ownerName TEXT,
    ownerPhone TEXT,
    location TEXT,
    distanceKm REAL,
    rating REAL,
    totalBookings INTEGER,
    isAvailable INTEGER,
    implementsIncluded TEXT,
    image TEXT
  );`);

  await dbRun(`CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    requiredHp TEXT,
    ratePerDay REAL,
    location TEXT,
    distanceKm REAL,
    rating REAL,
    suitability TEXT,
    image TEXT,
    isAvailable INTEGER
  );`);

  await dbRun(`CREATE TABLE IF NOT EXISTS storages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    totalCapacityTons REAL,
    availableCapacityTons REAL,
    pricePerQuintalMonth REAL,
    tempRange TEXT,
    location TEXT,
    distanceKm REAL,
    rating REAL,
    contact TEXT,
    suitableFor TEXT
  );`);

  // Migration: Add owner_id to tractors, equipment, warehouses
  try {
    const trCols = await dbAll(`PRAGMA table_info(tractors)`);
    if (!trCols.some(c => c.name === 'owner_id')) await dbRun(`ALTER TABLE tractors ADD COLUMN owner_id TEXT`);

    const eqCols = await dbAll(`PRAGMA table_info(equipment)`);
    if (!eqCols.some(c => c.name === 'owner_id')) await dbRun(`ALTER TABLE equipment ADD COLUMN owner_id TEXT`);

    const whCols = await dbAll(`PRAGMA table_info(warehouses)`);
    if (!whCols.some(c => c.name === 'owner_id')) await dbRun(`ALTER TABLE warehouses ADD COLUMN owner_id TEXT`);
  } catch (migErr) {
    console.warn('Rentals migration notice:', migErr.message);
  }

  // Seed default data if empty
  await seedInitialData();

  console.log('✅ SQLite Schema initialized with all required tables.');
}

export async function seedInitialData() {
  // 1. Seed Users
  const userCount = await dbGet(`SELECT COUNT(*) as count FROM users`);
  if (userCount.count === 0) {
    console.log('🌱 Seeding initial demo users...');
    await dbRun(`
      INSERT INTO users (id, name, email, password, role, location, phone, farm_land, farm_size_acres, soil_type, primary_commodities, business_name, default_mandi) VALUES
      ('usr-farmer-1', 'Ramesh Patel', 'farmer@agripulse.in', 'farmer123', 'farmer', 'Wardha, Maharashtra', '+91 98230 11223', '5.0 Acres (Wardha)', 5.0, 'Black Cotton Soil (Regur)', 'Cotton (Kapas), Soybean (Yellow)', 'Patel Agro Farms', 'Wardha Cotton Mandi'),
      ('usr-farmer-2', 'Suresh Deshmukh', 'suresh@agripulse.in', 'farmer123', 'farmer', 'Kalmeshwar, Nagpur', '+91 98230 44112', '8.5 Acres (Kalmeshwar)', 8.5, 'Medium Heavy Loamy Soil', 'Wheat (Lokwan), Red Onion', 'Deshmukh Natural Farms', 'Nagpur APMC'),
      ('usr-buyer-1', 'Vidarbha Agro Mills Ltd.', 'trader@vidarbhaagro.com', 'buyer123', 'buyer', 'Nagpur, Maharashtra', '+91 98222 33445', '', 0, '', 'Soybean (Yellow), Wheat (Lokwan)', 'Vidarbha Agro Mills Ltd.', 'Nagpur APMC'),
      ('usr-buyer-2', 'Kalamna Grain Traders', 'procure@kalamnagrain.in', 'buyer123', 'buyer', 'Nagpur APMC Yard', '+91 98210 99881', '', 0, '', 'Cotton (Kapas), Red Onion', 'Kalamna Grain Traders', 'Kalamna APMC'),
      ('usr-owner-1', 'Balwinder Logistics', 'fleet@agripulse.in', 'owner123', 'owner', 'Nagpur, Maharashtra', '+91 98225 66778', '', 0, '', 'Tractors & Transport Fleets', 'Balwinder Logistics Fleet & Farm Machinery', 'Nagpur Central Hub'),
      ('usr-admin-1', 'Platform Administrator', 'admin@agripulse.in', 'admin123', 'admin', 'Nagpur, Maharashtra', '+91 712 2550100', '', 0, '', 'Platform Telemetry', 'AgriPulse Central Administration', 'Nagpur APMC');
    `);
  } else {
    // Ensure existing demo users receive their distinct farmlands and business profiles
    await dbRun(`
      UPDATE users SET 
        farm_land = '5.0 Acres (Wardha)', 
        farm_size_acres = 5.0, 
        soil_type = 'Black Cotton Soil (Regur)', 
        primary_commodities = 'Cotton (Kapas), Soybean (Yellow)',
        business_name = 'Patel Agro Farms',
        default_mandi = 'Wardha Cotton Mandi'
      WHERE id = 'usr-farmer-1' AND (farm_land IS NULL OR farm_land = '');
    `);
    await dbRun(`
      UPDATE users SET 
        farm_land = '8.5 Acres (Kalmeshwar)', 
        farm_size_acres = 8.5, 
        soil_type = 'Medium Heavy Loamy Soil', 
        primary_commodities = 'Wheat (Lokwan), Red Onion',
        business_name = 'Deshmukh Natural Farms',
        default_mandi = 'Nagpur APMC'
      WHERE id = 'usr-farmer-2' AND (farm_land IS NULL OR farm_land = '');
    `);
    await dbRun(`
      UPDATE users SET 
        business_name = 'Vidarbha Agro Mills Ltd.', 
        primary_commodities = 'Soybean (Yellow), Wheat (Lokwan)',
        default_mandi = 'Nagpur APMC'
      WHERE id = 'usr-buyer-1' AND (business_name IS NULL OR business_name = '');
    `);
    await dbRun(`
      UPDATE users SET 
        business_name = 'Balwinder Logistics Fleet & Farm Machinery',
        primary_commodities = 'Tractors & Transport Fleets',
        default_mandi = 'Nagpur Central Hub'
      WHERE id = 'usr-owner-1' AND (business_name IS NULL OR business_name = '');
    `);
  }

  // 2. Seed Crops
  const cropCount = await dbGet(`SELECT COUNT(*) as count FROM crops`);
  if (cropCount.count === 0) {
    console.log('🌱 Seeding initial farmer crops...');
    await dbRun(`
      INSERT INTO crops (id, farmer_id, crop_name, quantity, unit, location, sowing_date, expected_harvest_date, status, stage, progress_percent, health_status, expected_yield_quintals) VALUES
      ('crp-1', 'usr-farmer-1', 'Cotton (Kapas)', 36, 'Quintal', 'Wardha, Maharashtra', '2026-06-15', '2026-10-20', 'Growing', 'Flowering & Boll Formation', 65, 'Excellent', 40),
      ('crp-2', 'usr-farmer-1', 'Soybean (Yellow)', 24, 'Quintal', 'Wardha, Maharashtra', '2026-06-22', '2026-09-30', 'Harvested', 'Ready to Sell', 100, 'Good', 28),
      ('crp-3', 'usr-farmer-2', 'Wheat (Lokwan)', 45, 'Quintal', 'Kalmeshwar, Nagpur', '2026-11-05', '2027-03-10', 'Growing', 'Vegetative Stage', 30, 'Good', 50),
      ('crp-4', 'usr-farmer-2', 'Red Onion', 60, 'Quintal', 'Nashik, Maharashtra', '2026-07-01', '2026-10-15', 'Harvested', 'Storage Cured', 90, 'Optimal', 65);
    `);
  }

  // 3. Seed Buyers
  const buyerCount = await dbGet(`SELECT COUNT(*) as count FROM buyers`);
  if (buyerCount.count === 0) {
    console.log('🌱 Seeding initial buyer requirements...');
    await dbRun(`
      INSERT INTO buyers (id, user_id, business_name, crop_required, quantity_required, location, price_offered, status, contact_phone, notes) VALUES
      ('byr-1', 'usr-buyer-1', 'Vidarbha Agro Mills Ltd.', 'Soybean (Yellow)', 100, 'Nagpur, Maharashtra', 4850, 'Active', '+91 98222 33445', 'Grade-A oilseed quality required for crushing plant.'),
      ('byr-2', 'usr-buyer-2', 'Kalamna Grain Traders', 'Cotton (Kapas)', 80, 'Nagpur, Maharashtra', 7400, 'Active', '+91 98210 99881', 'Long-staple Shankar-6 preferred. Direct farm pickup available.'),
      ('byr-3', 'usr-buyer-1', 'Vidarbha Agro Mills Ltd.', 'Wheat (Lokwan)', 150, 'Nagpur, Maharashtra', 2550, 'Active', '+91 98222 33445', 'Moisture under 12%. Spot payment via RTGS on delivery.'),
      ('byr-4', 'usr-buyer-2', 'Nashik Export Aggregators', 'Red Onion', 120, 'Nashik, Maharashtra', 2950, 'Active', '+91 94220 11990', 'Medium-to-large size bulbs suitable for Gulf container dispatch.');
    `);
  }

  // 4. Seed Warehouses
  const whCount = await dbGet(`SELECT COUNT(*) as count FROM warehouses`);
  if (whCount.count === 0) {
    console.log('🌱 Seeding initial warehouses...');
    await dbRun(`
      INSERT INTO warehouses (id, name, location, latitude, longitude, capacity, available_capacity, supported_crops, contact, type, price_per_quintal_month, temp_range, rating) VALUES
      ('wh-1', 'Nagpur Farmers Multi-Commodity Cold Storage', 'Kalamna Industrial Zone, Nagpur', 21.1712, 79.1350, 1200, 380, '["Red Onion", "Hybrid Tomato", "Potato", "Fruits"]', '+91 712 2654900', 'Cold Storage', 85, '2°C to 8°C (Humidity controlled)', 4.9),
      ('wh-2', 'Wardha Central Cotton & Grain Silo', 'Sevagram Road, Wardha', 20.7390, 78.6010, 2500, 1150, '["Cotton (Kapas)", "Soybean (Yellow)", "Wheat (Lokwan)"]', '+91 7152 245100', 'Dry Grain Warehouse', 45, 'Ambient Aerated', 4.8),
      ('wh-3', 'Amravati Agro Logistics Cold Chain', 'MIDC Badnera, Amravati', 20.8870, 77.7420, 1800, 720, '["Soybean (Yellow)", "Maize (Yellow)", "Red Onion"]', '+91 721 2511234', 'Cold Storage', 75, '4°C to 12°C', 4.7),
      ('wh-4', 'Lasalgaon Mandi Onion Dehydration Hub', 'Lasalgaon Yard, Nashik', 20.1472, 74.2274, 3000, 950, '["Red Onion", "Garlic"]', '+91 2550 266400', 'Ventilated Storage', 60, '15°C Ambient Air-flow', 4.9);
    `);
  }

  // Also seed into storages for backward compatibility
  const storagesCount = await dbGet(`SELECT COUNT(*) as count FROM storages`);
  if (storagesCount.count === 0) {
    await dbRun(`
      INSERT INTO storages (id, name, type, totalCapacityTons, availableCapacityTons, pricePerQuintalMonth, tempRange, location, distanceKm, rating, contact, suitableFor) VALUES
      ('st-1', 'Nagpur Farmers Multi-Commodity Cold Storage', 'Cold Storage', 1200, 380, 85, '2°C to 8°C (Humidity controlled)', 'Kalamna Industrial Zone, Nagpur', 14.0, 4.9, '+91 712 2654900', '["Red Onion", "Hybrid Tomato", "Potato", "Fruits"]'),
      ('st-2', 'Wardha Central Cotton & Grain Silo', 'Dry Grain Warehouse', 2500, 1150, 45, 'Ambient Aerated', 'Sevagram Road, Wardha', 42.0, 4.8, '+91 7152 245100', '["Cotton (Kapas)", "Soybean (Yellow)", "Wheat (Lokwan)"]'),
      ('st-3', 'Amravati Agro Logistics Cold Chain', 'Cold Storage', 1800, 720, 75, '4°C to 12°C', 'MIDC Badnera, Amravati', 85.0, 4.7, '+91 721 2511234', '["Soybean (Yellow)", "Maize (Yellow)", "Red Onion"]');
    `);
  }

  // 5. Seed Vehicles
  const vehCount = await dbGet(`SELECT COUNT(*) as count FROM vehicles`);
  if (vehCount.count === 0) {
    console.log('🌱 Seeding initial vehicles...');
    await dbRun(`
      INSERT INTO vehicles (id, owner_id, vehicle_type, vehicle_name, title, location, capacity, capacityQuintals, rental_price, rate_per_km, ratePerKm, base_price, basePrice, availability, isAvailable, latitude, longitude, driver_name, driverName, driver_phone, driverPhone, rating, image) VALUES
      ('vh-1', 'usr-farmer-2', 'Pickup', 'Mahindra Bolero Maxi Truck', 'Mahindra Bolero Maxi Truck (1.5 Ton)', 'Nagpur Central Hub', 15, 15, 1200, 18, 18, 600, 600, 1, 1, 21.1458, 79.0882, 'Vinayak Pawar', 'Vinayak Pawar', '+91 93701 55667', '+91 93701 55667', 4.8, 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=600&auto=format&fit=crop&q=80'),
      ('vh-2', 'usr-farmer-1', 'Mini Truck', 'Tata Ace Gold Extra', 'Tata Ace Gold (0.8 Ton Mini Truck)', 'Wardha Market Yard', 8, 8, 900, 14, 14, 400, 400, 1, 1, 20.7453, 78.6022, 'Gajanan Rao', 'Gajanan Rao', '+91 94220 88712', '+91 94220 88712', 4.9, 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'),
      ('vh-3', 'usr-farmer-2', 'Tractor Trolley', 'Swaraj Heavy 4-Wheel Trolley', 'Swaraj Heavy 4-Wheel Trolley (4 Ton)', 'Kalmeshwar, Nagpur', 40, 40, 2200, 25, 25, 800, 800, 1, 1, 21.2300, 78.9100, 'Suresh Deshmukh', 'Suresh Deshmukh', '+91 98230 44112', '+91 98230 44112', 4.8, 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80'),
      ('vh-4', 'usr-buyer-1', 'Refrigerated Vehicle', 'Ashok Leyland ColdVan 5T', 'Ashok Leyland ColdVan (5 Ton Cold Chain)', 'Nagpur Logistics Park', 50, 50, 3500, 32, 32, 1200, 1200, 1, 1, 21.1200, 79.0500, 'Manoj Kadam', 'Manoj Kadam', '+91 97654 32100', '+91 97654 32100', 4.9, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80');
    `);
  }

  // 6. Seed Tractors & Equipment & Mandis (for backward compatibility)
  const tractorCount = await dbGet(`SELECT COUNT(*) as count FROM tractors`);
  if (tractorCount.count === 0) {
    await dbRun(`
      INSERT INTO tractors (id, name, brand, hp, ratePerHour, ratePerDay, ownerName, ownerPhone, location, distanceKm, rating, totalBookings, isAvailable, implementsIncluded, image) VALUES
      ('tr-1', 'Mahindra 575 DI', 'Mahindra', 45, 450, 3200, 'Suresh Deshmukh', '+91 98230 44112', 'Kalmeshwar, Nagpur', 6.2, 4.8, 42, 1, '["Rotavator", "Cultivator"]', 'https://images.unsplash.com/photo-1530267981608-bc70a2796de6?w=600&auto=format&fit=crop&q=80'),
      ('tr-2', 'Swaraj 855 FE Heavy Duty', 'Swaraj', 52, 550, 3800, 'Rameshwar Patil', '+91 94221 88901', 'Hingna, Nagpur', 12.0, 4.9, 67, 1, '["Reversible Plough", "Trolley"]', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80');
    `);
  }

  const eqCount = await dbGet(`SELECT COUNT(*) as count FROM equipment`);
  if (eqCount.count === 0) {
    await dbRun(`
      INSERT INTO equipment (id, name, category, brand, requiredHp, ratePerDay, location, distanceKm, rating, suitability, image, isAvailable) VALUES
      ('eq-1', 'Shaktiman 7-Feet Heavy Duty Rotavator', 'Rotavator', 'Shaktiman', '45 - 55 HP', 1200, 'Kalmeshwar, Nagpur', 7.5, 4.9, 'Perfect for seedbed preparation in cotton & soybean fields.', 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80', 1),
      ('eq-2', 'Multi-Crop Combine Harvester', 'Harvester', 'Preet', '60+ HP', 4500, 'Nagpur APMC Hub', 18.0, 4.8, 'High speed harvesting for soybean and wheat crops.', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80', 1);
    `);
  }

  const mandiCount = await dbGet(`SELECT COUNT(*) as count FROM mandis`);
  if (mandiCount.count === 0) {
    await dbRun(`
      INSERT INTO mandis (id, name, district, state, distanceKm, latitude, longitude, isOpen, avgArrivalTons, transportCostPerQuintal, cropPrices) VALUES
      ('nagpur-apmc', 'Nagpur APMC Market', 'Nagpur', 'Maharashtra', 18.5, 21.1458, 79.0882, 1, 420, 140, '[]'),
      ('wardha-mandi', 'Wardha Cotton & Grain Mandi', 'Wardha', 'Maharashtra', 42.0, 20.7453, 78.6022, 1, 310, 210, '[]'),
      ('amravati-ganj', 'Amravati Krishi Ganj Yard', 'Amravati', 'Maharashtra', 85.0, 20.9374, 77.7796, 1, 540, 360, '[]'),
      ('lasalgaon-mandi', 'Lasalgaon APMC (Onion Hub)', 'Nashik', 'Maharashtra', 320.0, 20.1472, 74.2274, 1, 850, 450, '[]');
    `);
  }

  // 7. Seed Bookings with distinct user_id scoping
  const validUserBookings = await dbGet(`SELECT COUNT(*) as count FROM bookings WHERE user_id IS NOT NULL`);
  if (!validUserBookings || validUserBookings.count === 0) {
    await dbRun(`DELETE FROM bookings`);
    await dbRun(`
      INSERT INTO bookings (id, user_id, resourceId, item, type, owner, startDate, endDate, duration, price, status) VALUES
      ('BK-1092', 'usr-farmer-1', 'tr-1', 'Mahindra 575 DI (45 HP)', 'Tractor', 'Balwinder Logistics', '2026-10-15', '2026-10-16', '1 Day', 3200, 'Upcoming'),
      ('BK-0844', 'usr-farmer-1', 'vh-1', 'Mahindra Bolero Maxi Truck', 'Transport', 'Vinayak Pawar', '2026-10-08', '2026-10-08', '42 km Trip', 1356, 'Completed'),
      ('BK-0912', 'usr-farmer-2', 'wh-1', 'Nagpur Cold Storage Bay #4', 'Storage', 'Kalamna Cold Chain', '2026-09-15', '2026-10-15', '1 Month', 4800, 'Active');
    `);
  }

  // 8. Seed Initial Forecast
  const fcCount = await dbGet(`SELECT COUNT(*) as count FROM forecasts`);
  if (fcCount.count === 0) {
    await dbRun(`
      INSERT INTO forecasts (crop_name, location, market, current_price, forecast_7_day, forecast_15_day, forecast_30_day, trend, confidence, factors, data_source) VALUES
      ('Cotton (Kapas)', 'Nagpur', 'Nagpur APMC', 7250, 7420, 7680, 7850, 'increasing', 0.87, '["Arrival pace lower than 3-year mean", "Spinning mill export demand firm", "Festival season restocking"]', 'Agmarknet + Grounded Gemini AI'),
      ('Soybean (Yellow)', 'Nagpur', 'Nagpur APMC', 4700, 4780, 4850, 4920, 'stable', 0.82, '["Steady edible oil import parity", "Local crushing plant demand", "Post-harvest moisture stabilization"]', 'Agmarknet + Grounded Gemini AI');
    `);
  }

  // 9. Seed Initial Market Prices
  const mpCount = await dbGet(`SELECT COUNT(*) as count FROM market_prices`);
  if (mpCount.count === 0) {
    console.log('🌱 Seeding verified Agmarknet baseline market prices...');
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];
    await dbRun(`
      INSERT OR REPLACE INTO market_prices 
      (crop_name, commodity, market, location, state, district, price, modalPrice, minPrice, maxPrice, arrivalQuantity, unit, date, source, fetched_at, fetchedAt) VALUES
      ('Cotton (Kapas)', 'Cotton (Kapas)', 'Nagpur APMC', 'Nagpur, Maharashtra', 'Maharashtra', 'Nagpur', 7250, 7250, 6900, 7500, 210, 'Quintal', '${today}', 'Agmarknet (Govt. of India)', '${nowIso}', '${nowIso}'),
      ('Soybean (Yellow)', 'Soybean (Yellow)', 'Nagpur APMC', 'Nagpur, Maharashtra', 'Maharashtra', 'Nagpur', 4700, 4700, 4500, 4900, 140, 'Quintal', '${today}', 'Agmarknet (Govt. of India)', '${nowIso}', '${nowIso}'),
      ('Wheat (Lokwan)', 'Wheat (Lokwan)', 'Nagpur APMC', 'Nagpur, Maharashtra', 'Maharashtra', 'Nagpur', 2480, 2480, 2350, 2600, 320, 'Quintal', '${today}', 'Agmarknet (Govt. of India)', '${nowIso}', '${nowIso}'),
      ('Red Onion', 'Red Onion', 'Lasalgaon Mandi', 'Nashik, Maharashtra', 'Maharashtra', 'Nashik', 2850, 2850, 2200, 3100, 580, 'Quintal', '${today}', 'Agmarknet (Govt. of India)', '${nowIso}', '${nowIso}'),
      ('Hybrid Tomato', 'Hybrid Tomato', 'Pune Gultekdi', 'Pune, Maharashtra', 'Maharashtra', 'Pune', 3200, 3200, 2600, 3500, 410, 'Quintal', '${today}', 'Agmarknet (Govt. of India)', '${nowIso}', '${nowIso}'),
      ('Maize (Yellow)', 'Maize (Yellow)', 'Amravati Ganj', 'Amravati, Maharashtra', 'Maharashtra', 'Amravati', 2150, 2150, 1950, 2300, 190, 'Quintal', '${today}', 'Agmarknet (Govt. of India)', '${nowIso}', '${nowIso}');
    `);

    await dbRun(`
      INSERT OR IGNORE INTO price_history
      (commodity, market, state, district, modalPrice, minPrice, maxPrice, arrivalQuantity, date) VALUES
      ('Cotton (Kapas)', 'Nagpur APMC', 'Maharashtra', 'Nagpur', 7100, 6800, 7350, 190, '2026-09-18'),
      ('Cotton (Kapas)', 'Nagpur APMC', 'Maharashtra', 'Nagpur', 7180, 6850, 7400, 205, '2026-09-22'),
      ('Cotton (Kapas)', 'Nagpur APMC', 'Maharashtra', 'Nagpur', 7250, 6900, 7500, 210, '${today}'),
      ('Soybean (Yellow)', 'Nagpur APMC', 'Maharashtra', 'Nagpur', 4650, 4450, 4800, 130, '2026-09-18'),
      ('Soybean (Yellow)', 'Nagpur APMC', 'Maharashtra', 'Nagpur', 4700, 4500, 4900, 140, '${today}');
    `);
  }
}
