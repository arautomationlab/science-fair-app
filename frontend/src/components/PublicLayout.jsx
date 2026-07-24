// frontend/src/components/PublicLayout.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ✅ SIMPLE PUBLIC NAVBAR - NO LOGIN/DASHBOARD LINKS */}
            <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">✨ Spark 4.0</span>
                            <span className="text-xs bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                                Science Fair
                            </span>
                        </Link>
                        
                        {/* ✅ PUBLIC LINKS ONLY - NO DASHBOARD */}
                        <div className="flex items-center space-x-4">
                            <Link 
                                to="/" 
                                className="hover:text-blue-200 transition px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Home
                            </Link>
                            <Link 
                                to="/register" 
                                className="bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                            >
                                Register
                            </Link>
                            <Link 
                                to="/login" 
                                className="bg-transparent border-2 border-white px-4 py-2 rounded-lg hover:bg-white/10 transition font-medium text-sm"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* ✅ SIMPLE PUBLIC FOOTER */}
            <footer className="bg-gray-800 text-white mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} Spark 4.0 Science Fair. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            📱 Scan QR code to view project details
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;