const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

// Teachers list
const teachers = [
    'Chauhan Sushma', 'Dharne Rekha', 'Chamedia Aarti', 'Nazneen Pathan',
    'Pankaja Sherkhane', 'Sandya S.R.', 'Bidarkar Neelam', 'Balaji Hude',
    'Patil Smita', 'Udgire Swati', 'Gupta Premlata', 'Shaikh Naaz',
    'Gaikwad Satish', 'Kadam Sachin', 'Gore Sharad', 'Raut Monali',
    'Kondekar Surekha', 'Tapade Madhuri', 'Ingle Ravindra'
];

async function setupDatabase() {
    console.log('🔧 Setting up database...');
    
    // Read existing database or create new
    let db;
    if (fs.existsSync(DB_PATH)) {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        console.log('📁 Existing database found.');
    } else {
        db = {
            users: [],
            groups: [],
            projectDetails: [],
            judgeScores: [],
            parentRatings: [],
            nextId: 1
        };
        console.log('📁 Creating new database.');
    }

    // Hash password function
    const hashPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    };

    // Check if admin already exists
    const adminExists = db.users.some(u => u.username === 'admin');
    if (!adminExists) {
        console.log('👤 Creating admin user...');
        const adminPassword = await hashPassword('Laturkhadgaon@pis');
        db.users.push({
            id: db.nextId++,
            username: 'admin',
            password: adminPassword,
            full_name: 'Administrator',
            role: 'admin',
            created_at: new Date().toISOString()
        });
    } else {
        console.log('✅ Admin user already exists.');
    }

    // Add Teachers
    let teacherCount = 0;
    for (const teacher of teachers) {
        const username = teacher.toLowerCase()
            .replace(/\./g, '')
            .replace(/\s/g, '.');
        
        const teacherExists = db.users.some(u => u.username === username && u.role === 'teacher');
        
        if (!teacherExists) {
            const hashedPassword = await hashPassword('teacher123');
            db.users.push({
                id: db.nextId++,
                username: username,
                password: hashedPassword,
                full_name: teacher,
                teacher_name: teacher,
                role: 'teacher',
                created_at: new Date().toISOString()
            });
            teacherCount++;
        }
    }

    // Write to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('\n✅ Database setup complete!');
    console.log('========================================');
    console.log('👤 Admin Login:');
    console.log(`   Username: admin`);
    console.log(`   Password: Laturkhadgaon@pis`);
    console.log('========================================');
    console.log(`👨‍🏫 ${teacherCount} teachers created with password: teacher123`);
    console.log('========================================');
    console.log(`📁 Database saved to: ${DB_PATH}`);
}

// Run setup
setupDatabase().catch(console.error);