import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Browse Projects States
    const [browseProjects, setBrowseProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [browseLoading, setBrowseLoading] = useState(false);
    const [showBrowse, setShowBrowse] = useState(false);
    const [browseFilters, setBrowseFilters] = useState({
        grade: '',
        division: '',
        teacher: ''
    });
    const [uniqueTeachers, setUniqueTeachers] = useState([]);

    // ✅ Certificate States
    const [certificate, setCertificate] = useState(null);
    const [hasCertificate, setHasCertificate] = useState(false);
    const [loadingCertificate, setLoadingCertificate] = useState(false);
    const [studentCount, setStudentCount] = useState(0);
    const [certificateStatus, setCertificateStatus] = useState({
        available: false,
        message: '',
        fairDate: ''
    });

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
                    setGroupData(userData);
                    if (userData.registration_code) {
                        await fetchProjectDetails(userData.registration_code);
                        await checkCertificateStatus();
                        await checkCertificate(userData.registration_code);
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

    // ✅ Check certificate availability status
    const checkCertificateStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/certificates/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setCertificateStatus(response.data.data);
            }
        } catch (error) {
            console.error('Error checking certificate status:', error);
        }
    };

    // ✅ Check if certificate exists for this group
    const checkCertificate = async (registrationCode) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/certificates/check/${registrationCode}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setHasCertificate(response.data.available);
                setCertificate(response.data.url);
            }
        } catch (error) {
            console.error('Error checking certificate:', error);
        }
    };

    // ✅ Generate Certificate - Direct PDF Download
    const generateCertificate = async () => {
        setLoadingCertificate(true);
        try {
            const token = localStorage.getItem('token');
            const registrationCode = group?.registration_code;
            
            if (!registrationCode) {
                toast.error('Registration code not found');
                return;
            }
            
            const response = await axios.get(
                `${API_URL}/api/certificates/generate/${registrationCode}`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificate_${registrationCode}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setHasCertificate(true);
            const studentCount = group?.students_data ? JSON.parse(JSON.stringify(group.students_data)).length : 1;
            setStudentCount(studentCount);
            toast.success(`🎉 Certificate downloaded successfully!`);
            
        } catch (error) {
            console.error('Certificate Error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setLoadingCertificate(false);
        }
    };

    // ✅ Regenerate Certificate - Direct PDF Download
    const regenerateCertificate = async () => {
        setLoadingCertificate(true);
        try {
            const token = localStorage.getItem('token');
            const registrationCode = group?.registration_code;
            
            if (!registrationCode) {
                toast.error('Registration code not found');
                return;
            }
            
            const response = await axios.get(
                `${API_URL}/api/certificates/generate/${registrationCode}`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificate_${registrationCode}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success(`🎉 Certificate regenerated and downloaded successfully!`);
            
        } catch (error) {
            console.error('Regenerate Error:', error);
            toast.error(error.response?.data?.message || 'Failed to regenerate certificate');
        } finally {
            setLoadingCertificate(false);
        }
    };

    // ✅ Fetch all submitted projects
    const fetchAllProjects = async () => {
        setBrowseLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/projects/all-submitted`;
            const params = new URLSearchParams();
            if (browseFilters.grade) params.append('grade', browseFilters.grade);
            if (browseFilters.division) params.append('division', browseFilters.division);
            if (browseFilters.teacher) params.append('teacher', browseFilters.teacher);
            if (params.toString()) url += `?${params.toString()}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBrowseProjects(response.data.data);
                setFilteredProjects(response.data.data);
                const teachers = [...new Set(response.data.data.map(p => p.teacher_guide).filter(Boolean))];
                setUniqueTeachers(teachers);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setBrowseLoading(false);
        }
    };

    // Handle filter change
    const handleBrowseFilterChange = (e) => {
        const { name, value } = e.target;
        setBrowseFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
    useEffect(() => {
        let filtered = browseProjects;
        if (browseFilters.grade) {
            filtered = filtered.filter(p => p.grade === parseInt(browseFilters.grade));
        }
        if (browseFilters.division) {
            filtered = filtered.filter(p => p.division === browseFilters.division);
        }
        if (browseFilters.teacher) {
            filtered = filtered.filter(p => p.teacher_guide === browseFilters.teacher);
        }
        setFilteredProjects(filtered);
    }, [browseFilters, browseProjects]);

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

    // ✅ Fixed code - handles both string and object
    let students = group.students_data;
    if (typeof students === 'string') {
        students = JSON.parse(students);
    }
    if (!students || !Array.isArray(students)) {
        students = [];
    }
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

                {/* QR Code Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">📱 QR Code</h3>
                    {groupData?.qr_code ? (
                        <div className="text-center">
                            <img 
                                src={groupData.qr_code} 
                                alt="Project QR Code" 
                                className="w-48 h-48 mx-auto border-2 border-gray-300 rounded-lg shadow-md"
                            />
                            <p className="text-sm text-gray-600 mt-3">
                                Scan this QR code to view your project details
                            </p>
                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.download = `qr-${groupData.registration_code}.png`;
                                    link.href = groupData.qr_code;
                                    link.click();
                                }}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                                Download QR Code
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-yellow-600 font-medium">
                                📌 QR Code will be available after project submission
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Submit your project to generate your unique QR code
                            </p>
                            <button
                                onClick={() => navigate('/submit-project')}
                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Submit Project Now
                            </button>
                        </div>
                    )}
                </div>

                {/* ✅ CERTIFICATE SECTION */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">🏆 Certificate</h3>
                    
                    {!certificateStatus.available ? (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🔒</span>
                                <div>
                                    <p className="font-medium text-yellow-800">Certificates Not Yet Available</p>
                                    <p className="text-sm text-yellow-700">
                                        {certificateStatus.message || 'Certificates will be available after the Science Fair concludes.'}
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        📅 Fair Date: {certificateStatus.fairDate || '2026-08-01'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : hasCertificate ? (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="text-green-700 font-medium">🎉 Your participation certificate is ready!</p>
                                    <p className="text-sm text-green-600">
                                        {studentCount > 1 
                                            ? `📄 Certificate has ${studentCount} pages (one for each student)`
                                            : '📄 Certificate is ready for download'
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={generateCertificate}
                                        disabled={loadingCertificate}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loadingCertificate ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                Downloading...
                                            </>
                                        ) : (
                                            '📄 Download Certificate'
                                        )}
                                    </button>
                                    <button
                                        onClick={regenerateCertificate}
                                        disabled={loadingCertificate}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loadingCertificate ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                Regenerating...
                                            </>
                                        ) : (
                                            '🔄 Regenerate'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="text-blue-700 font-medium">📌 Certificate is now available!</p>
                                    <p className="text-sm text-blue-600">Click the button to generate your participation certificate.</p>
                                </div>
                                <button
                                    onClick={generateCertificate}
                                    disabled={loadingCertificate}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loadingCertificate ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Generating...
                                        </>
                                    ) : (
                                        '🏆 Generate Certificate'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ BROWSE PROJECTS SECTION - MOVED INSIDE RETURN */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-700">📚 Explore Other Projects</h3>
                        <button
                            onClick={() => {
                                setShowBrowse(!showBrowse);
                                if (!showBrowse) fetchAllProjects();
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                            {showBrowse ? '🔒 Hide Projects' : '🔍 Browse Projects'}
                        </button>
                    </div>
                    
                    {showBrowse && (
                        <div>
                            {/* Simple Filters */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                <select
                                    name="grade"
                                    value={browseFilters.grade}
                                    onChange={handleBrowseFilterChange}
                                    className="rounded-md border-gray-300 shadow-sm text-sm"
                                >
                                    <option value="">All Grades</option>
                                    {[3,4,5,6,7,8,9,10].map(g => (
                                        <option key={g} value={g}>Grade {g}</option>
                                    ))}
                                </select>
                                <select
                                    name="division"
                                    value={browseFilters.division}
                                    onChange={handleBrowseFilterChange}
                                    className="rounded-md border-gray-300 shadow-sm text-sm"
                                >
                                    <option value="">All Divisions</option>
                                    {['A','B','C','D','E','F','G','H','I'].map(d => (
                                        <option key={d} value={d}>Division {d}</option>
                                    ))}
                                </select>
                                <select
                                    name="teacher"
                                    value={browseFilters.teacher}
                                    onChange={handleBrowseFilterChange}
                                    className="rounded-md border-gray-300 shadow-sm text-sm"
                                >
                                    <option value="">All Teachers</option>
                                    {uniqueTeachers.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-500 ml-auto">
                                    {filteredProjects.length} project(s)
                                </span>
                            </div>
                            
                            {/* Projects Grid */}
                            {browseLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading projects...</div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No projects found. Try changing filters.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredProjects.map((project) => (
                                        <div 
                                            key={project.registration_code}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                        >
                                            <h4 className="font-bold text-gray-800">{project.team_name}</h4>
                                            <p className="text-sm text-gray-600 truncate">{project.project_title || 'No title'}</p>
                                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                                <span className="bg-blue-100 px-2 py-1 rounded">Grade {project.grade}</span>
                                                <span className="bg-gray-100 px-2 py-1 rounded">Div {project.division}</span>
                                                <span className="bg-green-100 px-2 py-1 rounded">👨‍🏫 {project.teacher_guide || 'N/A'}</span>
                                                <span className="bg-yellow-100 px-2 py-1 rounded">⭐ {project.average_rating || 0}</span>
                                            </div>
                                            <button
                                                onClick={() => window.open(`/project/${project.registration_code}`, '_blank')}
                                                className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition"
                                            >
                                                🔍 View Project
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

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