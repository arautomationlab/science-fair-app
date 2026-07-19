import React, { useEffect } from 'react';
import { rulesData } from '../data/rulesData';

const RulesModal = ({ isOpen, onClose }) => {
    // ✅ Move useEffect BEFORE the early return
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // ❌ Early return AFTER all hooks
    if (!isOpen) return null;

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold">{rulesData.title}</h2>
                        <p className="text-blue-200 text-sm">Last Updated: {rulesData.lastUpdated}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="space-y-6">
                        {rulesData.sections.map((section, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                                <h3 className="text-lg font-bold text-blue-800 mb-2">
                                    {section.title}
                                </h3>
                                <ul className="space-y-1.5">
                                    {section.rules.map((rule, ruleIdx) => (
                                        <li key={ruleIdx} className="flex items-start gap-2 text-gray-700 text-sm">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Print Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => window.print()}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesModal;