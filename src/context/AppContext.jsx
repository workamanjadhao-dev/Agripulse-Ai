import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, storeToken, clearToken, getStoredToken } from '../api/client';
import { TRANSLATIONS, getTranslation } from '../utils/translations';
import { setAppLanguage, initAutoTranslator } from '../utils/autoTranslator';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // User Role & Language (Persisted in localStorage)
  const [role, setRoleState] = useState(() => localStorage.getItem('agri_active_role') || 'farmer');
  const [language, setLanguageState] = useState(() => localStorage.getItem('agri_language') || 'en');

  const setRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem('agri_active_role', newRole);
  };

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('agri_language', newLang);
    setAppLanguage(newLang);
  };

  // Initialize auto-translation on mount and when language changes
  useEffect(() => {
    initAutoTranslator(() => language);
    setAppLanguage(language);
  }, []);

  useEffect(() => {
    setAppLanguage(language);
  }, [language]);

  // Helper function to get translated text
  const t = (key) => getTranslation(language, key);

  // Modals & Drawers
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Market Data Telemetry & State
  const [dataTelemetry, setDataTelemetry] = useState({
    status: 'live',
    badge: '🟢 Live (Agmarknet)',
    lastSync: new Date().toISOString(),
    minutesAgo: 0,
    source: 'Agmarknet (Govt. of India)'
  });
  const [marketPrices, setMarketPrices] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Per-User Scoped Data & Demo Fallbacks
  // ─────────────────────────────────────────────────────────────────────────
  const DEMO_USER_CROPS = {
    'usr-farmer-1': [
      {
        id: 'crp-1',
        farmer_id: 'usr-farmer-1',
        crop_name: 'Cotton (Kapas)',
        quantity: 35,
        unit: 'Quintal',
        location: 'Wardha, Maharashtra',
        sowing_date: '2026-06-15',
        expected_harvest_date: '2026-10-20',
        status: 'Growing',
        stage: 'Flowering & Boll Formation',
        progress_percent: 65,
        health_status: 'Excellent',
        expected_yield_quintals: 35,
        soil_type: 'Black Cotton Soil',
        notes: 'High yield Bt Cotton on rich black soil with drip irrigation'
      },
      {
        id: 'crp-2',
        farmer_id: 'usr-farmer-1',
        crop_name: 'Soybean (Yellow)',
        quantity: 25,
        unit: 'Quintal',
        location: 'Wardha, Maharashtra',
        sowing_date: '2026-07-01',
        expected_harvest_date: '2026-10-28',
        status: 'Harvest Ready',
        stage: 'Pod Maturity',
        progress_percent: 90,
        health_status: 'Good',
        expected_yield_quintals: 25,
        soil_type: 'Black Cotton Soil',
        notes: 'Certified JS-335 variety ready for post-monsoon harvest'
      }
    ],
    'usr-farmer-2': [
      {
        id: 'crp-3',
        farmer_id: 'usr-farmer-2',
        crop_name: 'Wheat (Lokwan)',
        quantity: 40,
        unit: 'Quintal',
        location: 'Kalmeshwar, Nagpur',
        sowing_date: '2026-11-10',
        expected_harvest_date: '2027-02-25',
        status: 'Vegetative',
        stage: 'Tillering Phase',
        progress_percent: 45,
        health_status: 'Excellent',
        expected_yield_quintals: 40,
        soil_type: 'Medium Loamy Soil',
        notes: 'Premium Sharbati/Lokwan wheat with organic compost conditioning'
      },
      {
        id: 'crp-4',
        farmer_id: 'usr-farmer-2',
        crop_name: 'Gram (Chana / Chickpea)',
        quantity: 18,
        unit: 'Quintal',
        location: 'Kalmeshwar, Nagpur',
        sowing_date: '2026-10-15',
        expected_harvest_date: '2027-01-30',
        status: 'Growing',
        stage: 'Flowering Stage',
        progress_percent: 50,
        health_status: 'Good',
        expected_yield_quintals: 18,
        soil_type: 'Medium Loamy Soil',
        notes: 'Desi Vijay Chana intercropped with mustard'
      }
    ]
  };

  const DEMO_USER_BOOKINGS = {
    'usr-farmer-1': [
      {
        id: 'BK-1092',
        item: 'Mahindra 575 DI XP Plus (47 HP)',
        itemName: 'Mahindra 575 DI XP Plus (47 HP)',
        item_name: 'Mahindra 575 DI XP Plus (47 HP)',
        type: 'Tractor Rental',
        itemType: 'Tractor Rental',
        item_type: 'Tractor Rental',
        owner: 'Suresh Deshmukh',
        driverName: 'Suresh Deshmukh',
        driver_name: 'Suresh Deshmukh',
        startDate: '2026-10-15',
        start_date: '2026-10-15',
        endDate: '2026-10-16',
        end_date: '2026-10-16',
        duration: '1 Day',
        price: 3200,
        totalCost: 3200,
        total_cost: 3200,
        status: 'Upcoming',
        location: 'Wardha Farm Yard',
        contact_phone: '+91 98230 44112',
        driver_phone: '+91 98230 44112',
        notes: 'Includes heavy-duty 7-foot Rotavator for black soil tillage.'
      },
      {
        id: 'BK-0844',
        item: 'Mahindra Bolero Maxi Truck (1.5 Ton)',
        itemName: 'Mahindra Bolero Maxi Truck (1.5 Ton)',
        item_name: 'Mahindra Bolero Maxi Truck (1.5 Ton)',
        type: 'Transport Vehicle',
        itemType: 'Transport Vehicle',
        item_type: 'Transport Vehicle',
        owner: 'Vinayak Pawar',
        driverName: 'Vinayak Pawar',
        driver_name: 'Vinayak Pawar',
        startDate: '2026-10-10',
        start_date: '2026-10-10',
        endDate: '2026-10-10',
        end_date: '2026-10-10',
        duration: '1 Day',
        price: 1356,
        totalCost: 1356,
        total_cost: 1356,
        status: 'Active',
        location: 'Wardha Farm → Wardha Cotton Mandi',
        contact_phone: '+91 93701 55667',
        driver_phone: '+91 93701 55667',
        notes: 'Transit to Wardha Cotton Mandi with digital weighbridge invoice.'
      }
    ],
    'usr-farmer-2': [
      {
        id: 'BK-0912',
        item: 'Swaraj 855 FE (52 HP Heavy Duty)',
        itemName: 'Swaraj 855 FE (52 HP Heavy Duty)',
        item_name: 'Swaraj 855 FE (52 HP Heavy Duty)',
        type: 'Tractor Rental',
        itemType: 'Tractor Rental',
        item_type: 'Tractor Rental',
        owner: 'Balwinder Logistics',
        driverName: 'Balwinder Logistics',
        driver_name: 'Balwinder Logistics',
        startDate: '2026-10-18',
        start_date: '2026-10-18',
        endDate: '2026-10-19',
        end_date: '2026-10-19',
        duration: '1 Day',
        price: 3500,
        totalCost: 3500,
        total_cost: 3500,
        status: 'Upcoming',
        location: 'Kalmeshwar Farm',
        contact_phone: '+91 98220 55443',
        driver_phone: '+91 98220 55443',
        notes: 'Includes reversible MB Plough for soil aeration.'
      }
    ]
  };

  const DEMO_USER_ALERTS = {
    'usr-farmer-1': [
      {
        id: 'alt-1',
        commodity: 'Cotton (Kapas)',
        market: 'Wardha Cotton Mandi',
        targetPrice: 7600,
        condition: 'above',
        status: 'Active',
        created_at: '2026-10-01'
      },
      {
        id: 'alt-2',
        commodity: 'Soybean (Yellow)',
        market: 'Wardha APMC',
        targetPrice: 5000,
        condition: 'above',
        status: 'Active',
        created_at: '2026-10-05'
      }
    ],
    'usr-farmer-2': [
      {
        id: 'alt-3',
        commodity: 'Wheat (Lokwan)',
        market: 'Nagpur APMC',
        targetPrice: 2850,
        condition: 'above',
        status: 'Active',
        created_at: '2026-10-08'
      }
    ]
  };

  // Core Data Stores from Backend
  const [crops, setCrops] = useState([]);
  const [myCrops, setMyCrops] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication State
  // ─────────────────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true); // true during initial token verification

  const isAuthenticated = Boolean(authUser);

  // Helper: Get user-scoped localStorage key
  const getUserScopedKey = (key, userId = authUser?.id) => {
    return userId ? `agri_u_${userId}_${key}` : `agri_guest_${key}`;
  };

  // Helper: Build normalized user profile
  const buildUserProfile = (user) => {
    if (!user) {
      return {
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'farmer',
        location: '',
        farmLand: '',
        farmSizeAcres: null,
        soilType: '',
        primaryCommodities: '',
        businessName: '',
        defaultMandi: 'Nagpur APMC'
      };
    }
    return {
      id: user.id || '',
      name: user.name || user.full_name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || user.contact || user.mobile || '',
      role: user.role || 'farmer',
      location: user.location || '',
      farmLand: user.farm_land || user.farmLand || (user.role === 'farmer' ? `${user.location || 'Local'} Agro Farm` : ''),
      farmSizeAcres: user.farm_size_acres !== undefined && user.farm_size_acres !== null ? user.farm_size_acres : (user.farmSizeAcres || (user.role === 'farmer' ? 3.0 : null)),
      soilType: user.soil_type || user.soilType || (user.role === 'farmer' ? 'Black Cotton Soil' : ''),
      primaryCommodities: user.primary_commodities || user.primaryCommodities || '',
      businessName: user.business_name || user.businessName || (user.role === 'farmer' ? `${user.name || ''} Farms` : `${user.name || ''} Logistics & Trade`),
      defaultMandi: user.default_mandi || user.defaultMandi || 'Nagpur APMC'
    };
  };

  // User Profile - initialized immediately from cached authUser if available
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_auth_user');
      if (saved) return buildUserProfile(JSON.parse(saved));
    } catch {}
    return buildUserProfile(null);
  });

  // Watchlist Favorites (Prevents crash in WatchlistNotifications)
  const [favoriteCrops, setFavoriteCrops] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_favorites');
      return saved ? JSON.parse(saved) : ['Cotton', 'Soybean', 'Wheat'];
    } catch {
      return ['Cotton', 'Soybean', 'Wheat'];
    }
  });

  const isFavoriteCrop = (cropIdOrName) => {
    if (!cropIdOrName) return false;
    const target = String(cropIdOrName).toLowerCase().trim();
    return favoriteCrops.some(f => {
      const fav = String(f).toLowerCase().trim();
      return fav === target || target.includes(fav) || fav.includes(target);
    });
  };

  const toggleFavoriteCrop = (cropIdOrName) => {
    if (!cropIdOrName) return;
    const cropKey = String(cropIdOrName).trim();
    const activeId = authUser?.id || 'guest';

    setFavoriteCrops(prev => {
      const targetLower = cropKey.toLowerCase();
      const existingIdx = prev.findIndex(item => item.toLowerCase() === targetLower);
      let next;
      let added = false;

      if (existingIdx >= 0) {
        next = prev.filter((_, idx) => idx !== existingIdx);
        added = false;
      } else {
        next = [...prev, cropKey];
        added = true;
      }

      try {
        localStorage.setItem('agri_favorites', JSON.stringify(next));
        if (authUser?.id) {
          localStorage.setItem(`agri_u_${authUser.id}_favorites`, JSON.stringify(next));
        }
      } catch (e) {}

      if (showToast) {
        if (added) {
          showToast(`Added "${cropKey}" to Favorite Watchlist ⭐`, 'success');
        } else {
          showToast(`Removed "${cropKey}" from Favorite Watchlist`, 'info');
        }
      }

      return next;
    });
  };

  const addFavoriteCrop = (cropIdOrName) => {
    if (!cropIdOrName) return;
    const cropKey = String(cropIdOrName).trim();
    if (!isFavoriteCrop(cropKey)) {
      toggleFavoriteCrop(cropKey);
    }
  };

  const removeFavoriteCrop = (cropIdOrName) => {
    if (!cropIdOrName) return;
    const cropKey = String(cropIdOrName).trim();
    if (isFavoriteCrop(cropKey)) {
      toggleFavoriteCrop(cropKey);
    }
  };

  // Transactions Ledger (Prevents crash in TransactionsManager)
  const [transactions, setTransactions] = useState([
    { id: 'TXN-90412', type: 'Crop Sale Payout', item: '35 Qtl Cotton (Kapas) to Vidarbha Agro', date: '2026-09-24', amount: 253750, status: 'Completed' },
    { id: 'TXN-88120', type: 'Machinery Rental Fee', item: 'Mahindra 575 DI (1 Day Hire)', date: '2026-09-20', amount: 3200, status: 'Completed' },
    { id: 'TXN-86401', type: 'Transport Payout', item: 'Bolero Maxi Truck 42km Transit', date: '2026-09-18', amount: 1356, status: 'Completed' },
    { id: 'TXN-85190', type: 'Cold Storage Deposit', item: 'Nagpur Cold Storage Bay #4', date: '2026-09-12', amount: 4800, status: 'Completed' }
  ]);

  // Toasts System
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', title = null) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev.slice(-3), { id, message, type, title, createdAt: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Data Fetching - Always fetches market prices; user data only when authenticated
  // ─────────────────────────────────────────────────────────────────────────
  const fetchMarketData = async () => {
    try {
      const marketRes = await api.getLatestPrices().catch(() => null);
      if (marketRes && marketRes.success) {
        setMarketPrices(marketRes.data || []);
        setDataTelemetry({
          status: marketRes.dataStatus || 'cached',
          badge: marketRes.badge || '🟡 Cached',
          lastSync: marketRes.lastUpdated,
          minutesAgo: marketRes.minutesAgo,
          source: marketRes.source
        });
      }
    } catch (err) {
      console.warn('Market data fetch warning:', err.message);
    }
  };

  const fetchUserData = async (activeUser = authUser) => {
    if (!activeUser) {
      setCrops([]);
      setMyCrops([]);
      setBookings([]);
      setPriceAlerts([]);
      return;
    }

    try {
      // 1. Crops: fetch from backend, fall back to user-scoped storage, or distinct demo set
      let userCrops = [];
      const cropsRes = await api.getCrops({ my_crops: true }).catch(() => null);
      if (cropsRes && Array.isArray(cropsRes.data) && cropsRes.data.length > 0) {
        userCrops = cropsRes.data;
      } else {
        const savedKey = `agri_u_${activeUser.id}_crops`;
        const savedCrops = localStorage.getItem(savedKey);
        if (savedCrops) {
          try { userCrops = JSON.parse(savedCrops); } catch(e) {}
        } else if (DEMO_USER_CROPS[activeUser.id]) {
          userCrops = DEMO_USER_CROPS[activeUser.id];
        } else {
          userCrops = [];
        }
      }
      setCrops(userCrops);
      setMyCrops(userCrops);
      try { localStorage.setItem(`agri_u_${activeUser.id}_crops`, JSON.stringify(userCrops)); } catch(e){}

      // 2. Buyers (all users can browse buyer listings)
      const buyersRes = await api.getBuyers().catch(() => ({ data: [] }));
      if (buyersRes && buyersRes.data) {
        setBuyers(buyersRes.data);
      }

      // 3. Bookings: isolated per user with universal dual-key normalization
      let userBookings = [];
      const bkRes = await api.getBookings().catch(() => null);
      if (bkRes && Array.isArray(bkRes.data) && bkRes.data.length > 0) {
        userBookings = bkRes.data;
      } else {
        const savedKey = `agri_u_${activeUser.id}_bookings`;
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          try { userBookings = JSON.parse(saved); } catch(e) {}
        } else if (DEMO_USER_BOOKINGS[activeUser.id]) {
          userBookings = DEMO_USER_BOOKINGS[activeUser.id];
        } else {
          userBookings = [];
        }
      }

      // Universal dual-key normalization
      userBookings = userBookings.map(b => ({
        ...b,
        id: b.id,
        item: b.item || b.item_name || b.itemName || 'Agri Equipment',
        item_name: b.item || b.item_name || b.itemName || 'Agri Equipment',
        itemName: b.item || b.item_name || b.itemName || 'Agri Equipment',
        type: b.type || b.item_type || b.itemType || 'Rental',
        item_type: b.type || b.item_type || b.itemType || 'Rental',
        itemType: b.type || b.item_type || b.itemType || 'Rental',
        owner: b.owner || b.driver_name || b.driverName || 'Verified Partner',
        driver_name: b.owner || b.driver_name || b.driverName || 'Verified Partner',
        driverName: b.owner || b.driver_name || b.driverName || 'Verified Partner',
        startDate: b.startDate || b.start_date || b.date || '',
        start_date: b.startDate || b.start_date || b.date || '',
        endDate: b.endDate || b.end_date || b.startDate || b.start_date || '',
        end_date: b.endDate || b.end_date || b.startDate || b.start_date || '',
        duration: b.duration || '1 Day',
        price: b.price !== undefined ? b.price : (b.total_cost ?? b.totalCost ?? 0),
        total_cost: b.price !== undefined ? b.price : (b.total_cost ?? b.totalCost ?? 0),
        totalCost: b.price !== undefined ? b.price : (b.total_cost ?? b.totalCost ?? 0),
        status: b.status || 'Upcoming',
        location: b.location || 'Maharashtra',
        contact_phone: b.contact_phone || b.driver_phone || '+91 98220 11223',
        notes: b.notes || '',
        image: b.image || ''
      }));

      setBookings(userBookings);
      try { localStorage.setItem(`agri_u_${activeUser.id}_bookings`, JSON.stringify(userBookings)); } catch(e){}

      // 4. Price Alerts: isolated per user
      let userAlerts = [];
      const altRes = await api.getAlerts().catch(() => null);
      if (Array.isArray(altRes) && altRes.length > 0) {
        userAlerts = altRes;
      } else {
        const savedKey = `agri_u_${activeUser.id}_alerts`;
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          try { userAlerts = JSON.parse(saved); } catch(e) {}
        } else if (DEMO_USER_ALERTS[activeUser.id]) {
          userAlerts = DEMO_USER_ALERTS[activeUser.id];
        } else {
          userAlerts = [];
        }
      }
      setPriceAlerts(userAlerts);
      try { localStorage.setItem(`agri_u_${activeUser.id}_alerts`, JSON.stringify(userAlerts)); } catch(e){}

      // 5. Dashboard Summary
      const dashRes = await api.getDashboard().catch(() => null);
      if (dashRes && dashRes.success) {
        setDashboardStats(dashRes.stats);
      }

      // 6. User Watchlist Favorites
      const savedFavKey = `agri_u_${activeUser.id}_favorites`;
      const savedFavs = localStorage.getItem(savedFavKey);
      if (savedFavs) {
        try {
          const parsed = JSON.parse(savedFavs);
          if (Array.isArray(parsed)) setFavoriteCrops(parsed);
        } catch(e) {}
      }
    } catch (err) {
      console.warn('User data load warning:', err.message);
    }
  };

  const fetchAllData = async (user = authUser) => {
    await fetchMarketData();
    if (getStoredToken() || user) {
      await fetchUserData(user);
    }
  };

  // Restore session from stored token on app startup
  useEffect(() => {
    const restoreSession = async () => {
      const token = getStoredToken();
      if (!token) {
        setAuthLoading(false);
        // Still fetch public market data
        fetchMarketData();
        return;
      }
      try {
        // Verify token with backend - GET /api/auth/me
        const res = await api.getMe();
        if (res && res.success && res.user) {
          const user = res.user;
          setAuthUser(user);
          setRoleState(user.role);
          localStorage.setItem('agri_active_role', user.role);
          localStorage.setItem('agri_auth_user', JSON.stringify(user));
          setUserProfile(buildUserProfile(user));
          // Now fetch user-specific data
          await fetchAllData(user);
        } else {
          clearToken();
          try { localStorage.removeItem('agri_auth_user'); } catch(e){}
          fetchMarketData();
        }
      } catch {
        clearToken();
        fetchMarketData();
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Automatic Real-Time Market Data Polling (Continuous background refresh every 30 seconds)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchMarketData();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  // Manual Trigger to Refresh Market Data
  const refreshMarketData = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncMarketData();
      if (res.success) {
        showToast(`Market data refreshed! (${res.syncResult?.recordsFetched || res.recordsFetched || 0} records synced)`, 'success');
        await fetchMarketData();
      }
    } catch (err) {
      showToast('Data refresh failed; showing cached data.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Farmer Crop CRUD Handlers
  const addCrop = async (cropData) => {
    try {
      const activeId = authUser?.id || 'usr-farmer-1';
      const res = await api.createCrop(cropData);
      if (res.success) {
        const newCrop = res.data;
        setCrops(prev => {
          const updated = [newCrop, ...prev];
          try { localStorage.setItem(getUserScopedKey('crops', activeId), JSON.stringify(updated)); } catch(e){}
          return updated;
        });
        setMyCrops(prev => [{
          id: newCrop.id,
          cropName: newCrop.crop_name,
          areaAcres: newCrop.quantity,
          sowingDate: newCrop.sowing_date,
          expectedHarvestDate: newCrop.expected_harvest_date,
          expectedYieldQuintals: newCrop.expected_yield_quintals,
          stage: newCrop.stage,
          progressPercent: newCrop.progress_percent,
          healthStatus: newCrop.health_status,
          location: newCrop.location,
          status: newCrop.status
        }, ...prev]);
        showToast(`Crop "${newCrop.crop_name}" registered successfully!`, 'success');
        return { success: true, data: newCrop };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const updateCrop = async (id, cropData) => {
    try {
      const activeId = authUser?.id || 'usr-farmer-1';
      const res = await api.updateCrop(id, cropData);
      if (res.success) {
        setCrops(prev => {
          const updated = prev.map(c => c.id === id ? res.data : c);
          try { localStorage.setItem(getUserScopedKey('crops', activeId), JSON.stringify(updated)); } catch(e){}
          return updated;
        });
        setMyCrops(prev => prev.map(c => c.id === id ? {
          ...c,
          cropName: res.data.crop_name,
          areaAcres: res.data.quantity,
          stage: res.data.stage,
          progressPercent: res.data.progress_percent,
          healthStatus: res.data.health_status
        } : c));
        showToast('Crop updated successfully!', 'success');
        return { success: true, data: res.data };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const deleteCrop = async (id) => {
    try {
      const activeId = authUser?.id || 'usr-farmer-1';
      await api.deleteCrop(id);
      setCrops(prev => {
        const updated = prev.filter(c => c.id !== id);
        try { localStorage.setItem(getUserScopedKey('crops', activeId), JSON.stringify(updated)); } catch(e){}
        return updated;
      });
      setMyCrops(prev => prev.filter(c => c.id !== id));
      showToast('Crop deleted from farm registry.', 'info');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Backward compatible addCropToMyFarm
  const addCropToMyFarm = async (cropData) => {
    return addCrop({
      crop_name: cropData.cropName,
      quantity: cropData.areaAcres || cropData.expectedYieldQuintals || 10,
      sowing_date: cropData.sowingDate,
      expected_harvest_date: cropData.expectedHarvestDate,
      expected_yield_quintals: cropData.expectedYieldQuintals,
      stage: cropData.stage || 'Vegetative Growth',
      health_status: cropData.healthStatus || 'Good',
      soil_type: cropData.soilType
    });
  };

  // Buyer Listing Handlers
  const addBuyerListing = async (buyerData) => {
    try {
      const res = await api.createBuyer(buyerData);
      if (res.success) {
        setBuyers(prev => [res.data, ...prev]);
        showToast('Buyer requirement listing created!', 'success');
        return { success: true, data: res.data };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Add Booking with persistent state and user isolation
  const addBooking = async (bookingData) => {
    const activeId = authUser?.id || 'guest';
    const itemName = bookingData.item || bookingData.itemName || bookingData.item_name || 'Agri Equipment';
    const itemType = bookingData.type || bookingData.itemType || bookingData.item_type || 'Rental';
    const startDate = bookingData.startDate || bookingData.start_date || bookingData.date || new Date().toISOString().split('T')[0];
    const duration = bookingData.duration || '1 Day';
    const endDate = bookingData.endDate || bookingData.end_date || startDate;
    const price = Number(bookingData.price ?? bookingData.totalPrice ?? bookingData.totalCost ?? bookingData.total_cost ?? 1200);
    const owner = bookingData.owner || bookingData.driverName || bookingData.driver_name || 'Verified Partner';
    const contactPhone = bookingData.contact_phone || bookingData.driverPhone || bookingData.driver_phone || bookingData.ownerPhone || '+91 98220 11223';
    const location = bookingData.location || authUser?.location || 'Nagpur APMC Hub';
    const notes = bookingData.notes || 'AgriPulse verified booking';
    const image = bookingData.image || '';

    const genId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: bookingData.id && bookingData.id.startsWith('BK-') ? bookingData.id : genId,
      user_id: activeId,
      resourceId: bookingData.resourceId || bookingData.itemId || genId,
      item: itemName,
      itemName: itemName,
      item_name: itemName,
      type: itemType,
      itemType: itemType,
      item_type: itemType,
      owner: owner,
      driver_name: owner,
      driverName: owner,
      startDate: startDate,
      start_date: startDate,
      endDate: endDate,
      end_date: endDate,
      duration: duration,
      price: price,
      total_cost: price,
      totalCost: price,
      status: 'Upcoming',
      location: location,
      contact_phone: contactPhone,
      driver_phone: contactPhone,
      image: image,
      notes: notes
    };

    let confirmed = newBooking;

    try {
      const res = await api.createBooking(newBooking);
      if (res && res.data) {
        confirmed = { ...newBooking, ...res.data };
      }
    } catch (backendErr) {
      console.warn('Backend sync pending for booking:', backendErr.message);
    }

    setBookings(prev => {
      const filtered = prev.filter(b => b.id !== confirmed.id);
      const updated = [confirmed, ...filtered];
      try { localStorage.setItem(getUserScopedKey('bookings', activeId), JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    showToast(`Booking confirmed! ID: ${confirmed.id}`, 'success');
    return { success: true, data: confirmed };
  };

  // Cancel Booking
  const cancelBooking = async (bookingId) => {
    const activeId = authUser?.id || 'guest';
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b);
      try { localStorage.setItem(getUserScopedKey('bookings', activeId), JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    try {
      await api.cancelBooking(bookingId);
    } catch (backendErr) {
      console.warn('Backend cancel sync pending:', backendErr.message);
    }

    showToast('Booking cancelled.', 'info');
    return { success: true };
  };

  // Update Booking Status (e.g. Upcoming -> Active -> Completed)
  const updateBookingStatus = async (bookingId, newStatus, metadata = {}) => {
    const activeId = authUser?.id || 'guest';
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status: newStatus, ...metadata } : b);
      try { localStorage.setItem(getUserScopedKey('bookings', activeId), JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    try {
      await api.updateBookingStatus(bookingId, newStatus, metadata);
    } catch (backendErr) {
      console.warn('Backend status update sync pending:', backendErr.message);
    }

    const toastMsgs = {
      Active: '🚜 Tractor Dispatched! Driver is en route to farm.',
      Completed: '✅ Field work completed & payment settled!',
      Cancelled: 'Booking has been cancelled.'
    };
    showToast(toastMsgs[newStatus] || `Booking status updated to ${newStatus}.`, 'success');
    return { success: true };
  };

  // Add Price Alert
  const addPriceAlert = async (alertData) => {
    const activeId = authUser?.id || 'guest';
    const newAlert = {
      id: `alt-${Date.now()}`,
      commodity: alertData.commodity || alertData.crop || 'Cotton (Kapas)',
      market: alertData.market || alertData.mandi || 'All Mandis',
      targetPrice: Number(alertData.targetPrice) || 8000,
      condition: alertData.condition || 'above',
      status: 'Active',
      created_at: new Date().toISOString().split('T')[0]
    };

    setPriceAlerts(prev => {
      const updated = [newAlert, ...prev];
      try { localStorage.setItem(getUserScopedKey('alerts', activeId), JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    try {
      await api.createAlert(alertData);
    } catch (backendErr) {
      console.warn('Backend sync pending for price alert:', backendErr.message);
    }

    showToast(`Price alert set for ${newAlert.commodity}! Target: ₹${newAlert.targetPrice}/qtl`, 'success');
  };

  // Delete Price Alert
  const removePriceAlert = async (id) => {
    const activeId = authUser?.id || 'guest';
    setPriceAlerts(prev => {
      const updated = prev.filter(a => a.id !== id);
      try { localStorage.setItem(getUserScopedKey('alerts', activeId), JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    try {
      await api.deleteAlert(id);
    } catch (backendErr) {
      console.warn('Backend delete sync pending for price alert:', backendErr.message);
    }

    showToast('Price alert removed', 'info');
  };

  // Update Profile
  const updateUserProfile = async (updates) => {
    try {
      const res = await api.updateProfile(updates);
      if (res.success && res.data) {
        const updated = buildUserProfile(res.data);
        setUserProfile(updated);
        setAuthUser(prev => {
          const merged = prev ? { ...prev, ...res.data } : res.data;
          try { localStorage.setItem('agri_auth_user', JSON.stringify(merged)); } catch(e){}
          return merged;
        });
        if (res.data.role) {
          setRole(res.data.role);
          try { localStorage.setItem('agri_active_role', res.data.role); } catch(e){}
        }
        showToast('Profile & Farmland details updated successfully!', 'success');
        return { success: true, data: updated };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication Functions
  // ─────────────────────────────────────────────────────────────────────────

  const loginUser = async ({ email, password }) => {
    try {
      const res = await api.login({ email, password });
      if (res && res.success && res.user && res.token) {
        const user = res.user;
        storeToken(res.token);
        setAuthUser(user);
        setUserProfile(buildUserProfile(user));
        try { localStorage.setItem('agri_auth_user', JSON.stringify(user)); } catch(e){}
        if (user.role) {
          setRole(user.role);
          try { localStorage.setItem('agri_active_role', user.role); } catch(e){}
        }
        // Reset in-memory state cleanly before loading the new user's scoped data
        setCrops([]);
        setMyCrops([]);
        setBookings([]);
        setPriceAlerts([]);
        showToast(`Welcome back, ${user.name}!`, 'success');
        // Fetch user-specific data after login
        await fetchUserData(user);
        return { success: true, user };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
      return { success: false, message: err.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await api.signup(userData);
      if (res && res.success && res.user && res.token) {
        const user = res.user;
        storeToken(res.token);
        setAuthUser(user);
        setUserProfile(buildUserProfile(user));
        try { localStorage.setItem('agri_auth_user', JSON.stringify(user)); } catch(e){}
        if (user.role) {
          setRole(user.role);
          try { localStorage.setItem('agri_active_role', user.role); } catch(e){}
        }
        // Brand new account starts with zero crops/bookings/alerts
        setCrops([]);
        setMyCrops([]);
        setBookings([]);
        setPriceAlerts([]);
        try {
          localStorage.setItem(`agri_u_${user.id}_crops`, JSON.stringify([]));
          localStorage.setItem(`agri_u_${user.id}_bookings`, JSON.stringify([]));
          localStorage.setItem(`agri_u_${user.id}_alerts`, JSON.stringify([]));
        } catch(e) {}
        showToast(`Account created! Welcome, ${user.name}!`, 'success');
        return { success: true, user };
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      showToast(err.message || 'Registration error', 'error');
      return { success: false, message: err.message };
    }
  };

  const logoutUser = async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      clearToken();
      setAuthUser(null);
      setUserProfile(buildUserProfile(null));
      try { localStorage.removeItem('agri_auth_user'); } catch(e){}
      // Clear user-specific data completely so next login starts clean
      setCrops([]);
      setMyCrops([]);
      setBookings([]);
      setPriceAlerts([]);
      setDashboardStats(null);
      setUserProfile(buildUserProfile(null));
      showToast('Signed out successfully.', 'info');
    }
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      language,
      setLanguage,
      t,
      authUser,
      authLoading,
      isAuthenticated,
      loginUser,
      registerUser,
      logoutUser,
      isAiAssistantOpen,
      setIsAiAssistantOpen,
      isSearchOpen,
      setIsSearchOpen,
      dataTelemetry,
      marketPrices,
      isSyncing,
      refreshMarketData,
      crops,
      addCrop,
      updateCrop,
      deleteCrop,
      myCrops,
      addCropToMyFarm,
      buyers,
      addBuyerListing,
      bookings,
      setBookings,
      addBooking,
      updateBookingStatus,
      cancelBooking,
      priceAlerts,
      addPriceAlert,
      removePriceAlert,
      dashboardStats,
      userProfile,
      updateUserProfile,
      getUserScopedKey,
      favoriteCrops,
      toggleFavoriteCrop,
      isFavoriteCrop,
      addFavoriteCrop,
      removeFavoriteCrop,
      transactions,
      toasts,
      showToast,
      removeToast,
      fetchAllData,
      fetchUserData,
      fetchMarketData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
