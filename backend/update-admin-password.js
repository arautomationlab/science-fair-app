const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/database');
require('dotenv').config();

async function updateAdminPassword() {
    try {
        const newPassword = 'Laturkhadgaon@pis';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE role = $2 RETURNING username, role',
            [hashedPassword, 'admin']
        );

        if (result.rows.length > 0) {
            console.log('✅ Password updated successfully!');
            console.log('👤 Username:', result.rows[0].username);
            console.log('🔑 New Password:', newPassword);
        } else {
            console.log('❌ Admin user not found!');
        }

        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

updateAdminPassword();