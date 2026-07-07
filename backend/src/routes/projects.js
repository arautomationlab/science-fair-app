const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// ✅ PUBLIC PROJECT VIEW - THIS MUST EXIST
router.get('/public/:code', async (req, res) => {
    try {
        const { code } = req.params;
        console.log('📥 Public project request for code:', code);

        const result = await pool.query(
            `SELECT 
                g.id, g.registration_code, g.grade, g.division, 
                g.teacher_guide, g.team_name, g.project_title, g.abstract,
                g.students_data, g.project_submitted, g.created_at,
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

        console.log('🔍 Found rows:', result.rows.length);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        delete result.rows[0].password;

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Public Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project: ' + error.message
        });
    }
});

// ✅ GET Project by Code
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query(
            `SELECT g.*, pd.* 
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

        delete result.rows[0].password;

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
});

// ✅ Submit Project
router.post('/submit', authenticate, upload.array('images', 5), async (req, res) => {
    try {
        console.log('📥 Project submission received');
        console.log('📦 Body:', req.body);
        console.log('🖼️ Files:', req.files);

        const { 
            registration_code, aim, materials, procedure, conclusion, 
            abstract, video_link 
        } = req.body;

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        let groupId = null;
        if (registration_code) {
            const groupResult = await pool.query(
                'SELECT id FROM groups WHERE registration_code = $1',
                [registration_code.toUpperCase()]
            );
            if (groupResult.rows.length > 0) {
                groupId = groupResult.rows[0].id;
            }
        }

        if (!groupId) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const existing = await pool.query(
            'SELECT * FROM project_details WHERE group_id = $1',
            [groupId]
        );

        let result;
        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE project_details 
                SET aim = $1, materials = $2, procedure = $3, conclusion = $4,
                    abstract = $5, video_link = $6, images = $7, updated_at = NOW()
                WHERE group_id = $8
                RETURNING *`,
                [aim, materials, procedure, conclusion, abstract || '', video_link || '', JSON.stringify(imageUrls), groupId]
            );
        } else {
            result = await pool.query(
                `INSERT INTO project_details 
                (group_id, aim, materials, procedure, conclusion, abstract, video_link, images)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [groupId, aim, materials, procedure, conclusion, abstract || '', video_link || '', JSON.stringify(imageUrls)]
            );
        }

        await pool.query(
            'UPDATE groups SET project_submitted = TRUE, submitted_at = NOW() WHERE id = $1',
            [groupId]
        );

        res.json({
            success: true,
            message: 'Project submitted successfully!',
            data: result.rows[0],
            images: imageUrls
        });

    } catch (error) {
        console.error('Project Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit project: ' + error.message
        });
    }
});

module.exports = router;