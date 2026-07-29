// backend/check-qr.js

require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkQR() {
    try {
        console.log('🔍 Checking QR code for group...\n');

        const result = await pool.query(
            'SELECT registration_code, qr_code FROM groups WHERE registration_code = $1',
            ['SPARK4.0-5-MRZ5B3AC-KMEI']
        );

        if (result.rows.length === 0) {
            console.log('❌ Group not found');
            process.exit(0);
        }

        const group = result.rows[0];
        console.log('📝 Registration Code:', group.registration_code);
        console.log('📱 QR Code exists?', group.qr_code ? '✅ Yes' : '❌ No');
        
        if (group.qr_code) {
            console.log('📏 QR Code length:', group.qr_code.length, 'characters');
            console.log('📱 QR Code preview:', group.qr_code.substring(0, 100) + '...');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkQR();