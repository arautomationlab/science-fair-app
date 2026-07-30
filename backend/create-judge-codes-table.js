// backend/create-judge-codes-table.js

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createTable() {
    try {
        console.log('🚀 Creating judge_access_codes table...\n');

        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected\n');

        // 1. Create the table
        console.log('📝 Creating table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS judge_access_codes (
                id SERIAL PRIMARY KEY,
                access_code VARCHAR(10) UNIQUE NOT NULL,
                judge_name VARCHAR(100),
                assigned_by VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                used_count INTEGER DEFAULT 0,
                last_used_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP
            )
        `);
        console.log('✅ Table created\n');

        // 2. Insert 10 sample codes
        console.log('📝 Inserting sample codes...');
        await pool.query(`
            INSERT INTO judge_access_codes (access_code, judge_name, assigned_by) VALUES 
                ('4269', 'Judge 1', 'admin'),
                ('7318', 'Judge 2', 'admin'),
                ('5824', 'Judge 3', 'admin'),
                ('9367', 'Judge 4', 'admin'),
                ('1492', 'Judge 5', 'admin'),
                ('6753', 'Judge 6', 'admin'),
                ('8201', 'Judge 7', 'admin'),
                ('3546', 'Judge 8', 'admin'),
                ('9087', 'Judge 9', 'admin'),
                ('2375', 'Judge 10', 'admin')
            ON CONFLICT (access_code) DO NOTHING
        `);
        console.log('✅ Sample codes inserted\n');

        // 3. Verify
        const result = await pool.query('SELECT * FROM judge_access_codes');
        console.log('📊 Current Codes:');
        console.log('┌─────────┬─────────────┬──────────────┐');
        console.log('│ Code    │ Judge Name  │ Status       │');
        console.log('├─────────┼─────────────┼──────────────┤');
        result.rows.forEach(row => {
            console.log(`│ ${row.access_code.padEnd(7)} │ ${row.judge_name.padEnd(11)} │ ${row.is_active ? '✅ Active' : '❌ Inactive'} │`);
        });
        console.log('└─────────┴─────────────┴──────────────┘');

        console.log(`\n🎉 Table created with ${result.rows.length} codes!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTable();