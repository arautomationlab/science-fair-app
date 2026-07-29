// backend/src/routes/admin-settings.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { getSetting, updateSetting, isRegistrationLocked } = require('../utils/settings');

// Get all registration settings
router.get('/registration-settings', async (req, res) => {
    try {
        const locked = await isRegistrationLocked();
        const lockDateTime = await getSetting('registration_lock_datetime');
        const overrideCount = await getSetting('teacher_override_used');
        const overrideEnabled = await getSetting('teacher_override_enabled');
        
        res.json({
            success: true,
            data: {
                locked: locked,
                lock_datetime: lockDateTime || '2026-07-29 20:00:00',
                override_count: parseInt(overrideCount || 0),
                override_enabled: overrideEnabled === 'true'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle registration lock
router.post('/toggle-registration', async (req, res) => {
    try {
        const { locked } = req.body;
        await updateSetting('registration_locked', locked ? 'true' : 'false');
        
        res.json({
            success: true,
            message: `Registrations ${locked ? 'locked' : 'unlocked'} successfully`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update lock date/time
router.post('/update-lock-datetime', async (req, res) => {
    try {
        const { lock_datetime } = req.body;
        await updateSetting('registration_lock_datetime', lock_datetime);
        
        res.json({
            success: true,
            message: 'Lock date/time updated successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle teacher override
router.post('/toggle-override', async (req, res) => {
    try {
        const { enabled } = req.body;
        await updateSetting('teacher_override_enabled', enabled ? 'true' : 'false');
        
        res.json({
            success: true,
            message: `Teacher override ${enabled ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get override logs
router.get('/overrides', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM teacher_overrides 
             ORDER BY created_at DESC 
             LIMIT 100`
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;