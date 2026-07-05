import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

// ✅ ADD THIS - API URL at the top
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

    // Criteria for judging
    const criteria = [
        { id: 'innovation', label: 'Innovation & Creativity', max: 20 },
        { id: 'scientific_approach', label: 'Scientific Approach', max: 20 },
        { id: 'presentation', label: 'Presentation & Clarity', max: 20 },
        { id: 'practical_application', label: 'Practical Application', max: 20 },
        { id: 'teamwork', label: 'Teamwork & Collaboration', max: 20 }
    ];

    const [criteriaScores, setCriteriaScores] = useState({});

    useEffect(() => {
        fetchProject();
    }, [code]);

    // ✅ FIXED - Added const response = await axios.get()
    const fetchProject = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/projects/${code}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setProject(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Project Error:', error);
            toast.error('Project not found');
        }
    };

    const handleCriteriaChange = (id, value) => {
        const newValue = Math.min(Math.max(0, parseInt(value) || 0), 20);
        setCriteriaScores({ ...criteriaScores, [id]: newValue });
        
        // Update total score
        const total = Object.values({ ...criteriaScores, [id]: newValue })
            .reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        setScore({ ...score, score: total });
    };

    // ✅ FIXED - Added const response = await axios.post()
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
            const token = localStorage.getItem('token');
            const payload = {
                registration_code: code,
                judge_name: score.judge_name,
                score: parseInt(score.score),
                comments: score.comments,
                criteria_scores: criteriaScores
            };

            const response = await axios.post(`${API_URL}/api/judge/score`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Score submitted successfully! ✅');
                // Reset form
                setScore({ judge_name: '', score: '', comments: '' });
                setCriteriaScores({});
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
                
                {/* Project Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Project Details</h3>
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
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Abstract</p>
                            <p className="text-gray-700">{project.abstract || 'No abstract provided'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Students</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {JSON.parse(project.students_data || '[]').map((student, idx) => (
                                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {student.name}
                                    </span>
                                ))}
                            </div>
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
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Scoring Criteria (0-20 each)</h4>
                        {criteria.map((criterion) => (
                            <div key={criterion.id} className="flex items-center gap-4 mb-3">
                                <label className="w-48 text-sm text-gray-600">{criterion.label}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={criteriaScores[criterion.id] || ''}
                                    onChange={(e) => handleCriteriaChange(criterion.id, e.target.value)}
                                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-400">/ {criterion.max}</span>
                            </div>
                        ))}
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="font-semibold">
                                Total Score: <span className="text-blue-600">{score.score || 0}</span> / 100
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
                            placeholder="Additional comments about the project..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Submitting...' : 'Submit Score ✅'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JudgePanel;