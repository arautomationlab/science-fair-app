// backend/add-criteria-column.js

require('dotenv').config();
const { Pool } = require('pg');

// Get connection string from .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

console.log('🔍 Using DATABASE_URL from .env');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addColumn() {
    try {
        console.log('🔍 Adding criteria_scores column to judge_scores table...');
        
        // Test connection first
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        
        // Add the column
        await pool.query(`
            ALTER TABLE judge_scores 
            ADD COLUMN IF NOT EXISTS criteria_scores JSONB
        `);
        
        console.log('✅ criteria_scores column added successfully!');
        
        // Verify the column
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'judge_scores'
        `);
        
        console.log('📊 Columns in judge_scores:', result.rows.map(r => r.column_name).join(', '));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

addColumn();