import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const PublicProject = () => {
    const { code } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingStatus, setRatingStatus] = useState({ 
        isOpen: false, 
        message: '', 
        fairDate: '', 
        startTime: '', 
        endTime: '' 
    });
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (code) {
            fetchProject();
            checkRatingStatus();
        } else {
            setError('No project code provided');
            setLoading(false);
        }
    }, [code]);

    const fetchProject = async () => {
        try {
            console.log('📤 Fetching project with code:', code);
            const response = await axios.get(`${API_URL}/api/projects/public/${code}`);
            console.log('📥 Response:', response.data);
            
            if (response.data.success && response.data.data) {
                setProject(response.data.data);
            } else {
                setError('Project not found');
            }
        } catch (err) {
            console.error('❌ Fetch Error:', err);
            setError(err.response?.data?.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Check if ratings are open
    const checkRatingStatus = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ratings/status`);
            if (response.data.success) {
                setRatingStatus(response.data.data);
            }
        } catch (error) {
            console.error('Rating Status Error:', error);
        }
    };

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

    // ✅ Safe data extraction with fallbacks
    const getSafeData = (field, defaultValue = 'N/A') => {
        if (!project) return defaultValue;
        return project[field] || defaultValue;
    };

    const getSafeStudents = () => {
        if (!project) return [];
        try {
            if (typeof project.students_data === 'string') {
                return JSON.parse(project.students_data || '[]');
            }
            if (Array.isArray(project.students_data)) {
                return project.students_data;
            }
            if (project.students_data && typeof project.students_data === 'object') {
                return Object.values(project.students_data);
            }
            return [];
        } catch (e) {
            console.error('Error parsing students_data:', e);
            return [];
        }
    };

    const getSafeImages = () => {
        if (!project) return [];
        try {
            if (typeof project.images === 'string') {
                return JSON.parse(project.images || '[]');
            }
            if (Array.isArray(project.images)) {
                return project.images;
            }
            return [];
        } catch (e) {
            console.error('Error parsing images:', e);
            return [];
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

    if (error || !project) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600">Project Not Found</h2>
                <p className="text-gray-600 mt-2">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
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

    const students = getSafeStudents();
    const images = getSafeImages();
    const youtubeThumbnail = getYouTubeThumbnail(project.video_link);
    const hasProjectDetails = project.aim || project.materials || project.procedure || project.conclusion;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{getSafeData('team_name')}</h1>
                        <p className="text-xl text-blue-200 mt-1">{getSafeData('project_title')}</p>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                                Grade {getSafeData('grade')} - {getSafeData('division')}
                            </span>
                            <span className="bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                                ⚡ Spark 4.0
                            </span>
                            <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                                👨‍🏫 {getSafeData('teacher_guide', 'No Guide Assigned')}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                        <p className="text-2xl font-bold">{Number(project.average_rating || 0).toFixed(1)} ⭐</p>
                        <p className="text-sm text-blue-200">{project.total_ratings || 0} ratings</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white shadow-lg rounded-b-lg p-6">
                {!hasProjectDetails ? (
                    <div className="text-center py-8">
                        <span className="text-6xl">📝</span>
                        <h3 className="text-xl font-bold text-gray-700 mt-4">Project Details Not Submitted Yet</h3>
                        <p className="text-gray-500 mt-2">The student has registered but hasn't submitted the project details yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Team Name: {getSafeData('team_name')}</p>
                        <p className="text-sm text-gray-400">Grade: {getSafeData('grade')} - {getSafeData('division')}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="md:col-span-2 space-y-4">
                            {project.abstract && (
                                <div>
                                    <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">📄 Abstract</h3>
                                    <p className="text-gray-600 mt-1">{project.abstract}</p>
                                </div>
                            )}
                            {project.aim && (
                                <div>
                                    <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">🎯 Aim</h3>
                                    <p className="text-gray-600 mt-1">{project.aim}</p>
                                </div>
                            )}
                            {project.materials && (
                                <div>
                                    <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">🧪 Materials</h3>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {project.materials.split(',').map((item, idx) => (
                                            <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{item.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {project.procedure && (
                                <div>
                                    <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">📋 Procedure</h3>
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
                            {project.conclusion && (
                                <div>
                                    <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">✅ Conclusion</h3>
                                    <p className="text-gray-600 mt-1">{project.conclusion}</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-gray-700 mb-2">🖼️ Images</h3>
                                {images && images.length > 0 ? (
                                    <div className="space-y-2">
                                        {images.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block">
                                                <img 
                                                    src={img} 
                                                    alt={`Project ${idx + 1}`} 
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition"
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

                            {project.video_link && youtubeThumbnail && (
                                <div>
                                    <h3 className="font-bold text-gray-700 mb-2">🎥 Project Video</h3>
                                    <a href={project.video_link} target="_blank" rel="noopener noreferrer" className="block relative group">
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
                )}

                {/* Team Members */}
                <div className={`${hasProjectDetails ? 'mt-6 border-t pt-4' : 'mt-4'}`}>
                    <h3 className="font-semibold text-gray-700 mb-2">👨‍👩‍👧‍👦 Team Members</h3>
                    <div className="space-y-1">
                        {students.length > 0 ? (
                            students.map((student, idx) => {
                                const fullName = [
                                    student.firstName || '',
                                    student.middleName || '',
                                    student.lastName || ''
                                ].filter(Boolean).join(' ');
                                
                                const displayName = fullName || student.name || 'Unknown';
                                
                                return (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-blue-600">👤</span>
                                        <span>{displayName}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            Parent: {student.parent_name || 'N/A'}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">No team members listed</p>
                        )}
                    </div>
                </div>

                {/* Judge Scores */}
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

                {/* ✅ Parent Rating - With Time Restriction */}
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">⭐ Rate This Project</h3>
                    
                    {!ratingStatus.isOpen ? (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🔒</span>
                                <div>
                                    <p className="font-semibold text-yellow-800">Parent Ratings are Not Open Yet</p>
                                    <p className="text-sm text-yellow-700">
                                        {ratingStatus.message || 'Ratings will be available during the Science Fair.'}
                                    </p>
                                    {ratingStatus.fairDate && (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            📅 {ratingStatus.fairDate} | 🕐 {ratingStatus.startTime} AM - {ratingStatus.endTime} PM
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
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
                                <p className="text-3xl font-bold text-yellow-500">{Number(project.average_rating || 0).toFixed(1)} ⭐</p>
                                <p className="text-sm text-gray-500">{project.total_ratings || 0} ratings</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ Judge Panel Link */}
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">👨‍⚖️ Judge Panel</h3>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⚖️</span>
                            <div>
                                <p className="font-semibold text-blue-800">Judges: Click below to enter the judge panel</p>
                                <p className="text-sm text-blue-600 mt-1">You will need the judge access code to proceed.</p>
                                <button
                                    onClick={() => window.open(`/judge/${code}`, '_blank')}
                                    className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                                >
                                    👨‍⚖️ Enter Judge Panel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProject;