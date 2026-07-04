import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SchoolHeader from './SchoolHeader';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'teacher') return '/teacher-dashboard';
    return '/dashboard';
  };

  const getRoleIcon = () => {
    if (role === 'admin') return '🔧';
    if (role === 'teacher') return '👨‍🏫';
    return '👨‍🎓';
  };

  return (
    <>
      <SchoolHeader />
      
      <nav className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center">
              <Link to="/" className="text-lg font-bold flex items-center gap-2">
                <span>⚡</span>
                <span>Spark 4.0</span>
                <span className="hidden md:inline text-xs bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full ml-2">
                  Science Fair
                </span>
              </Link>
              {token && user && (
                <span className="ml-3 text-xs bg-blue-500/50 px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1">
                  {getRoleIcon()} {role}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {token ? (
                <>
                  <Link to={getDashboardLink()} className="hover:bg-blue-500/50 px-3 py-1.5 rounded text-sm transition">
                    📊 Dashboard
                  </Link>
                  
                  {role === 'student' && (
                    <Link to="/submit-project" className="hover:bg-blue-500/50 px-3 py-1.5 rounded text-sm transition">
                      📝 Submit
                    </Link>
                  )}
                  
                  {role === 'admin' && (
                    <Link to="/admin" className="hover:bg-blue-500/50 px-3 py-1.5 rounded text-sm transition">
                      🔧 Admin
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/80 hover:bg-red-600 px-4 py-1.5 rounded text-sm transition"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="hover:bg-blue-500/50 px-3 py-1.5 rounded text-sm transition">
                    📝 Register
                  </Link>
                  <Link to="/login" className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-1.5 rounded text-sm font-medium transition">
                    🔐 Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;