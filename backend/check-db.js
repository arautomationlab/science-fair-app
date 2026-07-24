// E:\science-fair-app\backend\check-db.js

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://science_fair_user:UfkRp2E7eYV2FvRrL8Ir2Byu0zq9KHOI@dpg-d95romfavr4c73aru7u0-a.oregon-postgres.render.com/science_fair?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkStudent() {
    try {
        console.log('🔍 Checking database...\n');

        // Check if registration code exists
        const result = await pool.query(
            `SELECT registration_code, students_data 
             FROM groups 
             WHERE registration_code = 'SPARK4.0-4-MRUUKNB1-4MP9'`
        );

        if (result.rows.length === 0) {
            console.log('❌ Registration code NOT found!');
            process.exit(0);
        }

        const group = result.rows[0];
        console.log('📝 Registration Code:', group.registration_code);
        console.log('\n📊 Raw students_data type:', typeof group.students_data);
        console.log('📊 Raw students_data:', group.students_data);
        console.log('');

        // Check if students_data is already an object or string
        let students;
        if (typeof group.students_data === 'string') {
            students = JSON.parse(group.students_data);
        } else if (typeof group.students_data === 'object') {
            students = group.students_data;
        } else {
            console.log('❌ Unknown data type:', typeof group.students_data);
            process.exit(0);
        }

        console.log('👥 Students:');
        console.log(JSON.stringify(students, null, 2));

        // Check if email exists
        console.log('\n📧 Emails in this group:');
        if (Array.isArray(students)) {
            students.forEach((s, i) => {
                console.log(`   ${i+1}. ${s.parent_email || 'No email'}`);
            });

            const emailExists = students.some(s => 
                s.parent_email && s.parent_email.toLowerCase() === 'ajinkymulay2959@gmail.com'.toLowerCase()
            );

            console.log('\n' + (emailExists ? '✅ Email FOUND in this group!' : '❌ Email NOT found in this group!'));
        } else {
            console.log('   Students data is not an array:', students);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkStudent();