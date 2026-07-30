// frontend/src/pages/JudgePanel.jsx

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const JudgePanel = () => {
    const [accessCode, setAccessCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [judgeInfo, setJudgeInfo] = useState(null);
    const [projectCode, setProjectCode] = useState('');
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
            toast.error('Please enter the judge access code');
            return;
        }

        if (accessCode.length !== 4 || !/^\d{4}$/.test(accessCode)) {
            toast.error('Please enter a valid 4-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/judge/verify-access`, {
                access_code: accessCode
            });

            if (response.data.success) {
                localStorage.setItem('judge_token', response.data.token);
                setJudgeInfo({
                    judge_name: response.data.judge_name,
                    access_code: response.data.access_code
                });
                setIsAuthenticated(true);
                toast.success(`Welcome, ${response.data.judge_name}!`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid access code');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Submit judge score
    const submitScore = async () => {
        if (!projectCode) {
            toast.error('Please enter the project code');
            return;
        }

        // Calculate total
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
                    registration_code: projectCode,
                    score: Math.round(totalScore / 4),
                    criteria_scores: scores
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('✅ Score recorded successfully!');
                setProjectCode('');
                setScores({
                    innovation: 0,
                    presentation: 0,
                    research: 0,
                    impact: 0
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record score');
        } finally {
            setLoading(false);
        }
    };

    // Handle score change
    const handleScoreChange = (criteria, value) => {
        const numValue = parseInt(value) || 0;
        setScores({ ...scores, [criteria]: Math.min(numValue, 25) });
    };

    // If not authenticated, show access code form
    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">👨‍⚖️ Judge Access</h2>
                <p className="text-gray-600 text-center mb-4">
                    Enter your 4-digit access code to continue
                </p>
                <input
                    type="password"
                    placeholder="Enter 4-digit code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-3 border rounded-lg mb-4 text-center text-2xl font-bold tracking-widest"
                    maxLength="4"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && verifyAccess()}
                />
                <button
                    onClick={verifyAccess}
                    disabled={loading || accessCode.length !== 4}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : '🔑 Access Judge Panel'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-4">
                    Contact admin if you don't have an access code
                </p>
            </div>
        );
    }

    // Judge scoring panel
    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">👨‍⚖️ Judge Panel</h2>
                <div className="text-sm text-gray-500">
                    Welcome, <span className="font-semibold">{judgeInfo?.judge_name}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project Code</label>
                    <input
                        type="text"
                        placeholder="e.g., SPARK4.0-5-XXXXX"
                        value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Innovation (0-25)</label>
                        <input
                            type="number"
                            min="0"
                            max="25"
                            value={scores.innovation}
                            onChange={(e) => handleScoreChange('innovation', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Presentation (0-25)</label>
                        <input
                            type="number"
                            min="0"
                            max="25"
                            value={scores.presentation}
                            onChange={(e) => handleScoreChange('presentation', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Research (0-25)</label>
                        <input
                            type="number"
                            min="0"
                            max="25"
                            value={scores.research}
                            onChange={(e) => handleScoreChange('research', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Impact (0-25)</label>
                        <input
                            type="number"
                            min="0"
                            max="25"
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
                        </span> / 100
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Average: {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4)}%
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