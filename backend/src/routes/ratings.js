const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Submit Parent Rating (Stars)
router.post('/rate', async (req, res) => {
    try {
        const { registration_code, stars, comment } = req.body;

        // Validate
        if (!registration_code || !stars || stars < 1 || stars > 5) {
            return res.status(400).json({
                success: false,
                message: 'Invalid rating. Stars must be between 1-5'
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

        // Save rating
        const result = await pool.query(
            `INSERT INTO parent_ratings (group_id, stars, comment)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [groupId, stars, comment]
        );

        res.json({
            success: true,
            message: 'Thank you for your rating!',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Rating Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating'
        });
    }
});

// Get average rating for a project
router.get('/ratings/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pool.query(
            `SELECT 
                AVG(stars) as average_rating,
                COUNT(*) as total_ratings,
                json_agg(json_build_object('stars', stars, 'comment', comment)) as all_ratings
            FROM groups g
            JOIN parent_ratings pr ON g.id = pr.group_id
            WHERE g.registration_code = $1`,
            [code.toUpperCase()]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Ratings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ratings'
        });
    }
});

module.exports = router;