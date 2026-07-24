const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🚀 Starting migration to PostgreSQL...');

    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                full_name VARCHAR(100),
                role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
                teacher_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create groups table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS groups (
                id SERIAL PRIMARY KEY,
                registration_code VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                grade INTEGER NOT NULL,
                division VARCHAR(2) NOT NULL,
                teacher_guide VARCHAR(100),
                teacher_id INTEGER REFERENCES users(id),
                team_name VARCHAR(255) NOT NULL,
                project_title VARCHAR(255) NOT NULL,
                abstract TEXT,
                participants INTEGER DEFAULT 1,
                students_data JSONB DEFAULT '[]',
                project_submitted BOOLEAN DEFAULT FALSE,
                submitted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Groups table created');

        // Create project_details table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_details (
                id SERIAL PRIMARY KEY,
                group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
                aim TEXT,
                materials TEXT,
                procedure TEXT,
                conclusion TEXT,
                abstract TEXT,
                video_link VARCHAR(255),
                images JSONB DEFAULT '[]',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Project details table created');

        // Create judge_scores table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS judge_scores (
                id SERIAL PRIMARY KEY,
                group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
                judge_name VARCHAR(50) NOT NULL,
                score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
                comments TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Judge scores table created');

        // Create parent_ratings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS parent_ratings (
                id SERIAL PRIMARY KEY,
                group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
                stars INTEGER CHECK (stars >= 1 AND stars <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Parent ratings table created');

        // Create indexes
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_groups_grade ON groups(grade)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(registration_code)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_scores_group ON judge_scores(group_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_group ON parent_ratings(group_id)`);
        console.log('✅ Indexes created');

        // Insert admin
        const hashPassword = async (password) => {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        };

        const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'admin'");
        if (adminCheck.rows.length === 0) {
            const adminPassword = await hashPassword('Laturkhadgaon@pis');
            await pool.query(
                "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
                ['admin', adminPassword, 'Administrator', 'admin']
            );
            console.log('✅ Admin user created');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Insert teachers
        const teachers = [
            'Chauhan Sushma', 'Dharne Rekha', 'Chamedia Aarti', 'Nazneen Pathan',
            'Pankaja Sherkhane', 'Sandya S.R.', 'Bidarkar Neelam', 'Balaji Hude',
            'Patil Smita', 'Udgire Swati', 'Gupta Premlata', 'Shaikh Naaz',
            'Gaikwad Satish', 'Kadam Sachin', 'Gore Sharad', 'Raut Monali',
            'Kondekar Surekha', 'Tapade Madhuri', 'Ingle Ravindra', 
            'Inamdar Mastura', 'Patil Sujata'
        ];

        let teacherCount = 0;
        for (const teacher of teachers) {
            const username = teacher.toLowerCase().replace(/\./g, '').replace(/\s/g, '.');
            const check = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
            if (check.rows.length === 0) {
                const hashedPassword = await hashPassword('teacher123');
                await pool.query(
                    "INSERT INTO users (username, password, full_name, role, teacher_name) VALUES ($1, $2, $3, $4, $5)",
                    [username, hashedPassword, teacher, 'teacher', teacher]
                );
                teacherCount++;
            }
        }
        console.log(`✅ ${teacherCount} teachers created`);

        console.log('\n🎉 Migration complete!');
        console.log('========================================');
        console.log('👤 Admin Login:');
        console.log('   Username: admin');
        console.log('   Password: Laturkhadgaon@pis');
        console.log('========================================');
        console.log('👨‍🏫 Teacher Login:');
        console.log('   Username: <teacher username>');
        console.log('   Password: teacher123');
        console.log('========================================');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        pool.end();
    }
}

migrate();