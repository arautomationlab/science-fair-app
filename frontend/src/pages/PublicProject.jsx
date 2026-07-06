import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const PublicProject = () => {
    const { code } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [judgeCode, setJudgeCode] = useState('');
    const [showJudgePanel, setShowJudgePanel] = useState(false);
    const [judgeScore, setJudgeScore] = useState({
        judge_name: '',
        score: '',
        comments: ''
    });
    const [submittingJudge, setSubmittingJudge] = useState(false);

    useEffect(() => {
        if (code) {
            console.log('🔍 Fetching project with code:', code);
            fetchProject();
        } else {
            console.error('❌ No code provided in URL');
            setLoading(false);
        }
    }, [code]);

    const fetchProject = async () => {
        try {
            console.log('📤 API URL:', API_URL);
            const response = await axios.get(`${API_URL}/api/projects/public/${code}`);
            console.log('📥 Response:', response.data);
            
            if (response.data.success) {
                setProject(response.data.data);
            } else {
                toast.error('Project not found');
            }
        } catch (error) {
            console.error('❌ Fetch Project Error:', error);
            console.error('Error Response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Project not found');
        } finally {
            setLoading(false);
        }
    };

    // Get YouTube thumbnail from video link
    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([\w-]+)/,
            /(?:youtu\.be\/)([\w-]+)/,
            /(?:youtube\.com\/embed\/)([\w-]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
            }
        }
        return null;
    };

    const handleRating = async (stars) => {
        if (!stars) {
            toast.error('Please select a rating');
            return;
        }

        setSubmittingRating(true);
        try {
            const response = await axios.post(`${API_URL}/api/ratings/rate`, {
                registration_code: code,
                stars: stars,
                comment: comment
            });

            if (response.data.success) {
                toast.success('Thank you for your rating! 🌟');
                setRating(0);
                setComment('');
                fetchProject();
            }
        } catch (error) {
            console.error('Rating Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleJudgeSubmit = async (e) => {
        e.preventDefault();
        if (!judgeScore.judge_name || !judgeScore.score) {
            toast.error('Please fill all judge fields');
            return;
        }

        setSubmittingJudge(true);
        try {
            const response = await axios.post(`${API_URL}/api/judge/score`, {
                registration_code: code,
                judge_name: judgeScore.judge_name,
                score: parseInt(judgeScore.score),
                comments: judgeScore.comments
            });

            if (response.data.success) {
                toast.success('Judge score submitted! ✅');
                setJudgeScore({ judge_name: '', score: '', comments: '' });
                setShowJudgePanel(false);
                setJudgeCode('');
                fetchProject();
            }
        } catch (error) {
            console.error('Judge Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit score');
        } finally {
            setSubmittingJudge(false);
        }
    };

    const handleJudgeCodeSubmit = (e) => {
        e.preventDefault();
        if (judgeCode === 'JUDGE2026') {
            setShowJudgePanel(true);
            toast.success('Access granted!');
        } else {
            toast.error('Invalid judge code');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600">Project Not Found</h2>
                <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
                <p className="text-sm text-gray-400 mt-4">Code: {code}</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const students = JSON.parse(project.students_data || '[]');
    const images = project.images || [];
    const youtubeThumbnail = getYouTubeThumbnail(project.video_link);

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{project.team_name}</h1>
                        <p className="text-xl text-blue-200 mt-1">{project.project_title}</p>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                                Grade {project.grade} - {project.division}
                            </span>
                            <span className="bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                                ⚡ Spark 4.0
                            </span>
                            <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                                👨‍🏫 {project.teacher_guide || 'No Guide Assigned'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                        <p className="text-2xl font-bold">{project.average_rating || 0} ⭐</p>
                        <p className="text-sm text-blue-200">{project.total_ratings || 0} ratings</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white shadow-lg rounded-b-lg p-6">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - Project Details (2/3 width) */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Abstract */}
                        {project.abstract && (
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                    📄 Abstract
                                </h3>
                                <p className="text-gray-600 mt-1">{project.abstract}</p>
                            </div>
                        )}

                        {/* Aim */}
                        {project.aim && (
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                    🎯 Aim / Objective
                                </h3>
                                <p className="text-gray-600 mt-1">{project.aim}</p>
                            </div>
                        )}

                        {/* Materials */}
                        {project.materials && (
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                    🧪 Materials Required
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {project.materials.split(',').map((item, idx) => (
                                        <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                                            {item.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Procedure */}
                        {project.procedure && (
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                    📋 Procedure
                                </h3>
                                <div className="mt-1 space-y-1">
                                    {project.procedure.split('\n').filter(step => step.trim()).map((step, idx) => (
                                        <div key={idx} className="flex gap-2 text-gray-600">
                                            <span className="font-bold text-blue-600">{idx + 1}.</span>
                                            <span>{step.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conclusion */}
                        {project.conclusion && (
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                    ✅ Conclusion / Results
                                </h3>
                                <p className="text-gray-600 mt-1">{project.conclusion}</p>
                            </div>
                        )}

                        {/* Team Members */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2">👨‍👩‍👧‍👦 Team Members</h3>
                            <div className="space-y-1">
                                {students.map((student, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-blue-600">👤</span>
                                        <span>{student.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            Parent: {student.parent_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Images & Video (1/3 width) */}
                    <div className="space-y-4">
                        {/* Images */}
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">🖼️ Images</h3>
                            {images && images.length > 0 ? (
                                <div className="space-y-2">
                                    {images.map((img, idx) => (
                                        <a 
                                            key={idx} 
                                            href={img} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <img 
                                                src={img} 
                                                alt={`Project ${idx + 1}`} 
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition cursor-pointer"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                                }}
                                            />
                                        </a>
                                    ))}
                                    <p className="text-xs text-gray-400">Click image to view full size</p>
                                </div>
                            ) : (
                                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <span className="text-4xl">🖼️</span>
                                        <p className="text-sm mt-1">No images uploaded</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Video */}
                        {project.video_link && youtubeThumbnail && (
                            <div>
                                <h3 className="font-bold text-gray-700 mb-2">🎥 Project Video</h3>
                                <a 
                                    href={project.video_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block relative group"
                                >
                                    <img 
                                        src={youtubeThumbnail} 
                                        alt="Video Thumbnail" 
                                        className="w-full rounded-lg border border-gray-200 group-hover:opacity-80 transition"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-red-600 text-white rounded-full p-3 shadow-lg group-hover:scale-110 transition">
                                            ▶️
                                        </div>
                                    </div>
                                </a>
                                <p className="text-xs text-gray-400 mt-1">Click to watch on YouTube</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Judge Scores Display */}
                {project.judge_scores && project.judge_scores.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-bold text-gray-700 mb-2">📊 Judge Scores</h3>
                        <div className="space-y-1">
                            {project.judge_scores.map((score, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="font-medium">{score.judge_name}</span>
                                    <span className="font-bold text-blue-600">{score.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Parent Rating Section */}
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">⭐ Rate This Project</h3>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="text-4xl transition"
                                    >
                                        <span className={star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="2"
                                    placeholder="Optional: Leave a comment..."
                                />
                            </div>
                            <button
                                onClick={() => handleRating(rating)}
                                disabled={submittingRating || !rating}
                                className={`mt-2 px-6 py-2 rounded-md text-white font-semibold ${
                                    submittingRating || !rating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-yellow-500 hover:bg-yellow-600'
                                }`}
                            >
                                {submittingRating ? 'Submitting...' : 'Submit Rating 🌟'}
                            </button>
                        </div>
                        <div className="md:w-48 bg-gray-50 p-4 rounded-lg text-center">
                            <p className="text-3xl font-bold text-yellow-500">{project.average_rating || 0} ⭐</p>
                            <p className="text-sm text-gray-500">{project.total_ratings || 0} ratings</p>
                        </div>
                    </div>
                </div>

                {/* Judge Panel Section */}
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">👨‍⚖️ Judge Panel</h3>
                    
                    {!showJudgePanel ? (
                        <form onSubmit={handleJudgeCodeSubmit} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700">Enter Judge Access Code</label>
                                <input
                                    type="password"
                                    value={judgeCode}
                                    onChange={(e) => setJudgeCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter the judge code"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                            >
                                Access Judge Panel
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJudgeSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Judge Name *</label>
                                    <input
                                        type="text"
                                        value={judgeScore.judge_name}
                                        onChange={(e) => setJudgeScore({ ...judgeScore, judge_name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Score (0-100) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={judgeScore.score}
                                        onChange={(e) => setJudgeScore({ ...judgeScore, score: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter score"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comments</label>
                                <textarea
                                    value={judgeScore.comments}
                                    onChange={(e) => setJudgeScore({ ...judgeScore, comments: e.target.value })}
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Additional comments..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submittingJudge}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {submittingJudge ? 'Submitting...' : 'Submit Judge Score ✅'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowJudgePanel(false);
                                        setJudgeCode('');
                                    }}
                                    className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                    <p className="text-xs text-gray-400 mt-2">🔑 Judges: Contact the administrator for the access code</p>
                </div>
            </div>
        </div>
    );
};

export default PublicProject;