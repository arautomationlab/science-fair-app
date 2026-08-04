const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const QRCode = require('qrcode');

// ✅ PUBLIC PROJECT VIEW - HIDE JUDGE SCORES
router.get('/public/:code', async (req, res) => {
    // ... existing code ...
});

// ✅ GET ALL SUBMITTED PROJECTS - MUST COME BEFORE /:code
router.get('/all-submitted', async (req, res) => {
    try {
        const { grade, division, teacher } = req.query;
        
        let query = `
            SELECT 
                g.registration_code,
                g.team_name,
                g.project_title,
                g.grade,
                g.division,
                g.teacher_guide,
                g.project_submitted,
                (SELECT ROUND(AVG(stars)::numeric, 1) FROM parent_ratings WHERE group_id = g.id) as average_rating,
                (SELECT COUNT(*) FROM parent_ratings WHERE group_id = g.id) as total_ratings
            FROM groups g
            WHERE g.project_submitted = true
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (grade) {
            query += ` AND g.grade = $${paramIndex}`;
            params.push(parseInt(grade));
            paramIndex++;
        }
        
        if (division) {
            query += ` AND g.division ILIKE $${paramIndex}`;
            params.push(division);
            paramIndex++;
        }
        
        if (teacher) {
            query += ` AND g.teacher_guide ILIKE $${paramIndex}`;
            params.push(`%${teacher}%`);
            paramIndex++;
        }
        
        query += ` ORDER BY g.grade, g.division, g.team_name`;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Get All Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects: ' + error.message
        });
    }
});

// ✅ GET Project by Code - COMES AFTER specific routes
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        console.log('📥 GET project request for code:', code);

        const result = await pool.query(
            `SELECT g.*, pd.* 
            FROM groups g
            LEFT JOIN project_details pd ON g.id = pd.group_id
            WHERE g.registration_code ILIKE $1`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        delete result.rows[0].password;

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
});

// ✅ Submit Project
router.post('/submit', authenticate, upload.array('images', 5), async (req, res) => {
    try {
        console.log('📥 Project submission received');
        console.log('📦 Body:', req.body);
        console.log('🖼️ Files:', req.files);

        const { 
            registration_code, aim, materials, procedure, conclusion, 
            abstract, video_link 
        } = req.body;

        console.log('🔑 Registration code from frontend:', registration_code);

        // ✅ Find group - case insensitive using ILIKE
        let groupId = null;
        let groupData = null;
        
        if (registration_code) {
            const groupResult = await pool.query(
                'SELECT id, registration_code, team_name FROM groups WHERE registration_code ILIKE $1',
                [registration_code]
            );
            if (groupResult.rows.length > 0) {
                groupId = groupResult.rows[0].id;
                groupData = groupResult.rows[0];
                console.log('✅ Group found:', groupData.registration_code);
            } else {
                console.log('❌ No group found with code:', registration_code);
            }
        }

        if (!groupId) {
            console.log('❌ Group not found');
            return res.status(404).json({
                success: false,
                message: 'Group not found. Please ensure you are logged in correctly.'
            });
        }

        // Get image URLs from Cloudinary
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        // Check if project already exists
        const existing = await pool.query(
            'SELECT * FROM project_details WHERE group_id = $1',
            [groupId]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing
            result = await pool.query(
                `UPDATE project_details 
                SET aim = $1, materials = $2, procedure = $3, conclusion = $4,
                    abstract = $5, video_link = $6, images = $7, updated_at = NOW()
                WHERE group_id = $8
                RETURNING *`,
                [aim, materials, procedure, conclusion, abstract || '', video_link || '', JSON.stringify(imageUrls), groupId]
            );
            console.log('✅ Project updated for group:', groupId);
        } else {
            // Insert new
            result = await pool.query(
                `INSERT INTO project_details 
                (group_id, aim, materials, procedure, conclusion, abstract, video_link, images)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [groupId, aim, materials, procedure, conclusion, abstract || '', video_link || '', JSON.stringify(imageUrls)]
            );
            console.log('✅ New project created for group:', groupId);
        }

        // Update group submission status
        await pool.query(
            'UPDATE groups SET project_submitted = TRUE, submitted_at = NOW() WHERE id = $1',
            [groupId]
        );

        // ✅ GENERATE QR CODE AFTER SUBMISSION
        const frontendUrl = process.env.APP_URL || 'https://science-fair-app.vercel.app';
        const qrData = `${frontendUrl}/project/${registration_code}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        // ✅ SAVE QR CODE TO DATABASE
        await pool.query(
            'UPDATE groups SET qr_code = $1 WHERE id = $2',
            [qrCodeDataUrl, groupId]
        );

        console.log(`✅ QR Code generated for: ${registration_code}`);

        res.json({
            success: true,
            message: 'Project submitted successfully! 🎉',
            data: {
                ...result.rows[0],
                qr_code: qrCodeDataUrl
            },
            images: imageUrls
        });

    } catch (error) {
        console.error('Project Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit project: ' + error.message
        });
    }
});

// ==================== GET ALL SUBMITTED PROJECTS (PUBLIC INFO ONLY) ====================
router.get('/all-submitted', async (req, res) => {
    try {
        const { grade, division, teacher } = req.query;
        
        let query = `
            SELECT 
                g.registration_code,
                g.team_name,
                g.project_title,
                g.grade,
                g.division,
                g.teacher_guide,
                g.project_submitted,
                (SELECT ROUND(AVG(stars)::numeric, 1) FROM parent_ratings WHERE group_id = g.id) as average_rating,
                (SELECT COUNT(*) FROM parent_ratings WHERE group_id = g.id) as total_ratings
            FROM groups g
            WHERE g.project_submitted = true
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (grade) {
            query += ` AND g.grade = $${paramIndex}`;
            params.push(parseInt(grade));
            paramIndex++;
        }
        
        if (division) {
            query += ` AND g.division ILIKE $${paramIndex}`;
            params.push(division);
            paramIndex++;
        }
        
        if (teacher) {
            query += ` AND g.teacher_guide ILIKE $${paramIndex}`;
            params.push(`%${teacher}%`);
            paramIndex++;
        }
        
        query += ` ORDER BY g.grade, g.division, g.team_name`;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Get All Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects: ' + error.message
        });
    }
});

module.exports = router;