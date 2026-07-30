// frontend/src/pages/Winners.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_API_URL || 'https://science-fair-backend.onrender.com';

const Winners = () => {
    const { grade } = useParams();
    const navigate = useNavigate();
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allProjects, setAllProjects] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        fetchWinners();
        fetchAllProjects();
    }, [grade]);

    const fetchWinners = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/winners/${grade}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setWinners(response.data.winners);
            }
        } catch (error) {
            console.error('Fetch Winners Error:', error);
            toast.error('Failed to fetch winners');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/all-projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                // Filter projects by grade
                const filtered = response.data.data.filter(p => p.grade === parseInt(grade));
                setAllProjects(filtered);
            }
        } catch (error) {
            console.error('Fetch All Projects Error:', error);
        }
    };

    const getStudentNames = (studentsData) => {
        let students = studentsData;
        if (typeof students === 'string') {
            try {
                students = JSON.parse(students);
            } catch (e) {
                return '';
            }
        }
        if (!students || !Array.isArray(students)) {
            return '';
        }
        return students.map(s => {
            const name = `${s.firstName || ''} ${s.lastName || ''}`.trim();
            return name || s.name || 'Unknown';
        }).join(', ');
    };

    const getStudentArray = (studentsData) => {
        let students = studentsData;
        if (typeof students === 'string') {
            try {
                students = JSON.parse(students);
            } catch (e) {
                return [];
            }
        }
        if (!students || !Array.isArray(students)) {
            return [];
        }
        return students;
    };

    // ✅ Export to Excel - with Total Score out of 40 per judge
const exportToExcel = () => {
    const gradeProjects = allProjects.filter(p => p.grade === parseInt(grade));
    
    if (gradeProjects.length === 0) {
        toast.error('No projects found for this grade');
        return;
    }

    const exportData = gradeProjects.map(project => {
        // ✅ Get judge scores
        let judgeScores = [];
        if (project.judge_scores) {
            if (Array.isArray(project.judge_scores)) {
                judgeScores = project.judge_scores;
            } else if (typeof project.judge_scores === 'string') {
                try {
                    judgeScores = JSON.parse(project.judge_scores);
                } catch (e) {
                    judgeScores = [];
                }
            }
        }

        if (!Array.isArray(judgeScores)) {
            judgeScores = [];
        }

        // Sort by judge name
        judgeScores = judgeScores.sort((a, b) => 
            (a.judge_name || '').localeCompare(b.judge_name || '')
        );

        const row = {
            'Team Name': project.team_name || 'N/A',
            'Students': getStudentNames(project.students_data),
            'Grade': project.grade || 'N/A',
            'Division': project.division || 'N/A',
        };

        // ✅ Add each judge's score (out of 40)
        const scores = [];
        judgeScores.forEach((score, index) => {
            const scoreValue = score.score || 0;
            row[`Judge ${index + 1} (out of 40)`] = scoreValue;
            scores.push(scoreValue);
        });

        // ✅ Calculate TOTAL (sum of all judges' scores)
        const total = scores.reduce((sum, s) => sum + s, 0);
        const maxPossible = scores.length * 40; // Each judge has max 40
        
        row['Total Score'] = scores.length > 0 ? `${total}/${maxPossible}` : 'N/A';
        row['Average %'] = scores.length > 0 ? Math.round((total / maxPossible) * 100) + '%' : 'N/A';
        row['Number of Judges'] = judgeScores.length;

        return row;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
        { wch: 30 }, // Team Name
        { wch: 40 }, // Students
        { wch: 10 }, // Grade
        { wch: 12 }, // Division
        { wch: 18 }, // Judge 1 (out of 40)
        { wch: 18 }, // Judge 2 (out of 40)
        { wch: 18 }, // Judge 3 (out of 40)
        { wch: 18 }, // Judge 4 (out of 40)
        { wch: 18 }, // Total Score
        { wch: 15 }, // Average %
        { wch: 15 }, // Number of Judges
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Grade ${grade} Scores`);

    const filename = `Grade_${grade}_Scores_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    toast.success(`✅ Grade ${grade} scores exported successfully!`);
    setShowExportModal(false);
};

    const getMedal = (position) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[position] || '🏅';
    };

    const getMedalColor = (position) => {
        const colors = ['text-yellow-600', 'text-gray-500', 'text-amber-700'];
        return colors[position] || 'text-blue-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading winners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        🏆 Science Fair Winners
                    </h2>
                    <p className="text-xl text-gray-600 mt-2">Grade {grade}</p>
                </div>

                {winners.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No winners declared yet for Grade {grade}</p>
                        <p className="text-sm text-gray-400 mt-2">Make sure at least 2 judges have scored the projects</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {winners.map((winner, index) => {
                            const students = getStudentArray(winner.students_data);
                            
                            return (
                                <div 
                                    key={index}
                                    className={`border-2 rounded-lg p-6 ${
                                        index === 0 ? 'border-yellow-400 bg-yellow-50' :
                                        index === 1 ? 'border-gray-300 bg-gray-50' :
                                        'border-amber-300 bg-amber-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-4xl ${getMedalColor(index)}`}>
                                                {getMedal(index)}
                                            </span>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {winner.team_name}
                                                </h3>
                                                <p className="text-gray-600">{winner.project_title}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {students.length > 0 ? (
                                                        students.map((student, idx) => (
                                                            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                                {student.firstName || student.name || 'Unknown'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No students listed</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Average Score</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {Math.round(winner.average_score)}%
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {winner.total_judges} judges
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        ← Back to Admin
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        🖨️ Print Results
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        📊 Export to Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Winners;