// frontend/src/pages/JudgePanel.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const JudgePanel = () => {
    const { code } = useParams(); // ✅ Gets registration code from URL
    const navigate = useNavigate();
    
    const [accessCode, setAccessCode] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [scores, setScores] = useState({
        innovation: 0,
        presentation: 0,
        research: 0,
        impact: 0
    });
    const [loading, setLoading] = useState(false);

    // ✅ Verify judge access
    const verifyAccess = async () => {
        if (!accessCode) {
            toast.error('Please enter your judge access code');
            return;
        }

        if (!judgeName) {
            toast.error('Please enter your name');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/judge/verify-access`, {
                access_code: accessCode
            });

            if (response.data.success) {
                localStorage.setItem('judge_token', response.data.token);
                setIsAuthenticated(true);
                toast.success(`Welcome, ${judgeName}!`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid access code');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Submit scores
    const submitScore = async () => {
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

        if (totalScore === 0) {
            toast.error('Please enter scores for at least one criterion');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('judge_token');
            
            const response = await axios.post(
                `${API_URL}/api/judge/score`,
                {
                    registration_code: code, // ✅ From URL
                    judge_name: judgeName,
                    score: Math.round(totalScore / 4),
                    criteria_scores: scores
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('✅ Score recorded successfully!');
                setScores({
                    innovation: 0,
                    presentation: 0,
                    research: 0,
                    impact: 0
                });
                // Navigate back to project page after 2 seconds
                setTimeout(() => {
                    navigate(`/project/${code}`);
                }, 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record score');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (criteria, value) => {
        const numValue = parseInt(value) || 0;
        setScores({ ...scores, [criteria]: Math.min(numValue, 10) });
    };

    // ✅ Not authenticated - Show access form
    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">👨‍⚖️ Judge Access</h2>
                <p className="text-gray-600 text-center mb-4">
                    Enter your access code and name to judge this project
                </p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judge Access Code</label>
                        <input
                            type="password"
                            placeholder="Enter access code"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full p-3 border rounded-lg text-center text-2xl font-bold tracking-widest"
                            maxLength="4"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={judgeName}
                            onChange={(e) => setJudgeName(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>

                    <button
                        onClick={verifyAccess}
                        disabled={loading || accessCode.length !== 4 || !judgeName}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : '🔑 Enter Judge Panel'}
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Authenticated - Show scoring form
    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">👨‍⚖️ Judge Panel</h2>
                <div className="text-sm text-gray-500">
                    Judge: <span className="font-semibold">{judgeName}</span>
                </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    Project Code: <span className="font-mono font-bold">{code}</span>
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Innovation (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={scores.innovation}
                            onChange={(e) => handleScoreChange('innovation', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Presentation (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={scores.presentation}
                            onChange={(e) => handleScoreChange('presentation', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Research (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={scores.research}
                            onChange={(e) => handleScoreChange('research', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Impact (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={scores.impact}
                            onChange={(e) => handleScoreChange('impact', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Total Score: <span className="font-bold text-lg text-blue-600">
                            {Object.values(scores).reduce((a, b) => a + b, 0)}
                        </span> / 40
                    </p>
                </div>

                <button
                    onClick={submitScore}
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : '✅ Submit Score'}
                </button>
            </div>
        </div>
    );
};

export default JudgePanel;