import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage = 'dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface dark:bg-slate-900 border-b border-outline-variant shadow-sm sticky top-0 z-50 transition-colors">
      <div className="flex justify-between items-center px-lg py-sm w-full max-w-container-max mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-md">
          <span className="material-symbols-outlined text-secondary text-2xl">work_history</span>
          <span className="text-headline-sm font-bold text-on-surface dark:text-white">TalentMatch AI</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-lg">
          {[
            { label: 'Dashboard', href: '/', key: 'dashboard' },
            { label: 'History', href: '/history', key: 'history' },
          ].map(({ label, href, key }) => (
            <Link
              key={key}
              to={href}
              className={`font-label-md text-label-md pb-1 transition-colors duration-200 ${
                activePage === key
                  ? 'text-secondary border-b-2 border-secondary font-bold'
                  : 'text-on-surface-variant dark:text-gray-300 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-sm">
          <ThemeToggle />
          
          {/* User Profile Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-secondary-container dark:bg-secondary flex items-center justify-center border border-outline-variant cursor-pointer hover:ring-2 hover:ring-secondary transition-all"
              aria-label="User menu"
            >
              <span className="material-symbols-outlined text-on-secondary-fixed dark:text-white text-md">
                person
              </span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface dark:bg-slate-800 rounded-md shadow-elevated border border-outline-variant py-2 z-50">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <p className="text-sm font-medium text-on-surface dark:text-white truncate">
                    {user?.email || 'Guest User'}
                  </p>
                  {user?.is_admin && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
                
                {user?.is_admin && (
                  <Link 
                    to="/admin"
                    className="block px-4 py-2 text-sm text-on-surface-variant dark:text-gray-300 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm align-middle mr-2">admin_panel_settings</span>
                    Admin Dashboard
                  </Link>
                )}
                
                {!user ? (
                  <>
                    <Link 
                      to="/login"
                      className="block px-4 py-2 text-sm text-on-surface-variant dark:text-gray-300 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-sm align-middle mr-2">login</span>
                      Login
                    </Link>
                    <Link 
                      to="/register"
                      className="block px-4 py-2 text-sm text-on-surface-variant dark:text-gray-300 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-sm align-middle mr-2">person_add</span>
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/50 dark:hover:bg-error/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm align-middle mr-2">logout</span>
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
