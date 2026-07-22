const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('fontkit');

// Load font (download a font file or use system font)
async function generateCertificate(studentName, teamName, projectTitle, grade, division, registrationCode) {
    try {
        // Create a new PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]); // Landscape: 800 x 600
        
        // Get the page dimensions
        const { width, height } = page.getSize();
        
        // Draw border
        page.drawRectangle({
            x: 40,
            y: 40,
            width: width - 80,
            height: height - 80,
            borderColor: rgb(0.2, 0.4, 0.6),
            borderWidth: 5,
        });
        
        // Draw inner border
        page.drawRectangle({
            x: 50,
            y: 50,
            width: width - 100,
            height: height - 100,
            borderColor: rgb(0.5, 0.7, 0.9),
            borderWidth: 2,
        });
        
        // Certificate Title
        page.drawText('🏆 Certificate of Participation', {
            x: 120,
            y: height - 100,
            size: 28,
            font: await getFont(),
            color: rgb(0.1, 0.2, 0.4),
        });
        
        // Subtitle
        page.drawText('Spark 4.0 Science Fair 2026-27', {
            x: 180,
            y: height - 140,
            size: 18,
            color: rgb(0.3, 0.4, 0.6),
        });
        
        // Body Text
        page.drawText('This certificate is proudly presented to', {
            x: 180,
            y: height - 200,
            size: 14,
            color: rgb(0.2, 0.2, 0.2),
        });
        
        // Student Name (Bold & Large)
        page.drawText(`${studentName}`, {
            x: 200,
            y: height - 250,
            size: 34,
            font: await getBoldFont(),
            color: rgb(0.1, 0.2, 0.5),
        });
        
        // Team Details
        page.drawText(`Team: ${teamName}`, {
            x: 160,
            y: height - 300,
            size: 16,
            color: rgb(0.2, 0.2, 0.3),
        });
        
        page.drawText(`Project: ${projectTitle}`, {
            x: 160,
            y: height - 330,
            size: 16,
            color: rgb(0.2, 0.2, 0.3),
        });
        
        page.drawText(`Grade: ${grade} - ${division}`, {
            x: 160,
            y: height - 360,
            size: 16,
            color: rgb(0.2, 0.2, 0.3),
        });
        
        // Registration Code
        page.drawText(`Registration Code: ${registrationCode}`, {
            x: 160,
            y: height - 400,
            size: 12,
            color: rgb(0.4, 0.4, 0.5),
        });
        
        // Footer
        page.drawText('Podar International School, Latur', {
            x: 200,
            y: 80,
            size: 14,
            color: rgb(0.3, 0.3, 0.4),
        });
        
        page.drawText('Khadgoan Ring Road', {
            x: 230,
            y: 60,
            size: 12,
            color: rgb(0.3, 0.3, 0.4),
        });
        
        // Generate PDF bytes
        const pdfBytes = await pdfDoc.save();
        
        // Save to file or return as buffer
        return pdfBytes;
        
    } catch (error) {
        console.error('Certificate Generation Error:', error);
        throw error;
    }
}

// Helper functions for fonts
async function getFont() {
    // Use built-in font or download a free one
    return null; // Will use default font
}

async function getBoldFont() {
    return null; // Will use default bold font
}

module.exports = { generateCertificate };