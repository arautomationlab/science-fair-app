import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Winners = () => {
    const { grade } = useParams();
    const navigate = useNavigate();
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWinners();
    }, [grade]);

    const fetchWinners = async () => {
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';
            if (response.data.success) {
                setWinners(response.data.winners);
            }
        } catch (error) {
            toast.error('Failed to fetch winners');
        } finally {
            setLoading(false);
        }
    };

    const getMedal = (position) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[position] || '🏅';
    };

    const getMedalColor = (position) => {
        const colors = ['text-yellow-600', 'text-gray-500', 'text-amber-700'];
        return colors[position] || 'text-blue-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading winners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        🏆 Science Fair Winners
                    </h2>
                    <p className="text-xl text-gray-600 mt-2">Grade {grade}</p>
                </div>

                {winners.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No winners declared yet for Grade {grade}</p>
                        <p className="text-sm text-gray-400 mt-2">Make sure at least 2 judges have scored the projects</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {winners.map((winner, index) => (
                            <div 
                                key={index}
                                className={`border-2 rounded-lg p-6 ${
                                    index === 0 ? 'border-yellow-400 bg-yellow-50' :
                                    index === 1 ? 'border-gray-300 bg-gray-50' :
                                    'border-amber-300 bg-amber-50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-4xl ${getMedalColor(index)}`}>
                                            {getMedal(index)}
                                        </span>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {winner.team_name}
                                            </h3>
                                            <p className="text-gray-600">{winner.project_title}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {JSON.parse(winner.students_data || '[]').map((student, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                        {student.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Average Score</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {Math.round(winner.average_score)}%
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {winner.total_judges} judges
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        ← Back to Admin
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        🖨️ Print Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Winners;