const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Submit Judge Score
router.post('/score', async (req, res) => {
    try {
        const { registration_code, judge_name, score, comments } = req.body;

        // Validate
        if (!registration_code || !judge_name || score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Find the group
        const groupResult = await pool.query(
            'SELECT id FROM groups WHERE registration_code = $1',
            [registration_code.toUpperCase()]
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const groupId = groupResult.rows[0].id;

        // Check if judge already scored this group
        const existing = await pool.query(
            'SELECT * FROM judge_scores WHERE group_id = $1 AND judge_name = $2',
            [groupId, judge_name]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing score
            result = await pool.query(
                `UPDATE judge_scores 
                SET score = $1, comments = $2, created_at = NOW()
                WHERE group_id = $3 AND judge_name = $4
                RETURNING *`,
                [score, comments, groupId, judge_name]
            );
        } else {
            // Insert new score
            result = await pool.query(
                `INSERT INTO judge_scores (group_id, judge_name, score, comments)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [groupId, judge_name, score, comments]
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
            message: 'Failed to record score'
        });
    }
});

// Get scores for a project
router.get('/scores/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pool.query(
            `SELECT js.judge_name, js.score, js.comments, js.created_at
            FROM groups g
            JOIN judge_scores js ON g.id = js.group_id
            WHERE g.registration_code = $1`,
            [code.toUpperCase()]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Scores Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scores'
        });
    }
});

module.exports = router;