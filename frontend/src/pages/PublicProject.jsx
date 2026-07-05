import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ ADD THIS - API URL at the top
const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const PublicProject = () => {
    const { code } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [code]);

    // ✅ FIXED - Added const response = await axios.get()
    const fetchProject = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/projects/public/${code}`);
            if (response.data.success) {
                setProject(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Project Error:', error);
            toast.error('Project not found');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED - Added const response = await axios.post()
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
                fetchProject(); // Refresh to show updated ratings
            }
        } catch (error) {
            console.error('Rating Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setSubmittingRating(false);
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
            </div>
        );
    }

    // Parse students data
    const students = JSON.parse(project.students_data || '[]');
    const images = project.images || [];

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
                {/* Image and Details Layout */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Images */}
                    <div>
                        {images.length > 0 ? (
                            <div className="space-y-3">
                                <img 
                                    src={images[0]} 
                                    alt="Project Main" 
                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                />
                                {images.length > 1 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.slice(1, 4).map((img, idx) => (
                                            <img 
                                                key={idx} 
                                                src={img} 
                                                alt={`Project ${idx + 2}`} 
                                                className="h-20 w-full object-cover rounded-lg border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <span className="text-6xl">🖼️</span>
                                    <p className="mt-2">No images uploaded</p>
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
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

                    {/* Right Column - Project Details */}
                    <div className="space-y-4">
                        {/* Aim */}
                        {project.aim && (
                            <div>
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    🎯 Aim / Objective
                                </h3>
                                <p className="text-gray-600 mt-1">{project.aim}</p>
                            </div>
                        )}

                        {/* Materials */}
                        {project.materials && (
                            <div>
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
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
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
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
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    ✅ Conclusion / Results
                                </h3>
                                <p className="text-gray-600 mt-1">{project.conclusion}</p>
                            </div>
                        )}

                        {/* Abstract */}
                        {project.abstract && (
                            <div>
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    📄 Abstract
                                </h3>
                                <p className="text-gray-600 mt-1">{project.abstract}</p>
                            </div>
                        )}

                        {/* Video Link */}
                        {project.video_link && (
                            <div>
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    🎥 Project Video
                                </h3>
                                <a 
                                    href={project.video_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Watch Demo Video →
                                </a>
                            </div>
                        )}

                        {/* Judge Scores */}
                        {project.judge_scores && project.judge_scores.length > 0 && (
                            <div className="border-t pt-4">
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
                    </div>
                </div>

                {/* Parent Rating Section */}
                <div className="mt-8 border-t pt-6">
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
            </div>
        </div>
    );
};

export default PublicProject;