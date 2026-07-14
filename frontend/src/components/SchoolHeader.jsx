import React from 'react';

const SchoolHeader = () => {
    return (
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white shadow-lg relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Logo & School Name */}
                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                        {/* School Logo - Image or Fallback */}
                        <div className="flex-shrink-0">
                            <img 
                                src="/images/school-logo.png" 
                                alt="Podar International School" 
                                className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-full bg-white p-1 shadow-lg border-2 border-yellow-400"
                                onError={(e) => {
                                    // If image fails to load, show text-based logo
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                        <div class="h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-yellow-400">
                                            <span class="text-blue-900 font-bold text-2xl">P</span>
                                        </div>
                                    `;
                                }}
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wider">
                                Podar International School
                            </h1>
                            <p className="text-sm md:text-base text-blue-300 font-medium">
                                Latur · Khadgoan Ring Road
                            </p>
                            <p className="text-xs text-blue-400 italic mt-0.5">
                                "Excellence in Education · Empowering Young Minds"
                            </p>
                        </div>
                    </div>

                    {/* Event Details - Removed Countdown Timer */}
                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-4 py-1.5 rounded-full font-bold text-sm md:text-base shadow-lg flex items-center gap-2">
                            <span>⚡</span>
                            <span>Spark 4.0</span>
                        </div>
                        <div className="text-sm md:text-base text-blue-200 font-medium bg-blue-800/50 px-3 py-1 rounded-full">
                            Science Fair 2026-27
                        </div>
                    </div>
                </div>

                {/* Contact & Social Bar */}
                <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 mt-3 pt-3 border-t border-blue-700/50 text-xs text-blue-300">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                            📞 <a href="tel:+916366437866" className="hover:text-white transition">+91-63664-37866</a>
                        </span>
                        <span className="flex items-center gap-1">
                            📧 <a href="mailto:sciencefair@podar.edu" className="hover:text-white transition">sciencefair@podar.edu</a>
                        </span>
                        <span className="flex items-center gap-1">
                            📍 Khadgoan Ring Road, Latur
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-blue-400">Follow us:</span>
                        <a href="#" className="hover:text-white transition text-blue-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                        </a>
                        <a href="#" className="hover:text-white transition text-blue-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                            </svg>
                        </a>
                        <a href="#" className="hover:text-white transition text-blue-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                            </svg>
                        </a>
                        <a href="#" className="hover:text-white transition text-blue-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolHeader;