import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, loading: authLoading, login } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_analyses: 0 });
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'analyses'
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [analysesRes, statsRes, usersRes] = await Promise.all([
        adminAPI.getAllAnalyses(1, 50),
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);
      setAnalyses(analysesRes.data.items);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also delete their analysis history.")) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsersList(usersList.filter(u => u.id !== userId));
      // Re-fetch stats after deletion
      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Login failed');
    }
  };

  if (authLoading) return <div className="text-center mt-20">Checking Authentication...</div>;
  if (!user) return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl">
        <div className="flex justify-center mb-4">
          <span className="material-symbols-outlined text-secondary text-5xl">admin_panel_settings</span>
        </div>
        <h1 className="text-3xl font-bold text-center text-on-surface mb-6">Admin Login</h1>
        
        {loginError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{loginError}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-colors duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-colors duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
            Login as Admin
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link to="/" className="text-secondary hover:underline">Return to App</Link>
        </div>
      </div>
    </div>
  );
  if (!user.is_admin) return (
    <div className="min-h-screen p-8 background text-on-surface flex items-center justify-center">
      <div className="glass-card p-8 rounded-2xl shadow-sm text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-4">gpp_bad</span>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-on-surface-variant mb-6">You must be an administrator to view this page.</p>
        <Link to="/" className="btn-primary">Return Home</Link>
      </div>
    </div>
  );

  if (loading) return <div className="text-center mt-20">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen p-8 background text-on-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link to="/" className="text-secondary hover:underline">Exit Admin</Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl shadow-sm text-center">
            <h3 className="text-xl font-semibold mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-primary">{stats.total_users}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl shadow-sm text-center">
            <h3 className="text-xl font-semibold mb-2">Total Analyses Run</h3>
            <p className="text-4xl font-bold text-secondary">{stats.total_analyses}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-outline-variant">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-2 font-semibold ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
          >
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('analyses')}
            className={`pb-2 font-semibold ${activeTab === 'analyses' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
          >
            System Analyses
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest text-sm uppercase font-semibold">
                <tr>
                  <th className="p-4 border-b">ID</th>
                  <th className="p-4 border-b">Email</th>
                  <th className="p-4 border-b">Role</th>
                  <th className="p-4 border-b">Created At</th>
                  <th className="p-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0 transition-colors">
                    <td className="p-4 text-xs font-mono">{item.id.slice(0,8)}...</td>
                    <td className="p-4 truncate max-w-[200px]">{item.email}</td>
                    <td className="p-4">
                      {item.is_admin ? (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">Admin</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">User</span>
                      )}
                    </td>
                    <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      {!item.is_admin && (
                        <button 
                          onClick={() => handleDeleteUser(item.id)}
                          className="text-error hover:underline font-medium text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {usersList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analyses' && (
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest text-sm uppercase font-semibold">
                <tr>
                  <th className="p-4 border-b">ID</th>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Resume</th>
                  <th className="p-4 border-b">User ID</th>
                  <th className="p-4 border-b">Score</th>
                  <th className="p-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0 transition-colors">
                    <td className="p-4 text-xs font-mono">{item.id.slice(0,8)}...</td>
                    <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="p-4 truncate max-w-[200px]">{item.resume_filename || 'Pasted Text'}</td>
                    <td className="p-4 text-xs font-mono">{item.user_id ? item.user_id.slice(0,8) + '...' : 'Anon'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.overall_score >= 80 ? 'bg-green-100 text-green-800' : 
                        item.overall_score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.overall_score}%
                      </span>
                    </td>
                    <td className="p-4">
                      <Link to={`/results/${item.id}`} className="text-secondary hover:underline font-medium text-sm">View Result</Link>
                    </td>
                  </tr>
                ))}
                {analyses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No analyses found in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
