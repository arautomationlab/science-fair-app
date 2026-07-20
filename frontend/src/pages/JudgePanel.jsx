import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const JudgePanel = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState(null);
    const [score, setScore] = useState({
        judge_name: '',
        score: '',
        comments: ''
    });
    const [judgeAccessCode, setJudgeAccessCode] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    // ✅ 4 Rubrics - 10 marks each
    const criteria = [
        { id: 'innovation', label: 'Innovation & Creativity', max: 10 },
        { id: 'scientific_approach', label: 'Scientific Approach & Methodology', max: 10 },
        { id: 'presentation', label: 'Presentation & Communication', max: 10 },
        { id: 'practical_application', label: 'Practical Application & Impact', max: 10 }
    ];

    const [criteriaScores, setCriteriaScores] = useState({});

    useEffect(() => {
        if (code) {
            fetchProject();
            // Check if already authorized
            const authorized = localStorage.getItem(`judge_authorized_${code}`);
            if (authorized === 'true') {
                setIsAuthorized(true);
            }
        }
    }, [code]);

    const fetchProject = async () => {
        try {
            // ✅ Public access - no token required
            const response = await axios.get(`${API_URL}/api/projects/public/${code}`);
            if (response.data.success) {
                setProject(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Project Error:', error);
            toast.error('Project not found');
        }
    };

    const handleCriteriaChange = (id, value) => {
        const newValue = Math.min(Math.max(0, parseInt(value) || 0), 10);
        setCriteriaScores({ ...criteriaScores, [id]: newValue });
        
        const total = Object.values({ ...criteriaScores, [id]: newValue })
            .reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        setScore({ ...score, score: total });
    };

    // ✅ Handle access code submission
    const handleAccessCodeSubmit = (e) => {
        e.preventDefault();
        // ✅ Access code - can be changed to any value
        const validCode = 'JUDGE2026';
        if (judgeAccessCode === validCode) {
            setIsAuthorized(true);
            localStorage.setItem(`judge_authorized_${code}`, 'true');
            toast.success('Access granted! You can now score this project.');
        } else {
            toast.error('Invalid access code. Please contact the administrator.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!score.judge_name) {
            toast.error('Please enter judge name');
            return;
        }

        if (Object.keys(criteriaScores).length < criteria.length) {
            toast.error('Please score all criteria');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                registration_code: code,
                judge_name: score.judge_name,
                score: parseInt(score.score),
                comments: score.comments,
                criteria_scores: criteriaScores
            };

            // ✅ Public access - no token required
            const response = await axios.post(`${API_URL}/api/judge/score`, payload);

            if (response.data.success) {
                toast.success('Score submitted successfully! ✅');
                setScore({ judge_name: '', score: '', comments: '' });
                setCriteriaScores({});
                // Clear authorization so next judge needs to enter code again
                localStorage.removeItem(`judge_authorized_${code}`);
                setIsAuthorized(false);
                setJudgeAccessCode('');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit score');
        } finally {
            setLoading(false);
        }
    };

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">👨‍⚖️ Judge Panel</h2>

                {/* ✅ Access Code Check */}
                {!isAuthorized ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">🔐</span>
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800">Judge Access Required</h3>
                                <p className="text-sm text-yellow-700">Please enter the access code to score this project.</p>
                            </div>
                        </div>
                        <form onSubmit={handleAccessCodeSubmit} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700">Access Code</label>
                                <input
                                    type="password"
                                    value={judgeAccessCode}
                                    onChange={(e) => setJudgeAccessCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter the judge access code"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Verify Access
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 mt-3">
                            🔑 Contact the Science Fair Administrator for the access code.
                            <br />
                            <span className="text-yellow-600">Note: Each judge session requires the access code.</span>
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ✅ Authorized - Show Scoring Form */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <span className="text-sm text-green-800 font-medium">Access Granted</span>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem(`judge_authorized_${code}`);
                                    setIsAuthorized(false);
                                    setJudgeAccessCode('');
                                    toast.info('Session ended. Enter code again to re-enter.');
                                }}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                End Session
                            </button>
                        </div>

                        {/* Project Details */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2">📋 Project Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Team</p>
                                    <p className="font-medium">{project.team_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Grade</p>
                                    <p className="font-medium">{project.grade} - {project.division}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Project Title</p>
                                    <p className="font-medium text-lg">{project.project_title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Scoring Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judge Name *</label>
                                <input
                                    type="text"
                                    value={score.judge_name}
                                    onChange={(e) => setScore({ ...score, judge_name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">This will be displayed with the score.</p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-700 mb-3">📊 Scoring Criteria (0-10 each)</h4>
                                {criteria.map((criterion) => (
                                    <div key={criterion.id} className="flex items-center gap-4 mb-3">
                                        <label className="w-48 text-sm text-gray-600">{criterion.label}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={criteriaScores[criterion.id] || ''}
                                            onChange={(e) => handleCriteriaChange(criterion.id, e.target.value)}
                                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-gray-400">/ {criterion.max}</span>
                                    </div>
                                ))}
                                
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="font-semibold">
                                        Total Score: <span className="text-blue-600">{score.score || 0}</span> / 40
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comments</label>
                                <textarea
                                    rows="3"
                                    value={score.comments}
                                    onChange={(e) => setScore({ ...score, comments: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Additional comments about the project (optional)..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-semibold bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Submitting...' : '✅ Submit Score'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default JudgePanel;