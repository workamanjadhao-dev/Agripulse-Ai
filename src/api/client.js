export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management helpers
const TOKEN_KEY = 'agri_jwt_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function storeToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to store token:', e);
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

async function apiFetch(endpoint, options = {}) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `API error: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health & System Telemetry
  getHealth: () => apiFetch('/health'),
  getDashboard: () => apiFetch('/dashboard'),
  getAdminStats: () => apiFetch('/admin/stats'),

  // Market Prices & Live Agmarknet Sync
  getMarketPrices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/market-prices${query ? `?${query}` : ''}`);
  },
  getLatestPrices: () => apiFetch('/market-prices/latest'),
  getCropPrice: (crop) => apiFetch(`/market-prices/${encodeURIComponent(crop)}`),
  getPriceHistory: (commodity, market) => {
    const query = market ? `?market=${encodeURIComponent(market)}` : '';
    return apiFetch(`/market-prices/history/${encodeURIComponent(commodity)}${query}`);
  },
  syncMarketData: () => apiFetch('/market-prices/sync'),

  // Farmer Crops (Full CRUD)
  getCrops: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/crops${query ? `?${query}` : ''}`);
  },
  getCropById: (id) => apiFetch(`/crops/${id}`),
  createCrop: (cropData) => apiFetch('/crops', {
    method: 'POST',
    body: JSON.stringify(cropData)
  }),
  updateCrop: (id, cropData) => apiFetch(`/crops/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cropData)
  }),
  deleteCrop: (id) => apiFetch(`/crops/${id}`, {
    method: 'DELETE'
  }),

  // Backward-compatible My Crops
  getMyCrops: () => apiFetch('/my-crops'),
  addMyCrop: (cropData) => apiFetch('/my-crops', {
    method: 'POST',
    body: JSON.stringify(cropData)
  }),

  // Buyers & Procurement Requirements (Full CRUD)
  getBuyers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/buyers${query ? `?${query}` : ''}`);
  },
  getBuyerById: (id) => apiFetch(`/buyers/${id}`),
  createBuyer: (buyerData) => apiFetch('/buyers', {
    method: 'POST',
    body: JSON.stringify(buyerData)
  }),
  updateBuyer: (id, buyerData) => apiFetch(`/buyers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buyerData)
  }),
  deleteBuyer: (id) => apiFetch(`/buyers/${id}`, {
    method: 'DELETE'
  }),

  // Farmer-Buyer Algorithmic Matching
  getMatches: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/matches${query ? `?${query}` : ''}`);
  },

  // Warehouses & Cold Storages
  getWarehouses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/warehouses${query ? `?${query}` : ''}`);
  },
  getWarehouseById: (id) => apiFetch(`/warehouses/${id}`),
  createWarehouse: (warehouseData) => apiFetch('/warehouses', {
    method: 'POST',
    body: JSON.stringify(warehouseData)
  }),
  deleteWarehouse: (id) => apiFetch(`/warehouses/${id}`, {
    method: 'DELETE'
  }),

  // Vehicles & Farm Transport
  getVehicles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/vehicles${query ? `?${query}` : ''}`);
  },
  getVehicleById: (id) => apiFetch(`/vehicles/${id}`),
  createVehicle: (vehicleData) => apiFetch('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData)
  }),
  deleteVehicle: (id) => apiFetch(`/vehicles/${id}`, {
    method: 'DELETE'
  }),

  // Tractors & Equipment Catalogs
  getTractors: () => apiFetch('/rentals/tractors'),
  createTractor: (tractorData) => apiFetch('/rentals/tractors', {
    method: 'POST',
    body: JSON.stringify(tractorData)
  }),
  deleteTractor: (id) => apiFetch(`/rentals/tractors/${id}`, {
    method: 'DELETE'
  }),
  updateTractorAvailability: (id, isAvailable) => apiFetch(`/rentals/tractors/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable })
  }),
  getEquipment: () => apiFetch('/rentals/equipment'),
  createEquipment: (equipmentData) => apiFetch('/rentals/equipment', {
    method: 'POST',
    body: JSON.stringify(equipmentData)
  }),
  deleteEquipment: (id) => apiFetch(`/rentals/equipment/${id}`, {
    method: 'DELETE'
  }),
  getStorages: () => apiFetch('/rentals/storages'),

  getBookings: () => apiFetch('/bookings'),
  createBooking: (bookingData) => apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  updateBookingStatus: (id, status, metadata = {}) => apiFetch(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...metadata })
  }),
  cancelBooking: (id) => apiFetch(`/bookings/${id}`, { method: 'DELETE' }),

  // Price Alerts
  getAlerts: () => apiFetch('/price-alerts'),
  createAlert: (alertData) => apiFetch('/price-alerts', {
    method: 'POST',
    body: JSON.stringify(alertData)
  }),
  deleteAlert: (id) => apiFetch(`/price-alerts/${id}`, {
    method: 'DELETE'
  }),

  // Grounded AI Endpoints (Gemini LLM backed)
  getAiForecast: (data) => apiFetch('/ai/forecast', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAiSellDecision: (data) => apiFetch('/ai/sell-decision', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  sendAiChat: (message, userRole = 'farmer', language = 'en', apiKey = null) => {
    const key = apiKey || localStorage.getItem('agri_gemini_api_key') || undefined;
    return apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userRole, language, apiKey: key })
    });
  },
  getAiHistory: () => apiFetch('/ai/history'),
  getAiForecastLatest: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/forecast${query ? `?${query}` : ''}`);
  },

  // Authentication & Profile
  login: (credentials) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  signup: (userData) => apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  register: (userData) => apiFetch('/auth/register', {    // backward compat alias
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/auth/me'),                       // GET /api/auth/me - current user
  getProfile: (userId) => apiFetch(`/auth/profile${userId ? `?userId=${userId}` : ''}`),
  updateProfile: (profileData) => apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Real-Time Weather Intelligence (Open-Meteo)
  getWeather: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/weather${query ? `?${query}` : ''}`);
  },
  getWeatherRegions: () => apiFetch('/weather/regions'),
  searchWeatherLocations: (q) => apiFetch(`/weather/search?q=${encodeURIComponent(q)}`),
  reverseGeocodeWeather: (lat, lon) => apiFetch(`/weather/reverse?lat=${lat}&lon=${lon}`)
};
