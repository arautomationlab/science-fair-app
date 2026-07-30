// backend/add-settings-table.js

const { pool } = require('./src/config/database');

async function createTables() {
    try {
        console.log('🚀 Creating settings tables...\n');

        // 1. Create settings table
        console.log('📝 Creating settings table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Settings table created');

        // 2. Create teacher overrides table
        console.log('📝 Creating teacher_overrides table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teacher_overrides (
                id SERIAL PRIMARY KEY,
                teacher_username VARCHAR(100),
                registration_code VARCHAR(50),
                student_name VARCHAR(255),
                reason TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Teacher overrides table created');

        // 3. Insert default settings
        console.log('📝 Inserting default settings...');
        await pool.query(`
            INSERT INTO settings (key, value) VALUES 
                ('registration_locked', 'false'),
                ('registration_lock_datetime', '2026-07-30 20:00:00'),
                ('teacher_override_enabled', 'true'),
                ('teacher_override_used', '0')
            ON CONFLICT (key) DO NOTHING
        `);
        console.log('✅ Default settings inserted');

        // 4. Verify the settings
        const result = await pool.query('SELECT * FROM settings');
        console.log('\n📊 Current Settings:');
        result.rows.forEach(row => {
            console.log(`   ${row.key}: ${row.value}`);
        });

        console.log('\n🎉 Tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error Details:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
}

createTables();