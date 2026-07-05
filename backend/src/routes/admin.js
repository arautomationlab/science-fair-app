const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

// Get All Projects (Admin)
router.get('/all-projects', authenticateAdmin, async (req, res) => {
    try {
        console.log('📊 Admin fetching all projects');

        const result = await pool.query(
            `SELECT 
                g.*,
                pd.aim, pd.materials, pd.procedure, pd.conclusion,
                pd.abstract as project_abstract, pd.images, pd.video_link,
                pd.submitted_at as project_submitted_at,
                (SELECT AVG(score) FROM judge_scores WHERE group_id = g.id) as average_score,
                (SELECT COUNT(*) FROM judge_scores WHERE group_id = g.id) as judge_count,
                (SELECT AVG(stars) FROM parent_ratings WHERE group_id = g.id) as parent_rating,
                (SELECT COUNT(*) FROM parent_ratings WHERE group_id = g.id) as rating_count,
                u.full_name as teacher_name
            FROM groups g
            LEFT JOIN project_details pd ON g.id = pd.group_id
            LEFT JOIN users u ON g.teacher_id = u.id
            ORDER BY g.grade, g.division`
        );

        console.log(`✅ Found ${result.rows.length} projects`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('All Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects: ' + error.message
        });
    }
});

// Get All Teachers
router.get('/teachers', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, full_name, teacher_name, email FROM users WHERE role = $1 ORDER BY full_name',
            ['teacher']
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Teachers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers'
        });
    }
});

// Get Winners by Grade
router.get('/winners/:grade', authenticateAdmin, async (req, res) => {
    try {
        const { grade } = req.params;

        const result = await pool.query(
            `SELECT 
                g.id, g.registration_code, g.team_name, g.project_title,
                g.grade, g.division, g.students_data, g.teacher_guide,
                AVG(js.score) as average_score,
                COUNT(js.score) as total_judges,
                (SELECT AVG(stars) FROM parent_ratings WHERE group_id = g.id) as parent_rating
            FROM groups g
            JOIN judge_scores js ON g.id = js.group_id
            WHERE g.grade = $1
            GROUP BY g.id
            HAVING COUNT(js.score) >= 2
            ORDER BY average_score DESC
            LIMIT 3`,
            [grade]
        );

        res.json({
            success: true,
            grade: grade,
            winners: result.rows
        });

    } catch (error) {
        console.error('Winners Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch winners'
        });
    }
});

module.exports = router;