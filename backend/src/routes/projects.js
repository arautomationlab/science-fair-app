const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ✅ GET project by registration code
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        console.log('📥 GET project request for code:', code);

        const result = await pool.query(
            `SELECT g.*, pd.* 
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
        console.error('Get Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
});

// ✅ POST submit project
router.post('/submit', authenticate, async (req, res) => {
    try {
        console.log('📥 Project submission received');
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
        console.log('👤 User from token:', JSON.stringify(req.user, null, 2));

        const { 
            registration_code, aim, materials, procedure, conclusion, 
            abstract, video_link, images 
        } = req.body;

        let groupId = null;

        // ✅ Method 1: Try to find group by registration_code from body
        if (registration_code) {
            console.log('🔍 Looking for group with registration_code:', registration_code);
            const groupResult = await pool.query(
                'SELECT id, registration_code, team_name FROM groups WHERE registration_code = $1',
                [registration_code.toUpperCase()]
            );
            if (groupResult.rows.length > 0) {
                groupId = groupResult.rows[0].id;
                console.log('✅ Group found by registration_code:', groupId);
                console.log('📝 Group details:', groupResult.rows[0]);
            } else {
                console.log('❌ No group found with registration_code:', registration_code);
                // ✅ Debug: Check what's in the database
                const allGroups = await pool.query('SELECT id, registration_code FROM groups');
                console.log('📋 All groups in database:', allGroups.rows);
            }
        }

        // ✅ Method 2: Try using the user ID from token
        if (!groupId && req.user && req.user.id) {
            console.log('🔍 Looking for group with user ID:', req.user.id);
            const groupResult = await pool.query(
                'SELECT id, registration_code, team_name FROM groups WHERE id = $1',
                [req.user.id]
            );
            if (groupResult.rows.length > 0) {
                groupId = groupResult.rows[0].id;
                console.log('✅ Group found by user ID:', groupId);
            } else {
                console.log('❌ No group found with user ID:', req.user.id);
            }
        }

        if (!groupId) {
            console.log('❌ No group found. Registration code:', registration_code);
            console.log('❌ User from token:', req.user);
            return res.status(404).json({
                success: false,
                message: 'Group not found. Please ensure you are logged in correctly.'
            });
        }

        // Check if project already exists
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
                [aim, materials, procedure, conclusion, abstract || '', video_link || '', images || '[]', groupId]
            );
            console.log('✅ Project updated for group:', groupId);
        } else {
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

module.exports = router;