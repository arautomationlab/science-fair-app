const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Submit Parent Rating
router.post('/rate', async (req, res) => {
    try {
        const { registration_code, stars, comment } = req.body;

        if (!registration_code || !stars) {
            return res.status(400).json({
                success: false,
                message: 'Registration code and stars are required'
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
            `INSERT INTO parent_ratings (group_id, stars, comment)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [groupId, stars, comment || '']
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

module.exports = router;