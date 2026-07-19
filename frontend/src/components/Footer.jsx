import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RulesModal from './RulesModal';

const Footer = () => {
    const [showRules, setShowRules] = useState(false);
    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-gray-300 pt-8 pb-4 mt-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* School Info */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                🏫 Podar International School
                            </h3>
                            <p className="text-sm text-blue-300 mb-1">Khadgoan Ring Road</p>
                            <p className="text-sm text-blue-300 mb-1">Latur, Maharashtra</p>
                            <p className="text-sm text-blue-300">📍 India</p>
                        </div>

                        {/* Event Info */}
                        <div>
                            <h4 className="text-white font-semibold text-md mb-3">⚡ Spark 4.0</h4>
                            <ul className="space-y-2 text-sm text-blue-300">
                                <li>📅 Science Fair 2026-27</li>
                                <li>🎯 Grades 3-10</li>
                                <li>🏆 10 Divisions</li>
                                <li>👨‍🏫 8 Projects per Class</li>
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold text-md mb-3">🔗 Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/register" className="text-blue-300 hover:text-white transition">
                                        📝 Register
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="text-blue-300 hover:text-white transition">
                                        🔐 Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin" className="text-blue-300 hover:text-white transition">
                                        🔧 Admin
                                    </Link>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setShowRules(true)}
                                        className="text-blue-300 hover:text-white transition text-left cursor-pointer"
                                    >
                                        📋 Rules & Guidelines
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-semibold text-md mb-3">📞 Contact Us</h4>
                            <ul className="space-y-2 text-sm text-blue-300">
                                <li className="flex items-center gap-2">
                                    📱 <a href="tel:+916366437866" className="hover:text-white transition">+91-63664-37866</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    📧 <a href="mailto:spark4.0.sciencefair@gmail.com" className="hover:text-white transition">sciencefair@podar.edu</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    🕐 Mon-Fri: 8:00 AM - 4:00 PM
                                </li>
                            </ul>
                            <div className="flex gap-3 mt-3">
                                <a href="#" className="text-blue-400 hover:text-white transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-blue-400 hover:text-white transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-blue-400 hover:text-white transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-blue-700/50 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-blue-400">
                        <p>
                            © {currentYear} <span className="text-white font-medium">Podar International School, Latur</span>. All Rights Reserved.
                        </p>
                        <p className="mt-2 md:mt-0">
                            Designed with ❤️ for ⚡ Spark 4.0 · Science Fair 2026-27
                        </p>
                    </div>
                </div>
            </footer>

            {/* Rules Modal */}
            <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
        </>
    );
};

export default Footer;