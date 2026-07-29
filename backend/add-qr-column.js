// backend/add-qr-column.js

require('dotenv').config();
const { pool } = require('./src/config/database');

async function addQRCodeColumn() {
    try {
        console.log('🔍 Adding qr_code column to groups table...\n');

        // Check if column already exists
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'groups' AND column_name = 'qr_code'
        `);

        if (checkResult.rows.length > 0) {
            console.log('✅ qr_code column already exists!');
            process.exit(0);
        }

        // Add the column
        await pool.query(`
            ALTER TABLE groups 
            ADD COLUMN qr_code TEXT
        `);

        console.log('✅ qr_code column added successfully!');

        // Also add plain_password column if it doesn't exist
        const checkPassword = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'groups' AND column_name = 'plain_password'
        `);

        if (checkPassword.rows.length === 0) {
            await pool.query(`
                ALTER TABLE groups 
                ADD COLUMN plain_password VARCHAR(255)
            `);
            console.log('✅ plain_password column added successfully!');
        }

        console.log('\n🎉 Database migration completed!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

addQRCodeColumn();