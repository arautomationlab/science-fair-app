import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);

    useEffect(() => {
        const storedGroup = localStorage.getItem('group');
        if (storedGroup) {
            setGroup(JSON.parse(storedGroup));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('group');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (!group) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">📊 Dashboard</h2>
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
                            {group.registration_code}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Grade</p>
                        <p className="text-xl font-bold text-green-600">
                            {group.grade} - {group.division}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600">Project Title</p>
                        <p className="text-xl font-bold text-purple-600">
                            {group.project_title}
                        </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600">Parent</p>
                        <p className="text-lg font-bold text-yellow-700">
                            {group.parent_name}
                        </p>
                        <p className="text-sm text-gray-600">{group.parent_phone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600">Project Status</p>
                        <p className={`text-lg font-bold ${group.project_submitted ? 'text-green-600' : 'text-red-600'}`}>
                            {group.project_submitted ? '✅ Submitted' : '❌ Not Submitted'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => navigate('/submit-project')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Submit Project
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(group.registration_code);
                            toast.success('Group code copied!');
                        }}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    >
                        Copy Group Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;