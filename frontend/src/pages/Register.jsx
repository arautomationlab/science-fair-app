import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);
    
    // OTP States
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [timer, setTimer] = useState(0);
    const [emailToVerify, setEmailToVerify] = useState('');

    const [formData, setFormData] = useState({
        grade: '',
        division: '',
        teacher_guide: '',
        team_name: '',
        project_title: '',
        abstract: '',
        participants: 1,
        students: [
            { firstName: '', middleName: '', lastName: '', parent_name: '', parent_phone: '', parent_email: '' }
        ]
    });

    // Send OTP
    const handleSendOTP = async (email) => {
        if (!email) {
            toast.error('Please enter parent email');
            return;
        }

        setOtpLoading(true);
        setOtpError('');
        
        try {
            const response = await axios.post(`${API_URL}/api/otp/send`, { email });
            
            if (response.data.success) {
                toast.success('OTP sent to email!');
                setOtpSent(true);
                setEmailToVerify(email);
                startTimer(60); // 60 seconds timer
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            setOtpError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setOtpLoading(true);
        setOtpError('');
        
        try {
            const response = await axios.post(`${API_URL}/api/otp/verify`, {
                email: emailToVerify,
                otp: otp
            });
            
            if (response.data.success) {
                toast.success('Email verified successfully!');
                setOtpVerified(true);
                setOtpSent(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setOtpError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setOtpLoading(true);
        setOtpError('');
        
        try {
            const response = await axios.post(`${API_URL}/api/otp/resend`, {
                email: emailToVerify
            });
            
            if (response.data.success) {
                toast.success('New OTP sent!');
                startTimer(60);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // Timer function
    const startTimer = (seconds) => {
        setTimer(seconds);
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // ... rest of the existing functions (handleChange, handleStudentChange, validateForm, handleSubmit)

    // Updated handleSubmit with OTP verification
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            toast.error('Please verify your email first with OTP');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                email_verified: true,
                verified_email: emailToVerify
            };

            const response = await axios.post(
                `${API_URL}/api/auth/register`,
                payload
            );

            if (response.data.success) {
                setRegistrationData(response.data.data);
                toast.success('✅ Registration successful!');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // OTP Section in the form
    const OTPVerificationSection = () => (
        <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
                📧 Email Verification
            </h3>
            
            {!otpSent && !otpVerified ? (
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Parent Email *
                        </label>
                        <input
                            type="email"
                            value={formData.students[0]?.parent_email || ''}
                            onChange={(e) => {
                                const updatedStudents = [...formData.students];
                                updatedStudents[0].parent_email = e.target.value;
                                setFormData({ ...formData, students: updatedStudents });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="parent@email.com"
                            required
                            disabled={otpSent}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleSendOTP(formData.students[0]?.parent_email)}
                        disabled={otpLoading || !formData.students[0]?.parent_email}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                    >
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
            ) : otpSent && !otpVerified ? (
                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        OTP sent to <strong>{emailToVerify}</strong>
                    </p>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter 6-digit OTP"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otpLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {otpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                        {timer > 0 ? (
                            <span className="text-sm text-gray-500">
                                Resend in {timer}s
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                    {otpError && (
                        <p className="text-sm text-red-600 mt-1">{otpError}</p>
                    )}
                </div>
            ) : otpVerified && (
                <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                        ✅ <strong>Email verified!</strong> You can now complete registration.
                    </p>
                </div>
            )}
        </div>
    );

    // Add OTP section before the submit button
    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">
                🏫 Science Fair Registration
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Existing form fields... */}

                {/* OTP Verification Section */}
                <OTPVerificationSection />

                <button
                    type="submit"
                    disabled={loading || !otpVerified}
                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        loading || !otpVerified ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                        </span>
                    ) : (
                        'Register'
                    )}
                </button>
            </form>
        </div>
    );
};

export default Register;