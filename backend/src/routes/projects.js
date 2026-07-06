const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Submit Project Details
router.post('/submit', authenticate, async (req, res) => {
    try {
        console.log('📥 Project submission received');
        console.log('📦 Body:', req.body);
        console.log('👤 User from token:', req.user);

        const { 
            registration_code, group_id, aim, materials, procedure, conclusion, 
            abstract, video_link, images 
        } = req.body;
        
        console.log('🔑 Registration code from body:', registration_code);
        console.log('🆔 Group ID from body:', group_id);

        // ✅ First, try to find the group by registration_code
        let groupId = null;
        let group = null;
        
        if (registration_code) {
            const groupResult = await pool.query(
                'SELECT id, registration_code, team_name FROM groups WHERE registration_code = $1',
                [registration_code.toUpperCase()]
            );
            if (groupResult.rows.length > 0) {
                group = groupResult.rows[0];
                groupId = group.id;
                console.log('✅ Group found by registration_code:', groupId);
                console.log('📝 Group details:', group);
            } else {
                console.log('❌ No group found with registration_code:', registration_code);
            }
        }
        
        // ✅ If not found by registration_code, try using group_id from body
        if (!groupId && group_id) {
            const groupResult = await pool.query(
                'SELECT id, registration_code, team_name FROM groups WHERE id = $1',
                [group_id]
            );
            if (groupResult.rows.length > 0) {
                group = groupResult.rows[0];
                groupId = group.id;
                console.log('✅ Group found by group_id:', groupId);
            }
        }
        
        // ✅ If still not found, try using the user ID from token
        if (!groupId && req.user && req.user.id) {
            const groupResult = await pool.query(
                'SELECT id, registration_code, team_name FROM groups WHERE id = $1',
                [req.user.id]
            );
            if (groupResult.rows.length > 0) {
                group = groupResult.rows[0];
                groupId = group.id;
                console.log('✅ Group found by user ID:', groupId);
            }
        }

        if (!groupId) {
            console.log('❌ No group found. Registration code:', registration_code);
            console.log('❌ Group ID:', group_id);
            console.log('❌ User from token:', req.user);
            return res.status(404).json({
                success: false,
                message: 'Group not found. Please ensure you are logged in correctly.'
            });
        }

        console.log('✅ Final group ID:', groupId);

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
                [aim, materials, procedure, conclusion, abstract || '', video_link || '', images || '[]', groupId]
            );
            console.log('✅ Project updated for group:', groupId);
        } else {
            // Insert new
            result = await pool.query(
                `INSERT INTO project_details 
                (group_id, aim, materials, procedure, conclusion, abstract, video_link, images)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [groupId, aim, materials, procedure, conclusion, abstract || '', video_link || '', images || '[]']
            );
            console.log('✅ New project created for group:', groupId);
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
            message: 'Failed to submit project: ' + error.message
        });
    }
});

// Get Project Details (for judges/parents)
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

        // Don't send password
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

// Get Public Project View
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