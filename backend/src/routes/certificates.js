// backend/src/routes/certificates.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('fontkit');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Certificate Template URL (Replace with your uploaded template URL)
const TEMPLATE_URL = process.env.CERTIFICATE_TEMPLATE_URL || 'https://res.cloudinary.com/zr8wz6c7/image/upload/v1785430786/WhatsApp_Image_2026-07-30_at_12.31.27_PM_memtfi.jpg';

// Check if certificates are available
function areCertificatesAvailable() {
    const fairDate = process.env.FAIR_DATE || '2026-08-01';
    const fairEndDate = new Date(fairDate);
    fairEndDate.setHours(16, 0, 0, 0); // 4:00 PM on fair day
    
    const currentDate = new Date();
    return currentDate >= fairEndDate;
}

// Generate single certificate page
async function generateCertificatePage(student, group, font) {
    const pageWidth = 1200;
    const pageHeight = 848;
    
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Download template image
    const imageResponse = await fetch(TEMPLATE_URL);
    const imageBytes = await imageResponse.arrayBuffer();
    const image = await pdfDoc.embedJpg(imageBytes);
    
    // Draw template image as background
    page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
    });
    
    // ✅ Student Name (adjust coordinates based on your template)
    const studentName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim() || '_________________';
    page.drawText(studentName, {
        x: 400,
        y: 430,
        size: 34,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
    });
    
    // ✅ Grade (adjust coordinates based on your template)
    const gradeText = `${group.grade} - ${group.division}`;
    page.drawText(gradeText, {
        x: 550,
        y: 370,
        size: 28,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
    });
    
    return await pdfDoc.save();
}

// ==================== GENERATE CERTIFICATE ====================
router.get('/generate/:registration_code', authenticate, async (req, res) => {
    try {
        const { registration_code } = req.params;
        console.log('📄 Generating certificate for:', registration_code);
        
        // ✅ Check if certificates are available
        if (!areCertificatesAvailable()) {
            const fairDate = process.env.FAIR_DATE || '2026-08-01';
            return res.status(403).json({
                success: false,
                message: `🎯 Certificates will be available after the Science Fair concludes on ${fairDate}. Please check back after 4:00 PM.`
            });
        }
        
        // Get group data
        const groupResult = await pool.query(
            `SELECT g.id, g.registration_code, g.grade, g.division, 
                    g.team_name, g.students_data, g.certificate_url
             FROM groups g
             WHERE g.registration_code = $1`,
            [registration_code.toUpperCase()]
        );
        
        if (groupResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }
        
        const group = groupResult.rows[0];
        
        // Parse students
        let students = group.students_data;
        if (typeof students === 'string') {
            students = JSON.parse(students);
        }
        if (!Array.isArray(students)) {
            students = [];
        }
        
        if (students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No students found in this group'
            });
        }
        
        // Load font
        const fontPath = path.join(__dirname, '../../fonts/times.ttf');
        let font;
        try {
            const fontBytes = fs.readFileSync(fontPath);
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);
            font = await pdfDoc.embedFont(fontBytes);
        } catch (error) {
            // Fallback to built-in font
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);
            font = await pdfDoc.embedFont(PDFDocument.StandardFonts.TimesRoman);
        }
        
        // ✅ Generate one PDF per student
        const allPdfPages = [];
        for (const student of students) {
            const pdfBytes = await generateCertificatePage(student, group, font);
            allPdfPages.push(pdfBytes);
        }
        
        // ✅ Merge all PDFs into one file
        let finalPdf;
        if (allPdfPages.length === 1) {
            finalPdf = allPdfPages[0];
        } else {
            const mergedPdf = await PDFDocument.create();
            for (const pdfBytes of allPdfPages) {
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            finalPdf = await mergedPdf.save();
        }
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    public_id: `certificates/${registration_code}`,
                    folder: 'certificates',
                    use_filename: true
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(finalPdf);
        });
        
        // Save URL to database
        await pool.query(
            `UPDATE groups SET certificate_url = $1 WHERE registration_code = $2`,
            [uploadResult.secure_url, registration_code.toUpperCase()]
        );
        
        console.log(`✅ Certificate generated for: ${registration_code} (${students.length} students, ${students.length} pages)`);
        
        res.json({
            success: true,
            message: `Certificate generated successfully for ${students.length} student(s)! 🎉`,
            data: {
                certificate_url: uploadResult.secure_url,
                student_count: students.length,
                pages: students.length
            }
        });
        
    } catch (error) {
        console.error('Certificate Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate: ' + error.message
        });
    }
});

// ==================== CHECK CERTIFICATE STATUS ====================
router.get('/check/:registration_code', authenticate, async (req, res) => {
    try {
        const { registration_code } = req.params;
        
        const result = await pool.query(
            `SELECT certificate_url FROM groups WHERE registration_code = $1`,
            [registration_code.toUpperCase()]
        );
        
        res.json({
            success: true,
            available: result.rows[0]?.certificate_url ? true : false,
            url: result.rows[0]?.certificate_url || null
        });
        
    } catch (error) {
        console.error('Check Certificate Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check certificate'
        });
    }
});

// ==================== GET CERTIFICATE AVAILABILITY STATUS ====================
router.get('/status', async (req, res) => {
    try {
        const available = areCertificatesAvailable();
        const fairDate = process.env.FAIR_DATE || '2026-08-01';
        
        res.json({
            success: true,
            data: {
                available: available,
                fairDate: fairDate,
                message: available 
                    ? '🎉 Certificates are now available for download!' 
                    : `📌 Certificates will be available after the Science Fair concludes on ${fairDate}.`
            }
        });
    } catch (error) {
        console.error('Certificate Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get certificate status'
        });
    }
});

module.exports = router;