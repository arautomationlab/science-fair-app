const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const QRCode = require('qrcode');
const { isRegistrationLocked, logTeacherOverride, getSetting } = require('../utils/settings'); // ✅ ADD THIS LINE


// Generate Unique Code
function generateCode(grade) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SPARK4.0-${grade}-${timestamp}-${random}`;
}

// ==================== STUDENT REGISTRATION ====================
router.post('/register', [
    body('grade').isInt({ min: 3, max: 10 }),
    body('division').isString().isLength({ min: 1, max: 2 }),
    body('teacher_guide').notEmpty().trim(),
    body('team_name').notEmpty().trim(),
    body('project_title').notEmpty().trim(),
    body('abstract').optional().trim(),
    body('participants').isInt({ min: 1, max: 4 }),
    body('students').isArray(),
    body('teacher_override').optional().isBoolean()  // ✅ ADD THIS LINE
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { 
            grade, division, teacher_guide, team_name, project_title, abstract,
            participants, students,
            teacher_override = false // ✅ ADD THIS LINE
        } = req.body;

        // ✅ ADD THIS LOCK CHECK
        const locked = await isRegistrationLocked();

        if (locked && !teacher_override) {
            return res.status(403).json({
                success: false,
                message: '⚠️ Registrations are now closed for Spark 4.0 Science Fair.',
                locked: true
            });
        }

        // ✅ LOG TEACHER OVERRIDE
        if (teacher_override) {
            const teacherUsername = req.user?.username || 'teacher';
            await logTeacherOverride(
                teacherUsername,
                'PENDING',
                students.map(s => `${s.firstName} ${s.lastName}`).join(', '),
                'Urgent registration after lock'
            );
            console.log(`🔓 Teacher override used by: ${teacherUsername}`);
        }

        // Find teacher user
        const teacherResult = await pool.query(
            'SELECT id FROM users WHERE full_name = $1 AND role = $2',
            [teacher_guide, 'teacher']
        );

        const teacherId = teacherResult.rows.length > 0 ? teacherResult.rows[0].id : null;

        // Generate credentials
        const registrationCode = generateCode(grade);
        const password = Math.random().toString(36).substring(2, 10);
        const hashedPassword = await bcrypt.hash(password, 10);
        const studentsJson = JSON.stringify(students);

        // Insert into database
        const result = await pool.query(
            `INSERT INTO groups 
            (registration_code, password, grade, division, teacher_guide, teacher_id,
             team_name, project_title, abstract, participants, students_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, registration_code`,
            [registrationCode, hashedPassword, grade, division, teacher_guide, teacherId,
             team_name, project_title, abstract || '', participants, studentsJson]
        );
        // After the INSERT query, add:
        if (teacher_override) {
            const teacherUsername = req.user?.username || 'teacher';
            await pool.query(
                `UPDATE teacher_overrides 
                SET registration_code = $1 
                WHERE teacher_username = $2 AND registration_code = 'PENDING'
                ORDER BY created_at DESC LIMIT 1`,
                [registrationCode, teacherUsername]
            );
        }
        const groupId = result.rows[0].id;

        // Generate QR Code
        const frontendUrl = process.env.APP_URL || 'https://science-fair-app.vercel.app';
        const qrData = `${frontendUrl}/project/${registrationCode}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        console.log(`✅ Registration successful! Code: ${registrationCode}`);
        console.log(`📱 QR Code URL: ${qrData}`);

        // ✅ Send email in BACKGROUND (non-blocking)
        setTimeout(async () => {
            try {
                const emailService = require("../services/emailService");
                for (const student of students) {
                    const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
                    console.log("======================================");
                    console.log("📧 Parent Email :", student.parent_email || "(No Email)");
                    console.log("👦 Student Name :", studentName);
                    console.log("🔑 Registration :", registrationCode);
                    console.log("======================================");

                    if (student.parent_email && student.parent_email.trim() !== "") {
                        const emailResult = await emailService.sendRegistrationEmail(
                            student.parent_email.trim(),
                            studentName,
                            student.parent_name,
                            registrationCode,
                            password,
                            team_name,
                            project_title,
                            grade,
                            division,
                            qrCodeDataUrl
                        );

                        if (emailResult.success) {
                            console.log("======================================");
                            console.log("✅ EMAIL SENT SUCCESSFULLY");
                            console.log("📧 To :", student.parent_email);
                            console.log("📨 Message ID :", emailResult.messageId);
                            console.log("======================================");
                        } else {
                            console.log("======================================");
                            console.log("❌ EMAIL FAILED");
                            console.log(emailResult.error);
                            console.log("======================================");
                        }
                    }
                }
            } catch (err) {
                console.error("======================================");
                console.error("❌ EMAIL EXCEPTION");
                console.error(err);
                console.error("======================================");
            }
        }, 100);

        // ✅ Send response IMMEDIATELY
        res.json({
            success: true,
            message: 'Registration successful!',
            data: {
                registration_code: registrationCode,
                password: password,
                team_name: team_name,
                teacher_guide: teacher_guide,
                students: students,
                qr_code: qrCodeDataUrl
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
});

// ==================== STUDENT LOGIN ====================
router.post('/login/student', [
    body('registration_code').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const { registration_code, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM groups WHERE registration_code = $1',
            [registration_code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid registration code or password'
            });
        }

        const group = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, group.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid registration code or password'
            });
        }

        const token = jwt.sign(
            { 
                id: group.id, 
                registration_code: group.registration_code,
                role: 'student',
                grade: group.grade 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        delete group.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    ...group,
                    role: 'student'
                }
            }
        });

    } catch (error) {
        console.error('Student Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

// ==================== TEACHER LOGIN ====================
router.post('/login/teacher', [
    body('username').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        console.log('👨‍🏫 Teacher login attempt:', req.body.username);

        const { username, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND role = $2',
            [username.toLowerCase(), 'teacher']
        );

        console.log('🔍 Teacher found:', result.rows.length > 0);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const teacher = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, teacher.password);

        console.log('🔐 Password valid:', isValidPassword);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { 
                id: teacher.id, 
                username: teacher.username,
                role: 'teacher',
                full_name: teacher.full_name,
                teacher_name: teacher.teacher_name
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: teacher.id,
                    username: teacher.username,
                    full_name: teacher.full_name,
                    teacher_name: teacher.teacher_name,
                    role: 'teacher'
                }
            }
        });

    } catch (error) {
        console.error('Teacher Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

// ==================== ADMIN LOGIN ====================
router.post('/login/admin', [
    body('username').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        console.log('🔧 Admin login attempt:', req.body.username);

        const { username, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND role = $2',
            [username.toLowerCase(), 'admin']
        );

        console.log('🔍 Admin found:', result.rows.length > 0);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const admin = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, admin.password);

        console.log('🔐 Password valid:', isValidPassword);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username,
                role: 'admin',
                full_name: admin.full_name
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                token,
                user: {
                    id: admin.id,
                    username: admin.username,
                    full_name: admin.full_name,
                    role: 'admin'
                }
            }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

// ✅ RESET ADMIN PASSWORD
router.post('/reset-admin-password', async (req, res) => {
    try {
        const { secretKey, newPassword } = req.body;
        const SECRET_KEY = 'PODAR_RESET_2026';
        
        if (secretKey !== SECRET_KEY) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid secret key' 
            });
        }
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE role = $2 RETURNING username, role',
            [hashedPassword, 'admin']
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Admin user not found!' 
            });
        }
        
        console.log('✅ Admin password updated successfully!');
        
        res.json({ 
            success: true, 
            message: 'Password updated successfully!',
            username: result.rows[0].username,
            role: result.rows[0].role
        });
        
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reset password: ' + error.message 
        });
    }
});

