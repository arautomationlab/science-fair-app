const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const QRCode = require('qrcode');
const emailService = require('../services/emailService');

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
    body('students').isArray()
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
            participants, students
        } = req.body;

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

        const groupId = result.rows[0].id;

        // ✅ Generate QR Code with FULL URL
        const frontendUrl = process.env.APP_URL || 'https://science-fair-app.vercel.app';
        const qrData = `${frontendUrl}/project/${registrationCode}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        console.log(`✅ Registration successful! Code: ${registrationCode}`);
        console.log(`📱 QR Code URL: ${qrData}`);

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

// Send email confirmation
try {
    const emailService = require('../services/emailService');
    const student = students[0];
    const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
    
    if (student.parent_email) {
        await emailService.sendRegistrationEmail(
            student.parent_email,
            studentName,
            student.parent_name,
            registrationCode,
            password,
            team_name,
            project_title,
            grade,
            division
        );
        console.log('✅ Email sent to:', student.parent_email);
    }
} catch (emailError) {
    console.error('Email Error:', emailError);
    // Don't fail registration if email fails
}


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

module.exports = router;