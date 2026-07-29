const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Submit Judge Score (Public - No Authentication Required)
router.post('/score', async (req, res) => {
    try {
        const { registration_code, judge_name, score, comments, criteria_scores } = req.body;

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
                message: 'Project not found'
            });
        }

        const groupId = groupResult.rows[0].id;

        // ✅ Store criteria_scores as JSON
        const criteriaScoresJSON = criteria_scores ? JSON.stringify(criteria_scores) : null;

        // Check if judge already scored this project
        const existing = await pool.query(
            'SELECT * FROM judge_scores WHERE group_id = $1 AND judge_name = $2',
            [groupId, judge_name]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing score
            result = await pool.query(
                `UPDATE judge_scores 
                SET score = $1, comments = $2, criteria_scores = $3, created_at = NOW()
                WHERE group_id = $4 AND judge_name = $5
                RETURNING *`,
                [score, comments || '', criteriaScoresJSON, groupId, judge_name]
            );
        } else {
            // Insert new score with criteria_scores
            result = await pool.query(
                `INSERT INTO judge_scores (group_id, judge_name, score, comments, criteria_scores)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [groupId, judge_name, score, comments || '', criteriaScoresJSON]
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

// Get scores for a project
router.get('/scores/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pool.query(
            `SELECT js.judge_name, js.score, js.comments, js.criteria_scores, js.created_at
            FROM groups g
            JOIN judge_scores js ON g.id = js.group_id
            WHERE g.registration_code = $1`,
            [code.toUpperCase()]
        );

        // ✅ Parse criteria_scores back to object if needed
        const scores = result.rows.map(row => {
            if (row.criteria_scores && typeof row.criteria_scores === 'string') {
                row.criteria_scores = JSON.parse(row.criteria_scores);
            }
            return row;
        });

        res.json({
            success: true,
            data: scores
        });

    } catch (error) {
        console.error('Get Scores Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scores: ' + error.message
        });
    }
});

module.exports = router;