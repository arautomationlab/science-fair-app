import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedGroup = localStorage.getItem('group');
                
                let userData = null;
                if (storedUser) {
                    userData = JSON.parse(storedUser);
                } else if (storedGroup) {
                    userData = JSON.parse(storedGroup);
                }
                
                if (userData) {
                    setGroup(userData);
                    if (userData.registration_code) {
                        await fetchProjectDetails(userData.registration_code);
                    }
                } else {
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
        }
    };

    const downloadQRCode = (qrCodeDataUrl, registrationCode) => {
        if (!qrCodeDataUrl) {
            toast.error('QR Code not available');
            return;
        }
        const link = document.createElement('a');
        link.download = `${registrationCode}.png`;
        link.href = qrCodeDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
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

    const students = JSON.parse(group.students_data || '[]');
    const qrCodeDataUrl = projectDetails?.qr_code || group?.qr_code || null;

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
                    </div>
                </div>

                {/* ✅ QR CODE SECTION */}
                {qrCodeDataUrl ? (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-blue-300">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">📱 Your QR Code</h3>
                        <div className="flex flex-col items-center">
                            <img 
                                src={qrCodeDataUrl} 
                                alt="QR Code" 
                                className="w-48 h-48 border-2 border-gray-300 rounded-lg shadow-lg"
                            />
                            <button
                                onClick={() => downloadQRCode(qrCodeDataUrl, group.registration_code)}
                                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download QR Code
                            </button>
                            <p className="text-xs text-gray-400 mt-2">Scan this QR code on the fair day</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-300 text-center">
                        <p className="text-yellow-700">📌 QR Code will be available after project submission</p>
                    </div>
                )}

                {/* ✅ STUDENT CREDENTIALS */}
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">🔑 Your Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded border border-red-200">
                            <p className="text-xs text-gray-500">Registration Code</p>
                            <p className="text-lg font-mono font-bold text-blue-600">{group.registration_code}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-red-200">
                            <p className="text-xs text-gray-500">Password</p>
                            <p className="text-lg font-mono font-bold text-red-600">{group.password || '********'}</p>
                        </div>
                    </div>
                    <p className="text-xs text-red-500 mt-2">⚠️ Save these credentials securely!</p>
                </div>

                {/* Students List */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">👨‍👩‍👧‍👦 Team Members</h3>
                    {students.length > 0 ? (
                        students.map((student, idx) => (
                            <div key={idx} className="flex items-center gap-2 py-1 border-b border-blue-100 last:border-0">
                                <span className="text-blue-600">👤</span>
                                <span>{student.firstName || ''} {student.middleName || ''} {student.lastName || ''}</span>
                                <span className="text-xs text-gray-500 ml-2">Parent: {student.parent_name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No team members listed</p>
                    )}
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
                            navigator.clipboard.writeText(group.registration_code || '');
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