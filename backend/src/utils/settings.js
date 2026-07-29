// backend/src/utils/settings.js

const { pool } = require('../config/database');

async function getSetting(key) {
    const result = await pool.query(
        'SELECT value FROM settings WHERE key = $1',
        [key]
    );
    return result.rows.length > 0 ? result.rows[0].value : null;
}

async function updateSetting(key, value) {
    await pool.query(
        `INSERT INTO settings (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
    );
}

async function isRegistrationLocked() {
    // 1. Check if manually locked
    const manuallyLocked = await getSetting('registration_locked');
    if (manuallyLocked === 'true') return true;
    
    // 2. Check if auto-lock time has passed
    const lockDateTime = await getSetting('registration_lock_datetime');
    if (lockDateTime) {
        const lockDate = new Date(lockDateTime);
        const now = new Date();
        if (now > lockDate) {
            // Auto-lock
            await updateSetting('registration_locked', 'true');
            console.log(`🔒 Registrations auto-locked at ${now.toISOString()}`);
            return true;
        }
    }
    
    return false;
}

async function logTeacherOverride(teacherUsername, registrationCode, studentName, reason) {
    await pool.query(
        `INSERT INTO teacher_overrides 
        (teacher_username, registration_code, student_name, reason) 
        VALUES ($1, $2, $3, $4)`,
        [teacherUsername, registrationCode, studentName, reason]
    );
    
    // Increment override count
    const currentCount = await getSetting('teacher_override_used');
    await updateSetting('teacher_override_used', String(parseInt(currentCount || 0) + 1));
}

async function canTeacherOverride() {
    const enabled = await getSetting('teacher_override_enabled');
    return enabled === 'true';
}

module.exports = { 
    getSetting, 
    updateSetting, 
    isRegistrationLocked,
    logTeacherOverride,
    canTeacherOverride
};