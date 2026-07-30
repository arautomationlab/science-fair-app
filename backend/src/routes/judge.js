// backend/src/routes/judge.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// ==================== VERIFY JUDGE ACCESS ====================
router.post('/verify-access', async (req, res) => {
    try {
        const { access_code } = req.body;

        if (!access_code) {
            return res.status(400).json({
                success: false,
                message: 'Access code is required'
            });
        }

        // ✅ Check if access code exists and is active
        const result = await pool.query(
            `SELECT id, access_code, judge_name, is_active, used_count, expires_at
             FROM judge_access_codes 
             WHERE access_code = $1 AND is_active = true`,
            [access_code]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive access code'
            });
        }

        const codeData = result.rows[0];

        // ✅ Check if code has expired
        if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'This access code has expired'
            });
        }

        // ✅ Generate JWT token for judge
        const token = jwt.sign(
            { 
                judge_id: codeData.id,
                judge_name: codeData.judge_name,
                access_code: codeData.access_code,
                role: 'judge',
                expiresIn: '8h'
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '8h' }
        );

        // ✅ Update usage count
        await pool.query(
            `UPDATE judge_access_codes 
             SET used_count = used_count + 1, last_used_at = NOW()
             WHERE id = $1`,
            [codeData.id]
        );

        res.json({
            success: true,
            message: 'Access granted',
            token: token,
            judge_name: codeData.judge_name,
            access_code: codeData.access_code
        });

    } catch (error) {
        console.error('Judge Access Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify access: ' + error.message
        });
    }
});

// ==================== SUBMIT JUDGE SCORE ====================
router.post('/score', async (req, res) => {
    try {
        // ✅ Verify judge token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const { registration_code, score, comments, criteria_scores } = req.body;

        // Find the group
        const groupResult = await pool.query(
            'SELECT id FROM groups WHERE registration_code = $1',
            [registration_code.toUpperCase()]
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const groupId = groupResult.rows[0].id;
        const judgeName = decoded.judge_name;

        // ✅ Store score
        const criteriaScoresJSON = criteria_scores ? JSON.stringify(criteria_scores) : null;

        const existing = await pool.query(
            'SELECT * FROM judge_scores WHERE group_id = $1 AND judge_name = $2',
            [groupId, judgeName]
        );

        let result;
        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE judge_scores 
                SET score = $1, comments = $2, criteria_scores = $3, created_at = NOW()
                WHERE group_id = $4 AND judge_name = $5
                RETURNING *`,
                [score, comments || '', criteriaScoresJSON, groupId, judgeName]
            );
        } else {
            result = await pool.query(
                `INSERT INTO judge_scores (group_id, judge_name, score, comments, criteria_scores)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [groupId, judgeName, score, comments || '', criteriaScoresJSON]
            );
        }

        res.json({
            success: true,
            message: 'Score recorded successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Judge Score Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record score: ' + error.message
        });
    }
});

// ==================== GET JUDGE ACCESS CODES (ADMIN ONLY) ====================
router.get('/access-codes', async (req, res) => {
    try {
        // Verify admin
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }

        const result = await pool.query(
            `SELECT id, access_code, judge_name, is_active, used_count, last_used_at, created_at, expires_at
             FROM judge_access_codes
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Access Codes Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch access codes'
        });
    }
});

// ==================== CREATE NEW ACCESS CODE (ADMIN ONLY) ====================
router.post('/access-codes', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }

        const { access_code, judge_name } = req.body;

        if (!access_code || !judge_name) {
            return res.status(400).json({
                success: false,
                message: 'Access code and judge name are required'
            });
        }

        // Generate random 4-digit code if not provided
        const finalCode = access_code || String(Math.floor(1000 + Math.random() * 9000));

        const result = await pool.query(
            `INSERT INTO judge_access_codes (access_code, judge_name, assigned_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [finalCode, judge_name, decoded.full_name || 'admin']
        );

        res.json({
            success: true,
            message: 'Access code created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Create Access Code Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create access code'
        });
    }
});

// ==================== TOGGLE ACCESS CODE STATUS (ADMIN ONLY) ====================
router.put('/access-codes/:id/toggle', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }

        const { id } = req.params;
        const { is_active } = req.body;

        const result = await pool.query(
            `UPDATE judge_access_codes 
             SET is_active = $1 
             WHERE id = $2
             RETURNING *`,
            [is_active, id]
        );

        res.json({
            success: true,
            message: `Access code ${is_active ? 'activated' : 'deactivated'}`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Toggle Access Code Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update access code'
        });
    }
});

module.exports = router;