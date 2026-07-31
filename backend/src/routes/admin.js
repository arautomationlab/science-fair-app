const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

// ==================== ADMIN DASHBOARD ====================
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        console.log('📊 Admin dashboard requested');

        const result = await pool.query(`
            SELECT 
                g.id,
                g.registration_code,
                g.team_name,
                g.project_title,
                g.grade,
                g.division,
                g.teacher_guide,
                g.students_data,
                g.project_submitted,
                g.created_at,
                g.qr_code,
                g.password,
                (
                    SELECT COUNT(*) 
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as judge_count,
                (
                    SELECT ROUND(AVG(js.score)::numeric, 1)
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as average_score,
                (
                    SELECT json_agg(
                        json_build_object(
                            'judge_name', js.judge_name,
                            'score', js.score,
                            'criteria_scores', js.criteria_scores,
                            'created_at', js.created_at
                        )
                    ) 
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as judge_scores,
                (
                    SELECT COUNT(*) 
                    FROM parent_ratings pr 
                    WHERE pr.group_id = g.id
                ) as rating_count,
                (
                    SELECT ROUND(AVG(pr.stars)::numeric, 1)
                    FROM parent_ratings pr 
                    WHERE pr.group_id = g.id
                ) as parent_rating
            FROM groups g
            ORDER BY g.created_at DESC
        `);

        console.log(`✅ Found ${result.rows.length} projects`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load admin dashboard: ' + error.message
        });
    }
});

// Get All Projects (Admin)
router.get('/all-projects', authenticateAdmin, async (req, res) => {
    try {
        console.log('📊 Admin fetching all projects');

        const result = await pool.query(
            `SELECT 
                g.*,
                pd.aim, pd.materials, pd.procedure, pd.conclusion,
                pd.abstract as project_abstract, pd.images, pd.video_link,
                pd.submitted_at as project_submitted_at,
                (
                    SELECT COALESCE(
                        json_agg(
                            json_build_object(
                                'judge_name', js.judge_name,
                                'score', js.score,
                                'criteria_scores', js.criteria_scores,
                                'created_at', js.created_at
                            )
                            ORDER BY js.created_at
                        ),
                        '[]'::json
                    )
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as judge_scores,
                (
                    SELECT COUNT(*) 
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as judge_count,
                (
                    SELECT ROUND(AVG(js.score)::numeric, 1)
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as average_score,
                (
                    SELECT SUM(js.score) 
                    FROM judge_scores js 
                    WHERE js.group_id = g.id
                ) as total_score,
                (
                    SELECT AVG(stars) 
                    FROM parent_ratings 
                    WHERE group_id = g.id
                ) as parent_rating,
                (
                    SELECT COUNT(*) 
                    FROM parent_ratings 
                    WHERE group_id = g.id
                ) as rating_count,
                u.full_name as teacher_name
            FROM groups g
            LEFT JOIN project_details pd ON g.id = pd.group_id
            LEFT JOIN users u ON g.teacher_id = u.id
            ORDER BY g.grade, g.division`
        );

        console.log(`✅ Found ${result.rows.length} projects`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('All Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects: ' + error.message
        });
    }
});

