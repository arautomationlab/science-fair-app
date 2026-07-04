const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Submit Project Details (Enhanced)
router.post('/submit', authenticate, async (req, res) => {
    try {
        const { 
            aim, materials, procedure, conclusion, 
            abstract, video_link, images 
        } = req.body;
        const groupId = req.user.id;

        // Check if project already exists
        const existing = await pool.query(
            'SELECT * FROM project_details WHERE group_id = $1',
            [groupId]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing
            result = await pool.query(
                `UPDATE project_details 
                SET aim = $1, materials = $2, procedure = $3, conclusion = $4,
                    abstract = $5, video_link = $6, images = $7, updated_at = NOW()
                WHERE group_id = $8
                RETURNING *`,
                [aim, materials, procedure, conclusion, abstract, video_link, images || '[]', groupId]
            );
        } else {
            // Insert new
            result = await pool.query(
                `INSERT INTO project_details 
                (group_id, aim, materials, procedure, conclusion, abstract, video_link, images)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [groupId, aim, materials, procedure, conclusion, abstract, video_link, images || '[]']
            );
        }

        // Update group submission status
        await pool.query(
            'UPDATE groups SET project_submitted = TRUE, submitted_at = NOW() WHERE id = $1',
            [groupId]
        );

        res.json({
            success: true,
            message: 'Project submitted successfully!',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Project Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit project'
        });
    }
});

// Get Public Project View (with all details)
router.get('/public/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pool.query(
            `SELECT 
                g.*,
                pd.aim, pd.materials, pd.procedure, pd.conclusion,
                pd.abstract as project_abstract, pd.video_link, pd.images,
                (SELECT AVG(stars) FROM parent_ratings WHERE group_id = g.id) as average_rating,
                (SELECT COUNT(*) FROM parent_ratings WHERE group_id = g.id) as total_ratings,
                (SELECT json_agg(json_build_object('judge_name', judge_name, 'score', score)) 
                 FROM judge_scores WHERE group_id = g.id) as judge_scores
            FROM groups g
            LEFT JOIN project_details pd ON g.id = pd.group_id
            WHERE g.registration_code = $1`,
            [code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Remove sensitive data
        delete result.rows[0].password;

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Public Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
});

module.exports = router;