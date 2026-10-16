import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { useApp } from './context/AppContext';

// Layout Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ToastNotification } from './components/ToastNotification';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AIChatWidget } from './components/AIChatWidget';

// Pages
import { Dashboard } from './pages/Dashboard';
import { CropForecasting } from './pages/CropForecasting';
import { SellingDecision } from './pages/SellingDecision';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { SupplyChain } from './pages/SupplyChain';
import { TractorRental } from './pages/TractorRental';
import { EquipmentRental } from './pages/EquipmentRental';
import { TransportRental } from './pages/TransportRental';
import { EquipmentGuide } from './pages/EquipmentGuide';
import { MachineryAdvisor } from './pages/MachineryAdvisor';
import { StorageFinder } from './pages/StorageFinder';
import { WeatherIntelligence } from './pages/WeatherIntelligence';
import { MyCrops } from './pages/MyCrops';
import { DemandSupply } from './pages/DemandSupply';
import { FarmerMarketplace } from './pages/FarmerMarketplace';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { MLModelPerformance } from './pages/MLModelPerformance';
import { BookingsManager } from './pages/BookingsManager';
import { TransactionsManager } from './pages/TransactionsManager';
import { WatchlistNotifications } from './pages/WatchlistNotifications';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { ProfileSettings } from './pages/ProfileSettings';
import { AdminDashboard } from './pages/AdminDashboard';
import { CottonFlowWalkthrough } from './pages/CottonFlowWalkthrough';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// ─── Smart root redirect ──────────────────────────────────────────────────────
function RootRedirect() {
  const { isAuthenticated, authLoading, authUser } = useApp();
  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const roleHome = { admin: '/admin', buyer: '/dashboard', farmer: '/dashboard', owner: '/dashboard' };
  return <Navigate to={roleHome[authUser?.role] || '/dashboard'} replace />;
}

// ─── Single unified layout ────────────────────────────────────────────────────
function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Auth pages: no shell chrome (no navbar, no sidebar, no bottom nav)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <>
        <Routes>
          <Route path="/login" element={
            <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
          } />
          <Route path="/signup" element={
            <PublicOnlyRoute><SignupPage /></PublicOnlyRoute>
          } />
        </Routes>
        <ToastNotification />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex relative">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Root → smart redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* ── All authenticated users ── */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/farmer/dashboard" element={<ProtectedRoute allowedRoles={['farmer','admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['buyer','admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/prices" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
            <Route path="/markets" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
            <Route path="/forecasting" element={<ProtectedRoute><CropForecasting /></ProtectedRoute>} />
            <Route path="/forecast" element={<ProtectedRoute><CropForecasting /></ProtectedRoute>} />
            <Route path="/supply-chain" element={<ProtectedRoute><SupplyChain /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherIntelligence /></ProtectedRoute>} />
            <Route path="/demand-supply" element={<ProtectedRoute><DemandSupply /></ProtectedRoute>} />
            <Route path="/storage" element={<ProtectedRoute><StorageFinder /></ProtectedRoute>} />
            <Route path="/tractors" element={<ProtectedRoute><TractorRental /></ProtectedRoute>} />
            <Route path="/transport" element={<ProtectedRoute><TransportRental /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><EquipmentRental /></ProtectedRoute>} />
            <Route path="/equipment-guide" element={<ProtectedRoute><EquipmentGuide /></ProtectedRoute>} />
            <Route path="/machinery-advisor" element={<ProtectedRoute><MachineryAdvisor /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><FarmerMarketplace /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
            <Route path="/ml-models" element={<ProtectedRoute><MLModelPerformance /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsManager /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsManager /></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><WatchlistNotifications /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsAnalytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/walkthrough" element={<ProtectedRoute><CottonFlowWalkthrough /></ProtectedRoute>} />

            {/* ── Farmer only ── */}
            <Route path="/sell-decision" element={<ProtectedRoute allowedRoles={['farmer','admin']}><SellingDecision /></ProtectedRoute>} />
            <Route path="/my-crops" element={<ProtectedRoute allowedRoles={['farmer','admin']}><MyCrops /></ProtectedRoute>} />

            {/* ── Admin only ── */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* ── Catch-all → login ── */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>

      <BottomNav />
      <AIChatWidget />
      <GlobalSearchModal />
      <ToastNotification />
    </div>
  );
}

// ─── App entry point ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
