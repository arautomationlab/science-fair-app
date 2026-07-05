import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from 'xlsx';

// ✅ ADD THIS - API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        grade: '',
        division: '',
        status: ''
    });
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
        }
        fetchProjects();
        fetchStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [projects, filters]);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            // ✅ FIXED
            const response = await axios.get(
                `${API_URL}/api/teacher/my-projects`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.data.success) {
                setProjects(response.data.data);
                setFilteredProjects(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Projects Error:', error);
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            // ✅ FIXED
            const response = await axios.get(
                `${API_URL}/api/teacher/my-stats`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Stats Error:', error);
            toast.error('Failed to fetch stats');
        }
    };

    const applyFilters = () => {
        let filtered = [...projects];

        if (filters.grade) {
            filtered = filtered.filter(p => p.grade === parseInt(filters.grade));
        }
        if (filters.division) {
            filtered = filtered.filter(p => p.division === filters.division);
        }
        if (filters.status) {
            const isSubmitted = filters.status === 'submitted';
            filtered = filtered.filter(p => p.project_submitted === isSubmitted);
        }

        setFilteredProjects(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ grade: '', division: '', status: '' });
    };

    // Export to Excel
    const exportToExcel = () => {
        const exportData = filteredProjects.map(p => ({
            'Team Name': p.team_name,
            'Project Title': p.project_title,
            'Grade': p.grade,
            'Division': p.division,
            'Students': JSON.parse(p.students_data || '[]').map(s => s.name).join(', '),
            'Parents': JSON.parse(p.students_data || '[]').map(s => s.parent_name).join(', '),
            'Parent Contacts': JSON.parse(p.students_data || '[]').map(s => s.parent_phone).join(', '),
            'Teacher Guide': p.teacher_guide || 'N/A',
            'Status': p.project_submitted ? 'Submitted' : 'Pending',
            'Average Score': p.average_score ? Math.round(p.average_score) + '%' : 'Not yet',
            'Registration Code': p.registration_code,
            'Created': new Date(p.created_at).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        
        const colWidths = [
            { wch: 25 }, { wch: 30 }, { wch: 8 }, { wch: 10 },
            { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 25 },
            { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 }
        ];
        ws['!cols'] = colWidths;

        const filename = `Teacher_Projects_${user?.full_name || 'Teacher'}_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, filename);
        toast.success('📊 File exported successfully!');
        setShowExportModal(false);
    };

    const exportToPDF = () => {
        window.print();
        setShowExportModal(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const uniqueGrades = [...new Set(projects.map(p => p.grade))].sort();
    const uniqueDivisions = [...new Set(projects.map(p => p.division))].sort();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        👨‍🏫 Teacher Dashboard
                    </h2>
                    <p className="text-gray-600">
                        Welcome, <span className="font-semibold">{user?.full_name || 'Teacher'}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    >
                        📊 Export
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Total Projects</p>
                        <p className="text-2xl font-bold text-green-600">{stats.total_projects || 0}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.submitted_projects || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending_projects || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Grades Covered</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.grade_count || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <h4 className="font-semibold text-gray-700">🔍 Filter Projects:</h4>
                    <select
                        name="grade"
                        value={filters.grade}
                        onChange={handleFilterChange}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Grades</option>
                        {uniqueGrades.map(g => (
                            <option key={g} value={g}>Grade {g}</option>
                        ))}
                    </select>
                    <select
                        name="division"
                        value={filters.division}
                        onChange={handleFilterChange}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Divisions</option>
                        {uniqueDivisions.map(d => (
                            <option key={d} value={d}>Division {d}</option>
                        ))}
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Clear Filters
                    </button>
                    <span className="text-sm text-gray-500 ml-auto">
                        Showing {filteredProjects.length} of {projects.length} projects
                    </span>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        No projects found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project, index) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{project.team_name}</div>
                                            <div className="text-sm text-gray-500">{project.project_title}</div>
                                        </td>
                                        <td className="px-4 py-3">{project.grade} - {project.division}</td>
                                        <td className="px-4 py-3">
                                            {JSON.parse(project.students_data || '[]').map(s => s.name).join(', ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                project.project_submitted 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {project.project_submitted ? '✅ Submitted' : '⏳ Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {project.average_score ? (
                                                <span className="font-bold text-blue-600">
                                                    {Math.round(project.average_score)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not yet</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/project/${project.registration_code}`}
                                                className="text-blue-600 hover:text-blue-900 text-sm mr-2"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(project.registration_code);
                                                    toast.success('Code copied!');
                                                }}
                                                className="text-gray-600 hover:text-gray-900 text-sm"
                                            >
                                                Copy
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Export Projects</h3>
                        <p className="text-gray-600 mb-4">
                            Exporting {filteredProjects.length} projects ({filters.grade ? `Grade ${filters.grade}` : 'All Grades'})
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={exportToExcel}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                📊 Excel
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                📄 PDF
                            </button>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;