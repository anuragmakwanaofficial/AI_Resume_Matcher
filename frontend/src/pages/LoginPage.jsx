import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-center text-on-surface mb-6">Welcome Back</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            Login
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-secondary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
