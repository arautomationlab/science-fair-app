import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Verify, 2: Reset
    const [formData, setFormData] = useState({
        registration_code: '',
        parent_email: '',
        new_password: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        
        if (!formData.registration_code || !formData.parent_email) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);

        try {
            // ✅ Check if the registration exists and email matches
            const response = await axios.post(`${API_URL}/api/auth/verify-student`, {
                registration_code: formData.registration_code,
                parent_email: formData.parent_email
            });

            if (response.data.success) {
                toast.success('✅ Verification successful! Please set your new password.');
                setStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();

        if (formData.new_password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
                registration_code: formData.registration_code,
                parent_email: formData.parent_email,
                new_password: formData.new_password
            });

            if (response.data.success) {
                toast.success('✅ Password reset successfully! Please login with your new password.');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">
                🔑 Reset Password
            </h2>

            {step === 1 ? (
                // Step 1: Verify Student
                <form onSubmit={handleVerify} className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        Enter your Registration Code and Parent Email to verify your identity.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Registration Code *</label>
                        <input
                            type="text"
                            name="registration_code"
                            value={formData.registration_code}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="e.g., SPARK4.0-3-XXXXX"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Parent Email *</label>
                        <input
                            type="email"
                            name="parent_email"
                            value={formData.parent_email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="parent@email.com"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">The email used during registration</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Verifying...' : 'Verify Identity'}
                    </button>
                </form>
            ) : (
                // Step 2: Reset Password
                <form onSubmit={handleReset} className="space-y-4">
                    <p className="text-sm text-green-600 text-center">
                        ✅ Verified! Set your new password below.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password *</label>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}

            <div className="mt-4 text-center">
                <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;