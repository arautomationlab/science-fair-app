const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

// Teachers list
const teachers = [
    'Chauhan Sushma', 'Dharne Rekha', 'Chamedia Aarti', 'Nazneen Pathan',
    'Pankaja Sherkhane', 'Sandya S.R.', 'Bidarkar Neelam', 'Balaji Hude',
    'Patil Smita', 'Udgire Swati', 'Gupta Premalata', 'Shaikh Naaz',
    'Gaikwad Satish', 'Kadam Sachin', 'Gore Sharad', 'Raut Monali',
    'Kondekar Surekha', 'Tapade Madhuri', 'Ingle Ravindra'
];

async function setupDatabase() {
    const db = {
        users: [],
        groups: [],
        projectDetails: [],
        judgeScores: [],
        parentRatings: [],
        nextId: 1
    };

    // Hash password function
    const hashPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    };

    console.log('🔐 Creating admin user...');
    
    // Add Admin
    const adminPassword = await hashPassword('admin123');
    db.users.push({
        id: db.nextId++,
        username: 'admin',
        password: adminPassword,
        full_name: 'Administrator',
        role: 'admin',
        created_at: new Date().toISOString()
    });

    console.log('👨‍🏫 Creating teacher users...');
    
    // Add Teachers
    for (const teacher of teachers) {
        const username = teacher.toLowerCase()
            .replace(/\./g, '')
            .replace(/\s/g, '.');
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
    }

    // Write to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('\n✅ Database setup complete!');
    console.log('========================================');
    console.log('👤 Admin Login:');
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log('========================================');
    console.log('👨‍🏫 Teacher Login (any teacher):');
    console.log(`   Username: chauhan.sushma`);
    console.log(`   Password: teacher123`);
    console.log('========================================');
    console.log(`📁 Database saved to: ${DB_PATH}`);
    console.log(`👨‍🏫 ${teachers.length} teachers created`);
}

// Run setup
setupDatabase().catch(console.error);