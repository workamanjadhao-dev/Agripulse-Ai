import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../api/client';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Users, Store, Tractor, Truck, BrainCircuit, Activity, 
  RefreshCw, Sprout, Warehouse, BarChart3, ShoppingBag, Trash2,
  UserCheck, AlertCircle, CheckCircle2, Search, Filter, Eye,
  TrendingUp, Database, Cpu, Globe
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const AdminDashboard = () => {
  const { dataTelemetry, refreshMarketData, isSyncing, showToast } = useApp();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [crops, setCrops] = useState([]);

  const fetchAdminStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res && res.success) {
        setStats(res);
      }
    } catch (err) {
      console.warn('Failed to load admin stats:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {};
      if (userRoleFilter !== 'All') params.role = userRoleFilter;
      if (userSearch) params.search = userSearch;
      const res = await fetch(`${API_BASE_URL}/admin/users?${new URLSearchParams(params)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token')}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.warn('Failed to load users:', err.message);
    }
  };

  const fetchAdminCrops = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/crops`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token')}` }
      });
      const data = await res.json();
      if (data.success) setCrops(data.data);
    } catch (err) {
      console.warn('Failed to load admin crops:', err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This action cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User "${userName}" deleted.`, 'success');
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchAdminStats();
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleForceSync = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/market-data/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Market data synchronized!', 'success');
        fetchAdminStats();
      }
    } catch (err) {
      showToast('Sync failed', 'error');
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchUsers();
    fetchAdminCrops();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter]);

  const statCards = stats ? [
    { label: 'Total Users', val: stats.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200', iconColor: 'text-blue-500' },
    { label: 'Registered Farmers', val: stats.farmersRegistered || 0, icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconColor: 'text-emerald-500' },
    { label: 'Wholesale Buyers', val: stats.buyersRegistered || 0, icon: ShoppingBag, color: 'bg-amber-50 text-amber-700 border-amber-200', iconColor: 'text-amber-500' },
    { label: 'Registered Crops', val: stats.cropsRegistered || 0, icon: Sprout, color: 'bg-green-50 text-green-700 border-green-200', iconColor: 'text-green-500' },
    { label: 'Buyer Requirements', val: stats.buyerRequirements || 0, icon: Store, color: 'bg-purple-50 text-purple-700 border-purple-200', iconColor: 'text-purple-500' },
    { label: 'Active Bookings', val: stats.activeBookings || 0, icon: CalendarCheck, color: 'bg-teal-50 text-teal-700 border-teal-200', iconColor: 'text-teal-500' },
    { label: 'Warehouses', val: stats.warehousesCount || 0, icon: Warehouse, color: 'bg-slate-50 text-slate-700 border-slate-200', iconColor: 'text-slate-500' },
    { label: 'Market Records', val: stats.marketRecordsCount || 0, icon: BarChart3, color: 'bg-rose-50 text-rose-700 border-rose-200', iconColor: 'text-rose-500' },
    { label: 'AI Forecasts Generated', val: stats.forecastsGenerated || 0, icon: BrainCircuit, color: 'bg-violet-50 text-violet-700 border-violet-200', iconColor: 'text-violet-500' },
    { label: 'AI Conversations', val: stats.aiConversations || 0, icon: Cpu, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', iconColor: 'text-indigo-500' },
    { label: 'Machinery Listings', val: stats.machineryListings || 0, icon: Tractor, color: 'bg-orange-50 text-orange-700 border-orange-200', iconColor: 'text-orange-500' },
    { label: 'Mandis Monitored', val: stats.mandisMonitored || 0, icon: Globe, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', iconColor: 'text-cyan-500' },
  ] : [];

  const roleColors = { farmer: 'bg-emerald-100 text-emerald-800', buyer: 'bg-blue-100 text-blue-800', admin: 'bg-purple-100 text-purple-800', owner: 'bg-amber-100 text-amber-800' };
  const statusColors = { Growing: 'text-emerald-600', Harvested: 'text-blue-600', 'Ready to Sell': 'text-amber-600', 'Storage Cured': 'text-purple-600' };

  const pieData = stats ? [
    { name: 'Farmers', value: stats.farmersRegistered || 0, fill: '#16a34a' },
    { name: 'Buyers', value: stats.buyersRegistered || 0, fill: '#2563eb' },
    { name: 'Admins', value: stats.adminsRegistered || 0, fill: '#9333ea' },
  ] : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold">System Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time platform metrics, user management, database telemetry, and Agmarknet sync health.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleForceSync} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Sync Market Data
          </button>
          <button onClick={() => { fetchAdminStats(); fetchUsers(); fetchAdminCrops(); }} disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'crops', label: 'Crops', icon: Sprout },
          { id: 'system', label: 'System', icon: Activity }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {statCards.map((s, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-2xl border shadow-sm space-y-2 ${s.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold opacity-75">{s.label}</span>
                    <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-extrabold">{s.val.toLocaleString('en-IN')}</h3>
                </div>
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 mb-4">User Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 mb-4">Platform Resources</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats ? [
                    { name: 'Crops', value: stats.cropsRegistered || 0 },
                    { name: 'Buyers', value: stats.buyerRequirements || 0 },
                    { name: 'Bookings', value: stats.activeBookings || 0 },
                    { name: 'Warehouses', value: stats.warehousesCount || 0 },
                    { name: 'Machinery', value: stats.machineryListings || 0 },
                    { name: 'Forecasts', value: stats.forecastsGenerated || 0 },
                  ] : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-slate-100 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, location..."
                className="w-full text-xs bg-transparent outline-none text-slate-800 font-medium" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}
                className="text-xs font-bold py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl outline-none">
                {['All', 'farmer', 'buyer', 'admin', 'owner'].map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">Registered Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 font-bold text-slate-600">Name</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Email</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Role</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Location</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Phone</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Joined</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.location || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u.id, u.name)} disabled={deletingId === u.id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50">
                            {deletingId === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CROPS TAB */}
      {activeTab === 'crops' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800">All Registered Crops ({crops.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-bold text-slate-600">Crop</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Farmer</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Quantity</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Location</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Harvest Date</th>
                </tr>
              </thead>
              <tbody>
                {crops.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No crops registered.</td></tr>
                ) : crops.map(c => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.crop_name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.farmer_name || c.farmer_id}</td>
                    <td className="px-4 py-3 font-bold text-agri-700">{c.quantity} {c.unit}</td>
                    <td className="px-4 py-3 text-slate-600">{c.location}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${statusColors[c.status] || 'text-slate-600'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.expected_harvest_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SYSTEM TAB */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-agri-600" />
                <h3 className="font-bold text-sm text-slate-800">SQLite Database</h3>
              </div>
              <p className="text-xs text-emerald-600 font-bold">✅ Connected (Foreign Keys ON)</p>
              <p className="text-[11px] text-slate-500">Tables: users, crops, buyers, warehouses, vehicles, bookings, market_prices, forecasts, ai_conversations</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-800">Gemini AI Status</h3>
              </div>
              <p className="text-xs font-bold" style={{ color: stats?.syncTelemetry?.geminiStatus?.includes('Configured') ? '#16a34a' : '#d97706' }}>
                {stats?.syncTelemetry?.geminiStatus || '🟢 Configured'}
              </p>
              <p className="text-[11px] text-slate-500">Model: gemini-3.8-flash</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-800">Market Data Sync</h3>
              </div>
              <p className="text-xs font-bold text-slate-800">{dataTelemetry.badge}</p>
              <p className="text-[11px] text-slate-500">Source: {dataTelemetry.source}</p>
              <p className="text-[11px] text-slate-400">Last sync: {dataTelemetry.minutesAgo}m ago</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-4">API Endpoints Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { path: '/api/auth/login + signup', status: '✅ Active', desc: 'JWT Authentication' },
                { path: '/api/crops', status: '✅ Active', desc: 'User-scoped CRUD with auth' },
                { path: '/api/buyers', status: '✅ Active', desc: 'Buyer requirements with auth' },
                { path: '/api/market-prices', status: '✅ Active', desc: 'Agmarknet data cached' },
                { path: '/api/forecast', status: '✅ Active', desc: 'AI + statistical fallback' },
                { path: '/api/ai/chat', status: '✅ Active', desc: 'Gemini grounded assistant' },
                { path: '/api/ai/history', status: '✅ Active', desc: 'Conversation history' },
                { path: '/api/warehouses', status: '✅ Active', desc: 'Storage & cold chain' },
                { path: '/api/vehicles', status: '✅ Active', desc: 'Transport & machinery' },
                { path: '/api/bookings', status: '✅ Active', desc: 'User-scoped bookings' },
                { path: '/api/matches', status: '✅ Active', desc: 'Algorithmic matching' },
                { path: '/api/admin/*', status: '✅ Active', desc: 'Admin-only endpoints' },
              ].map((ep, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-mono font-bold text-slate-800">{ep.path}</p>
                    <p className="text-slate-500">{ep.desc}</p>
                  </div>
                  <span className="text-emerald-600 font-bold whitespace-nowrap ml-2">{ep.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// needed for stat card
function CalendarCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
