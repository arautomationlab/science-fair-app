import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('student');
    const [formData, setFormData] = useState({
        registration_code: '',
        password: '',
        username: '',
        adminPassword: ''
    });

    // ✅ ADD THIS - Get API URL from environment variable
    const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = '';
            let payload = {};

            // Student Login - Already correct in your Login.jsx
        if (userType === 'student') {
            endpoint = '/api/auth/login/student';
            payload = {
                registration_code: formData.registration_code,
                password: formData.password
            };
        } else if (userType === 'teacher') {
                endpoint = '/api/auth/login/teacher';
                payload = {
                    username: formData.username,
                    password: formData.password
                };
            } else if (userType === 'admin') {
                endpoint = '/api/auth/login/admin';
                payload = {
                    username: formData.username,
                    password: formData.adminPassword
                };
            }

            // ✅ FIXED - Use API_URL instead of localhost
            const response = await axios.post(
                `${API_URL}${endpoint}`,
                payload
            );

            if (response.data.success) {
                    const { token, user } = response.data.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('role', user.role);
                    // ✅ Also store group data for dashboard
                    localStorage.setItem('group', JSON.stringify(user));

                toast.success(`Welcome ${user.full_name || user.registration_code || 'User'}!`);

                // Redirect based on role
                if (user.role === 'admin') {
                    navigate('/admin');
                } else if (user.role === 'teacher') {
                    navigate('/teacher-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error('Login Error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">
                🔐 Login
            </h2>

            {/* Role Selection */}
            <div className="flex gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setUserType('student')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                        userType === 'student'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                    👨‍🎓 Student
                </button>
                <button
                    type="button"
                    onClick={() => setUserType('teacher')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                        userType === 'teacher'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                    👨‍🏫 Teacher
                </button>
                <button
                    type="button"
                    onClick={() => setUserType('admin')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                        userType === 'admin'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                    🔧 Admin
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student Login Fields */}
                {userType === 'student' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Registration Code</label>
                            <input
                                type="text"
                                name="registration_code"
                                value={formData.registration_code}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="SCI-5-ABC123"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </>
                )}

                {/* Teacher & Admin Login Fields */}
                {(userType === 'teacher' || userType === 'admin') && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {userType === 'teacher' ? 'Teacher Username' : 'Admin Username'}
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder={userType === 'teacher' ? 'e.g., chauhan.sushma' : 'admin'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name={userType === 'admin' ? 'adminPassword' : 'password'}
                                value={userType === 'admin' ? formData.adminPassword : formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        {userType === 'teacher' && (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-xs text-green-700">
                                    💡 Your username is your name without spaces (e.g., chauhan.sushma)
                                </p>
                            </div>
                        )}
                        {userType === 'admin' && (
                            <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-xs text-purple-700">
                                    🔐 Default admin: username = admin, password = admin123
                                </p>
                            </div>
                        )}
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-semibold ${
                        userType === 'student'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : userType === 'teacher'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Logging in...' : `Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                </button>

                {userType === 'student' && (
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Register here
                        </a>
                    </p>
                )}
            </form>
        </div>
    );
};

export default Login;