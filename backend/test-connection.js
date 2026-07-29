// backend/test-connection.js

require('dotenv').config();
const { pool } = require('./src/config/database');

async function test() {
    try {
        console.log('🔍 Testing database connection...');
        console.log('📡 Using DATABASE_URL from .env');
        
        const result = await pool.query('SELECT NOW() as time');
        console.log('✅ Connected! Time:', result.rows[0].time);
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('💡 Make sure DATABASE_URL is correct in .env');
        process.exit(1);
    }
}

test();