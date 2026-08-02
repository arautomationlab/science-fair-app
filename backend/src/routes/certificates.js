// backend/src/routes/certificates.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('fontkit');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

router.get('/version', (req, res) => {
    res.json({
        version: "CERTIFICATE VERSION 14 - ITALIANNO FONT",
        time: new Date(),
        message: "Direct PDF download with Italianno calligraphy font"
    });
});

console.log('✅ LOADING CERTIFICATES.JS - VERSION 14 (ITALIANNO FONT)');

// Certificate Template URL
const TEMPLATE_URL = process.env.CERTIFICATE_TEMPLATE_URL || 'https://res.cloudinary.com/zr8wz6c7/image/upload/v1785430786/WhatsApp_Image_2026-07-30_at_12.31.27_PM_memtfi.jpg';

// Check if certificates are available
function areCertificatesAvailable() {
    const fairDate = process.env.FAIR_DATE || '2026-08-01';
    const fairEndDate = new Date(fairDate);
    fairEndDate.setHours(16, 0, 0, 0);
    const currentDate = new Date();
    return currentDate >= fairEndDate;
}

// Generate single certificate page
async function generateCertificatePage(student, group) {
    const pageWidth = 1200;
    const pageHeight = 848;
    
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Download template image using axios
    const imageResponse = await axios.get(TEMPLATE_URL, { responseType: 'arraybuffer' });
    const imageBytes = imageResponse.data;
    const image = await pdfDoc.embedJpg(imageBytes);
    
    // Draw template image as background
    page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
    });
    
    // ✅ Load Italianno Calligraphy Font
    const fontPath = path.join(__dirname, '../../fonts/Italianno-Regular');
    let calligraphyFont;
    try {
        const fontBytes = fs.readFileSync(fontPath);
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        calligraphyFont = await pdfDoc.embedFont(fontBytes);
        console.log('✅ Italianno font loaded successfully!');
    } catch (error) {
        console.log('⚠️ Italianno font not found, using fallback');
        // Fallback to Helvetica Bold
        calligraphyFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }
    
    // ✅ Student Name - ITALIANNO + PURPLE (SAME POSITIONS)
    const studentName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim() || '_________________';
    console.log('📝 Student Name:', studentName);
    
    page.drawText(studentName, {
        x: 550,   // ✅ SAME POSITION
        y: 500,   // ✅ SAME POSITION
        size: 38, // ✅ original font size

        font: calligraphyFont,
        color: rgb(0.6, 0.1, 0.9),
    });
    
    // ✅ Grade - ITALIANNO + PURPLE (SAME POSITIONS)
    const gradeText = `${group.grade} - ${group.division}`;
    page.drawText(gradeText, {
        x: 280,   // ✅ SAME POSITION
        y: 450,   // ✅ SAME POSITION
        size: 36, // ✅ Slightly larger for calligraphy font
        font: calligraphyFont,
        color: rgb(0.6, 0.1, 0.9),
    });
    
    console.log('✅ Certificate page generated with Italianno font');
    
    return await pdfDoc.save();
}

// ==================== GENERATE CERTIFICATE ====================
router.get('/generate/:registration_code', authenticate, async (req, res) => {
    try {
        const { registration_code } = req.params;
        console.log('📄 Generating certificate for:', registration_code);
        
        if (!areCertificatesAvailable()) {
            const fairDate = process.env.FAIR_DATE || '2026-08-01';
            return res.status(403).json({
                success: false,
                message: `🎯 Certificates will be available after the Science Fair concludes on ${fairDate}.`
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
        
        // Generate one PDF per student
        const allPdfPages = [];
        for (const student of students) {
            const pdfBytes = await generateCertificatePage(student, group);
            allPdfPages.push(pdfBytes);
        }
        
        // Merge all PDFs into one file
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
        
        // ✅ DIRECT DOWNLOAD - No Cloudinary
        const pdfBuffer = Buffer.from(finalPdf);
        
        // Save URL to database (local reference)
        const pdfUrl = `/api/certificates/download/${registration_code}`;
        await pool.query(
            `UPDATE groups SET certificate_url = $1 WHERE registration_code = $2`,
            [pdfUrl, registration_code.toUpperCase()]
        );
        
        console.log(`✅ Certificate generated for: ${registration_code} (${students.length} students)`);
        console.log(`📎 Download URL: ${pdfUrl}`);
        
        // ✅ Return the PDF directly
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${registration_code}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Certificate Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate: ' + error.message
        });
    }
});

// ==================== DOWNLOAD CERTIFICATE ====================
router.get('/download/:registration_code', authenticate, async (req, res) => {
    try {
        const { registration_code } = req.params;
        console.log('📥 Downloading certificate for:', registration_code);
        
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
        
        // Generate one PDF per student
        const allPdfPages = [];
        for (const student of students) {
            const pdfBytes = await generateCertificatePage(student, group);
            allPdfPages.push(pdfBytes);
        }
        
        // Merge all PDFs into one file
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
        
        const pdfBuffer = Buffer.from(finalPdf);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${registration_code}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download certificate: ' + error.message
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