const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateTeacher } = require('../middleware/auth');

// Get Teacher's Projects
router.get('/my-projects', authenticateTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacherName = req.user.teacher_name;

        const result = await pool.query(
            `SELECT 
                g.id, g.registration_code, g.team_name, g.project_title, 
                g.grade, g.division, g.students_data, g.project_submitted,
                g.created_at,
                pd.aim, pd.materials, pd.procedure, pd.conclusion,
                pd.abstract as project_abstract, pd.images,
                (SELECT AVG(score) FROM judge_scores WHERE group_id = g.id) as average_score,
                (SELECT COUNT(*) FROM judge_scores WHERE group_id = g.id) as judge_count
            FROM groups g
            LEFT JOIN project_details pd ON g.id = pd.group_id
            WHERE g.teacher_id = $1 OR g.teacher_guide = $2
            ORDER BY g.created_at DESC`,
            [teacherId, teacherName]
        );

        res.json({
            success: true,
            data: result.rows,
            teacher_name: teacherName
        });

    } catch (error) {
        console.error('Get Teacher Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});

// Get Teacher's Project Statistics
router.get('/my-stats', authenticateTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacherName = req.user.teacher_name;

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_projects,
                COUNT(CASE WHEN project_submitted = true THEN 1 END) as submitted_projects,
                COUNT(CASE WHEN project_submitted = false THEN 1 END) as pending_projects,
                (SELECT COUNT(DISTINCT grade) FROM groups WHERE teacher_id = $1 OR teacher_guide = $2) as grade_count
            FROM groups g
            WHERE g.teacher_id = $1 OR g.teacher_guide = $2`,
            [teacherId, teacherName]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Teacher Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

module.exports = router;