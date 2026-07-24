// backend/fix-qr-codes.js

require('dotenv').config();
const { pool } = require('./src/config/database');
const QRCode = require('qrcode');

async function fixQRCodes() {
    try {
        console.log('🔍 Finding groups with no QR code...\n');

        // Get all groups with no QR code
        const result = await pool.query(
            `SELECT id, registration_code 
             FROM groups 
             WHERE qr_code IS NULL OR qr_code = ''`
        );

        console.log(`📊 Found ${result.rows.length} groups without QR codes\n`);

        if (result.rows.length === 0) {
            console.log('✅ All groups already have QR codes!');
            process.exit(0);
        }

        let success = 0;
        let failed = 0;

        for (const group of result.rows) {
            try {
                const frontendUrl = process.env.APP_URL || 'https://science-fair-app.vercel.app';
                const qrData = `${frontendUrl}/project/${group.registration_code}`;
                const qrCodeDataUrl = await QRCode.toDataURL(qrData);

                await pool.query(
                    'UPDATE groups SET qr_code = $1 WHERE id = $2',
                    [qrCodeDataUrl, group.id]
                );

                console.log(`✅ QR Code generated for: ${group.registration_code}`);
                success++;
            } catch (err) {
                console.error(`❌ Failed for ${group.registration_code}:`, err.message);
                failed++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Success: ${success}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📝 Total: ${result.rows.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
}

fixQRCodes();