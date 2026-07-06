const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Submit Judge Score
router.post('/score', async (req, res) => {
    try {
        const { registration_code, judge_name, score, comments } = req.body;

        if (!registration_code || !judge_name) {
            return res.status(400).json({
                success: false,
                message: 'Registration code and judge name are required'
            });
        }

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

        const result = await pool.query(
            `INSERT INTO judge_scores (group_id, judge_name, score, comments)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [groupId, judge_name, score, comments || '']
        );

        res.json({
            success: true,
            message: 'Score recorded successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Judge Score Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record score'
        });
    }
});

module.exports = router;