// ==================== VERIFY STUDENT ====================
router.post('/verify-student', [
    body('registration_code').notEmpty(),
    body('parent_email').isEmail()
], async (req, res) => {
    try {
        const { registration_code, parent_email } = req.body;

        console.log('🔍 Verification attempt:');
        console.log('   Code:', registration_code);
        console.log('   Email:', parent_email);

        const result = await pool.query(
            'SELECT id, students_data FROM groups WHERE registration_code = $1',
            [registration_code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            console.log('❌ Registration code not found:', registration_code);
            return res.status(404).json({
                success: false,
                message: 'Registration code not found'
            });
        }

        const group = result.rows[0];
        
        // ✅ FIX: students_data is already an object, don't parse it!
        let students = group.students_data;
        if (typeof students === 'string') {
            students = JSON.parse(students);
        }
        if (!students || !Array.isArray(students)) {
            students = [];
        }

        console.log('👥 Students in group:', students.length);
        console.log('📧 Emails in group:', students.map(s => s.parent_email));

        const emailMatch = students.some(s => 
            s.parent_email && s.parent_email.toLowerCase() === parent_email.toLowerCase()
        );

        if (!emailMatch) {
            console.log('❌ Email not found in this group:', parent_email);
            return res.status(403).json({
                success: false,
                message: 'Parent email does not match this registration'
            });
        }

        console.log('✅ Verification successful!');
        res.json({
            success: true,
            message: 'Verification successful'
        });

    } catch (error) {
        console.error('❌ Verify Student Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify student: ' + error.message
        });
    }
});

// ==================== RESET PASSWORD ====================
router.post('/reset-password', [
    body('registration_code').notEmpty(),
    body('parent_email').isEmail(),
    body('new_password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { registration_code, parent_email, new_password } = req.body;

        console.log('🔑 Password reset attempt:');
        console.log('   Code:', registration_code);
        console.log('   Email:', parent_email);

        // Find the group
        const result = await pool.query(
            'SELECT id, students_data FROM groups WHERE registration_code = $1',
            [registration_code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration code not found'
            });
        }

        const group = result.rows[0];
        
        // ✅ FIX: students_data is already an object
        let students = group.students_data;
        if (typeof students === 'string') {
            students = JSON.parse(students);
        }
        if (!students || !Array.isArray(students)) {
            students = [];
        }

        // Check if parent email matches any student
        const emailMatch = students.some(s => 
            s.parent_email && s.parent_email.toLowerCase() === parent_email.toLowerCase()
        );

        if (!emailMatch) {
            return res.status(403).json({
                success: false,
                message: 'Parent email does not match this registration'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await pool.query(
            'UPDATE groups SET password = $1 WHERE id = $2',
            [hashedPassword, group.id]
        );

        console.log(`✅ Password reset for: ${registration_code}`);

        res.json({
            success: true,
            message: 'Password reset successfully! Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password: ' + error.message
        });
    }
});

// ==================== REGISTRATION STATUS ====================
router.get('/registration-status', async (req, res) => {
    try {
        const locked = await isRegistrationLocked();
        const lockDateTime = await getSetting('registration_lock_datetime');
        
        res.json({
            success: true,
            data: {
                locked: locked,
                lock_datetime: lockDateTime || '2026-07-29 20:00:00',
                message: locked 
                    ? 'Registrations are now closed. Thank you for participating!'
                    : 'Registrations are open!'
            }
        });
    } catch (error) {
        console.error('Registration Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get registration status'
        });
    }
});

module.exports = router; // ← Make sure this is at the end
