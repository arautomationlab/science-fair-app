import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

// Teacher List
const TEACHERS = [
    { id: 1, name: 'Chauhan Sushma' },
    { id: 2, name: 'Dharne Rekha' },
    { id: 3, name: 'Chamedia Aarti' },
    { id: 4, name: 'Nazneen Pathan' },
    { id: 5, name: 'Pankaja Sherkhane' },
    { id: 6, name: 'Sandya S.R.' },
    { id: 7, name: 'Bidarkar Neelam' },
    { id: 8, name: 'Balaji Hude' },
    { id: 9, name: 'Patil Smita' },
    { id: 10, name: 'Udgire Swati' },
    { id: 11, name: 'Gupta Premalata' },
    { id: 12, name: 'Shaikh Naaz' },
    { id: 13, name: 'Gaikwad Satish' },
    { id: 14, name: 'Kadam Sachin' },
    { id: 15, name: 'Gore Sharad' },
    { id: 16, name: 'Raut Monali' },
    { id: 17, name: 'Kondekar Surekha' },
    { id: 18, name: 'Tapade Madhuri' },
    { id: 19, name: 'Ingle Ravindra' }
];

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

    // ===== OTP FUNCTIONS =====
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
                startTimer(60);
            }
        } catch (error) {
            console.error('Send OTP Error:', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            setOtpError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

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
            console.error('Verify OTP Error:', error);
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setOtpError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setOtpLoading(false);
        }
    };

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
            console.error('Resend OTP Error:', error);
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setOtpLoading(false);
        }
    };

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

    // ===== FORM HANDLING FUNCTIONS =====
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'participants') {
            const newCount = parseInt(value);
            const currentStudents = [...formData.students];

            if (newCount > currentStudents.length) {
                for (let i = currentStudents.length; i < newCount; i++) {
                    currentStudents.push({ 
                        firstName: '', 
                        middleName: '', 
                        lastName: '', 
                        parent_name: '', 
                        parent_phone: '', 
                        parent_email: '' 
                    });
                }
            } else {
                currentStudents.length = newCount;
            }

            setFormData({
                ...formData,
                participants: newCount,
                students: currentStudents
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleStudentChange = (index, field, value) => {
        const updatedStudents = [...formData.students];
        updatedStudents[index][field] = value;
        setFormData({ ...formData, students: updatedStudents });
    };

    // ===== VALIDATION FUNCTION =====
    const validateForm = () => {
        if (!formData.grade || !formData.division || !formData.teacher_guide || !formData.team_name || !formData.project_title) {
            toast.error('Please fill all required fields');
            return false;
        }

        for (let i = 0; i < formData.students.length; i++) {
            const student = formData.students[i];
            
            if (!student.firstName || student.firstName.trim() === '') {
                toast.error(`Please enter first name for Student ${i + 1}`);
                return false;
            }
            
            if (!student.lastName || student.lastName.trim() === '') {
                toast.error(`Please enter last name for Student ${i + 1}`);
                return false;
            }
            
            if (!student.parent_name) {
                toast.error(`Please enter parent name for ${student.firstName} ${student.lastName}`);
                return false;
            }
            
            if (!student.parent_phone) {
                toast.error(`Please enter parent phone for ${student.firstName} ${student.lastName}`);
                return false;
            }

            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(student.parent_phone)) {
                toast.error(`Invalid phone number for ${student.firstName} ${student.lastName}`);
                return false;
            }
        }

        return true;
    };

    // ===== SUBMIT FUNCTION =====
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
                grade: formData.grade,
                division: formData.division,
                teacher_guide: formData.teacher_guide,
                team_name: formData.team_name,
                project_title: formData.project_title,
                abstract: formData.abstract,
                participants: formData.participants,
                students: formData.students,
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

    // ===== DOWNLOAD QR CODE =====
    const downloadQRCode = (qrCodeDataUrl, registrationCode) => {
        const link = document.createElement('a');
        link.download = `${registrationCode}.png`;
        link.href = qrCodeDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    // ===== SUCCESS SCREEN =====
    if (registrationData) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">
                        Registration Successful!
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                        Confirmation sent to parent's email
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm"><strong>Team Name:</strong></p>
                        <p className="text-xl font-bold text-blue-600">{registrationData.team_name}</p>
                        <p className="text-sm mt-2"><strong>Group Code:</strong></p>
                        <p className="text-xl font-mono font-bold text-blue-600">{registrationData.registration_code}</p>
                        <p className="text-sm mt-2"><strong>Password:</strong></p>
                        <p className="text-xl font-mono font-bold text-red-600">{registrationData.password}</p>
                        <p className="text-sm mt-2"><strong>Teacher Guide:</strong></p>
                        <p className="text-lg font-semibold text-purple-600">{registrationData.teacher_guide}</p>
                    </div>

                    <div className="mb-4 text-left">
                        <p className="text-sm font-semibold text-gray-700">Participants:</p>
                        {registrationData.students.map((student, idx) => (
                            <div key={idx} className="bg-blue-50 p-2 rounded mt-1">
                                <p className="text-sm">
                                    <strong>{idx + 1}.</strong> {student.firstName} {student.middleName || ''} {student.lastName}
                                    <span className="text-gray-500 ml-2">(Parent: {student.parent_name})</span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {registrationData.qr_code && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Your QR Code:</p>
                            <img 
                                src={registrationData.qr_code} 
                                alt="QR Code" 
                                className="mx-auto w-48 h-48 border-4 border-gray-300 rounded-lg shadow-lg" 
                            />
                            <button
                                onClick={() => downloadQRCode(registrationData.qr_code, registrationData.registration_code)}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center justify-center gap-2 mx-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download QR Code
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                        >
                            🖨️ Print Credentials
                        </button>
                    </div>

                    <p className="mt-4 text-xs text-red-500">
                        ⚠️ Save these credentials immediately! You won't see them again.
                    </p>
                </div>
            </div>
        );
    }

    // ===== REGISTRATION FORM =====
    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">
                🏫 Science Fair Registration
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Grade and Division */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Grade *</label>
                        <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select</option>
                            {[3,4,5,6,7,8,9,10].map(g => (
                                <option key={g} value={g}>Grade {g}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Division *</label>
                        <select
                            name="division"
                            value={formData.division}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select</option>
                            {['A','B','C','D','E','F','G','H','I','J'].map(d => (
                                <option key={d} value={d}>Division {d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Teacher Guide */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher Guide *</label>
                    <select
                        name="teacher_guide"
                        value={formData.teacher_guide}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Teacher</option>
                        {TEACHERS.map(teacher => (
                            <option key={teacher.id} value={teacher.name}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Team Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Team/Group Name *</label>
                    <input
                        type="text"
                        name="team_name"
                        value={formData.team_name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., The Innovators"
                        required
                    />
                </div>

                {/* Project Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project Title *</label>
                    <input
                        type="text"
                        name="project_title"
                        value={formData.project_title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., Solar Powered Water Purifier"
                        required
                    />
                </div>

                {/* Abstract */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Abstract</label>
                    <textarea
                        name="abstract"
                        rows="3"
                        value={formData.abstract}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Brief description of your project..."
                    />
                </div>

                {/* Participants */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-blue-600">👨‍👩‍👧‍👦 Participants</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mr-2">Number of Students:</label>
                            <select
                                name="participants"
                                value={formData.participants}
                                onChange={handleChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {[1, 2, 3, 4].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {formData.students.map((student, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-700 mb-3">Student {index + 1}</h4>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                        <input
                                            type="text"
                                            value={student.firstName || ''}
                                            onChange={(e) => handleStudentChange(index, 'firstName', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="First name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                        <input
                                            type="text"
                                            value={student.middleName || ''}
                                            onChange={(e) => handleStudentChange(index, 'middleName', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Middle name (optional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                                        <input
                                            type="text"
                                            value={student.lastName || ''}
                                            onChange={(e) => handleStudentChange(index, 'lastName', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Last name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Parent Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name *</label>
                                        <input
                                            type="text"
                                            value={student.parent_name}
                                            onChange={(e) => handleStudentChange(index, 'parent_name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Parent's full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">WhatsApp Number *</label>
                                        <div className="mt-1 flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">+91</span>
                                            <input
                                                type="tel"
                                                value={student.parent_phone}
                                                onChange={(e) => handleStudentChange(index, 'parent_phone', e.target.value)}
                                                className="flex-1 block w-full rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
                                    </div>
                                </div>

                                {/* Parent Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parent Email *</label>
                                    <input
                                        type="email"
                                        value={student.parent_email}
                                        onChange={(e) => handleStudentChange(index, 'parent_email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="parent@email.com"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">OTP will be sent to this email for verification</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* OTP Verification Section */}
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

                {/* Submit Button */}
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
                        `Register (${formData.students.length} student${formData.students.length > 1 ? 's' : ''})`
                    )}
                </button>
            </form>
        </div>
    );
};

export default Register;