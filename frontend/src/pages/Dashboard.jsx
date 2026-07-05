import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [projectDetails, setProjectDetails] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Get user data from localStorage
                const storedUser = localStorage.getItem('user');
                const storedGroup = localStorage.getItem('group');
                
                console.log('🔍 Stored user:', storedUser);
                console.log('🔍 Stored group:', storedGroup);
                
                let userData = null;
                
                if (storedUser) {
                    userData = JSON.parse(storedUser);
                } else if (storedGroup) {
                    userData = JSON.parse(storedGroup);
                }
                
                if (userData) {
                    setGroup(userData);
                    // If we have registration_code, fetch project details
                    if (userData.registration_code) {
                        await fetchProjectDetails(userData.registration_code);
                    }
                } else {
                    // No user data, redirect to login
                    toast.error('Please login again');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [navigate]);

    const fetchProjectDetails = async (registrationCode) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/projects/${registrationCode}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setProjectDetails(response.data.data);
            }
        } catch (error) {
            console.error('Fetch project details error:', error);
            // Don't show error toast here - it's okay if project not submitted yet
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('group');
        localStorage.removeItem('role');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">No user data found. Please login again.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">📊 Student Dashboard</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Group Code</p>
                        <p className="text-xl font-mono font-bold text-blue-600">
                            {group.registration_code || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Grade</p>
                        <p className="text-xl font-bold text-green-600">
                            {group.grade || 'N/A'} - {group.division || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600">Project Title</p>
                        <p className="text-xl font-bold text-purple-600">
                            {group.project_title || 'Not set yet'}
                        </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600">Team/Group Name</p>
                        <p className="text-lg font-bold text-yellow-700">
                            {group.team_name || 'Not set yet'}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600">Project Status</p>
                        <p className={`text-lg font-bold ${group.project_submitted ? 'text-green-600' : 'text-red-600'}`}>
                            {group.project_submitted ? '✅ Submitted' : '❌ Not Submitted Yet'}
                        </p>
                        {projectDetails && projectDetails.submitted_at && (
                            <p className="text-xs text-gray-500 mt-1">
                                Submitted on: {new Date(projectDetails.submitted_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex gap-4 flex-wrap">
                    <button
                        onClick={() => navigate('/submit-project')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        {group.project_submitted ? '📝 Edit Project' : '📝 Submit Project'}
                    </button>
                    <button
                        onClick={() => {
                            const code = group.registration_code || '';
                            navigator.clipboard.writeText(code);
                            toast.success('Group code copied!');
                        }}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    >
                        Copy Group Code
                    </button>
                    {group.registration_code && (
                        <button
                            onClick={() => window.open(`/project/${group.registration_code}`, '_blank')}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            🔍 View Public Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;