// ==================== EXPORT ALL QR CODES ====================
router.get('/export-qr-codes', authenticateAdmin, async (req, res) => {
    try {
        console.log('📱 Exporting all QR codes...');
        
        // Get all groups with QR codes, ordered by grade
        const result = await pool.query(
            `SELECT 
                g.id,
                g.registration_code,
                g.team_name,
                g.grade,
                g.division,
                g.students_data,
                g.qr_code
             FROM groups g
             WHERE g.qr_code IS NOT NULL
             ORDER BY g.grade, g.division, g.team_name`
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No QR codes found'
            });
        }
        
        // Generate PDF with QR codes
        const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
        const cloudinary = require('cloudinary').v2;
        
        const pdfDoc = await PDFDocument.create();
        const pageWidth = 595; // A4 width in points
        const pageHeight = 842; // A4 height in points
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Load font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Box dimensions
        const boxWidth = 125;
        const boxHeight = 160;
        const qrSize = 80;
        const marginX = 25;
        const marginY = 30;
        const spacingX = 10;
        const spacingY = 15;
        const colsPerRow = 4;
        
        let col = 0;
        let row = 0;
        let currentGrade = null;
        let gradeY = pageHeight - 20;
        
        for (const group of result.rows) {
            // Check if we need a new page
            if (row > 0 && row % 6 === 0) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                col = 0;
                row = 0;
                currentGrade = null;
            }
            
            // Calculate position
            const x = marginX + col * (boxWidth + spacingX);
            const y = pageHeight - marginY - row * (boxHeight + spacingY) - boxHeight;
            
            // Draw box border
            page.drawRectangle({
                x: x,
                y: y,
                width: boxWidth,
                height: boxHeight,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 1,
            });
            
            // Parse students
            let students = group.students_data;
            if (typeof students === 'string') {
                students = JSON.parse(students);
            }
            if (!Array.isArray(students)) {
                students = [];
            }
            
            // Get student names
            const studentNames = students.map(s => 
                `${s.firstName || ''} ${s.lastName || ''}`.trim()
            ).filter(Boolean).join(', ') || group.team_name || 'Unknown';
            
            // Get QR code
            let qrDataUrl = group.qr_code;
            if (!qrDataUrl) {
                const QRCode = require('qrcode');
                qrDataUrl = await QRCode.toDataURL(
                    `${process.env.APP_URL || 'https://science-fair-app.vercel.app'}/project/${group.registration_code}`
                );
            }
            
            // Embed QR code image
            const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
            const qrImage = await pdfDoc.embedPng(qrImageBytes);
            
            // Draw QR code centered
            const qrX = x + (boxWidth - qrSize) / 2;
            const qrY = y + boxHeight - qrSize - 25;
            page.drawImage(qrImage, {
                x: qrX,
                y: qrY,
                width: qrSize,
                height: qrSize,
            });
            
            // Draw student name (truncate if too long)
            const displayName = studentNames.length > 18 ? studentNames.substring(0, 18) + '...' : studentNames;
            page.drawText(displayName, {
                x: x + 5,
                y: y + 30,
                size: 9,
                font: boldFont,
                color: rgb(0, 0, 0),
            });
            
            // Draw class info
            const classText = `Class: ${group.grade}${group.division ? '-' + group.division : ''}`;
            page.drawText(classText, {
                x: x + 5,
                y: y + 18,
                size: 8,
                font: font,
                color: rgb(0.3, 0.3, 0.3),
            });
            
            // Draw registration code
            const codeText = `Code: ${group.registration_code}`;
            page.drawText(codeText, {
                x: x + 5,
                y: y + 6,
                size: 7,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            });
            
            // Move to next position
            col++;
            if (col >= colsPerRow) {
                col = 0;
                row++;
            }
        }
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    public_id: `qr-codes/all-qr-codes-${Date.now()}`,
                    folder: 'qr-codes'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(pdfBytes);
        });
        
        res.json({
            success: true,
            message: `QR Codes exported for ${result.rows.length} projects`,
            data: {
                url: uploadResult.secure_url,
                total: result.rows.length
            }
        });
        
    } catch (error) {
        console.error('Export QR Codes Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export QR codes: ' + error.message
        });
    }
});

// Get All Teachers
router.get('/teachers', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, full_name, teacher_name, email FROM users WHERE role = $1 ORDER BY full_name',
            ['teacher']
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Teachers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers'
        });
    }
});

// Get Winners by Grade
router.get('/winners/:grade', authenticateAdmin, async (req, res) => {
    try {
        const { grade } = req.params;

        const result = await pool.query(
            `SELECT 
                g.id, g.registration_code, g.team_name, g.project_title,
                g.grade, g.division, g.students_data, g.teacher_guide,
                AVG(js.score) as average_score,
                COUNT(js.score) as total_judges,
                (SELECT AVG(stars) FROM parent_ratings WHERE group_id = g.id) as parent_rating
            FROM groups g
            JOIN judge_scores js ON g.id = js.group_id
            WHERE g.grade = $1
            GROUP BY g.id
            HAVING COUNT(js.score) >= 2
            ORDER BY average_score DESC
            LIMIT 3`,
            [grade]
        );

        res.json({
            success: true,
            grade: grade,
            winners: result.rows
        });

    } catch (error) {
        console.error('Winners Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch winners'
        });
    }
});

// ✅ DELETE: Delete Project (Admin only)
router.delete('/project/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Admin deleting project with ID:', id);

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            await client.query('DELETE FROM parent_ratings WHERE group_id = $1', [id]);
            await client.query('DELETE FROM judge_scores WHERE group_id = $1', [id]);
            await client.query('DELETE FROM project_details WHERE group_id = $1', [id]);

            const result = await client.query(
                'DELETE FROM groups WHERE id = $1 RETURNING registration_code, team_name, grade, division',
                [id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            await client.query('COMMIT');

            const deletedProject = result.rows[0];

            res.json({
                success: true,
                message: `Project "${deletedProject.team_name}" (Grade ${deletedProject.grade}-${deletedProject.division}) deleted successfully!`,
                data: deletedProject
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project: ' + error.message
        });
    }
});

module.exports = router;