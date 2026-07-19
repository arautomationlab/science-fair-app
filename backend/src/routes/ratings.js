const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Check if ratings are open
function isRatingOpen() {
    const fairDate = process.env.FAIR_DATE || '2026-07-31';
    const startTime = process.env.FAIR_START_TIME || '09:00';
    const endTime = process.env.FAIR_END_TIME || '16:00';
    
    const now = new Date();
    const fairStart = new Date(`${fairDate}T${startTime}:00`);
    const fairEnd = new Date(`${fairDate}T${endTime}:00`);
    
    return now >= fairStart && now <= fairEnd;
}

// Submit Parent Rating
router.post('/rate', async (req, res) => {
    try {
        // ✅ Check if ratings are open
        if (!isRatingOpen()) {
            return res.status(403).json({
                success: false,
                message: 'Parent ratings are only available during the Science Fair (9:00 AM - 5:00 PM). Please visit us on the fair day!'
            });
        }

        const { registration_code, stars, comment } = req.body;

        if (!registration_code || !stars) {
            return res.status(400).json({
                success: false,
                message: 'Registration code and stars are required'
            });
        }

        if (stars < 1 || stars > 5) {
            return res.status(400).json({
                success: false,
                message: 'Stars must be between 1 and 5'
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
            message: 'Thank you for your rating! 🌟',
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

// Get rating status
router.get('/status', (req, res) => {
    const isOpen = isRatingOpen();
    const fairDate = process.env.FAIR_DATE || '2026-07-31';
    const startTime = process.env.FAIR_START_TIME || '09:00';
    const endTime = process.env.FAIR_END_TIME || '16:00';
    
    res.json({
        success: true,
        data: {
            isOpen: isOpen,
            message: isOpen ? 'Ratings are now open!' : `Ratings will open on ${fairDate} at ${startTime} AM`,
            fairDate: fairDate,
            startTime: startTime,
            endTime: endTime
        }
    });
});

module.exports = router;