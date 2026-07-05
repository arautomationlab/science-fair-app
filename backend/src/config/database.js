const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        users: [],
        groups: [],
        projectDetails: [],
        judgeScores: [],
        parentRatings: [],
        nextId: 1
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    console.log('⚠️ Database created. Please run setup.js first!');
}

// Read database
function readDB() {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Write database
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Database query function
const pool = {
    async query(sql, params) {
        const db = readDB();
        
        // ===== USER QUERIES =====
        if (sql.includes('SELECT * FROM users WHERE username = $1 AND role = $2')) {
            const username = params[0];
            const role = params[1];
            const user = db.users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.role === role
            );
            return { rows: user ? [user] : [] };
        }

        if (sql.includes('SELECT id, username, full_name, teacher_name, email FROM users WHERE role = $1')) {
            const teachers = db.users.filter(u => u.role === 'teacher');
            return { rows: teachers };
        }

        // ===== GROUP QUERIES =====
        if (sql.includes('INSERT INTO groups')) {
            const newGroup = {
                id: db.nextId++,
                registration_code: params[0],
                password: params[1],
                grade: parseInt(params[2]),
                division: params[3],
                teacher_guide: params[4] || '',
                teacher_id: params[5] || null,
                team_name: params[6],
                project_title: params[7],
                abstract: params[8] || '',
                participants: parseInt(params[9]) || 1,
                students_data: params[10] || '[]',
                project_submitted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            db.groups.push(newGroup);
            writeDB(db);
            return { rows: [{ id: newGroup.id, registration_code: newGroup.registration_code }] };
        }

        if (sql.includes('SELECT * FROM groups WHERE registration_code = $1')) {
            const code = params[0];
            const group = db.groups.find(g => g.registration_code === code);
            return { rows: group ? [group] : [] };
        }

        if (sql.includes('SELECT * FROM groups WHERE id = $1')) {
            const id = params[0];
            const group = db.groups.find(g => g.id === id);
            return { rows: group ? [group] : [] };
        }

        if (sql.includes('SELECT * FROM groups WHERE teacher_id = $1 OR teacher_guide = $2')) {
            const teacherId = params[0];
            const teacherName = params[1];
            const groups = db.groups.filter(g => 
                g.teacher_id === teacherId || 
                g.teacher_guide === teacherName
            );
            return { rows: groups };
        }

        // Get all groups with left join project details
        if (sql.includes('SELECT g.*, pd.*, u.full_name as teacher_name FROM groups g')) {
            // Simplified response - just return all groups with project details
            const groups = db.groups.map(g => {
                const details = db.projectDetails.find(pd => pd.group_id === g.id);
                return { ...g, ...details };
            });
            return { rows: groups };
        }

        // ===== PROJECT DETAILS QUERIES =====
        if (sql.includes('INSERT INTO project_details')) {
            const newDetail = {
                id: db.nextId++,
                group_id: params[0],
                aim: params[1] || '',
                materials: params[2] || '',
                procedure: params[3] || '',
                conclusion: params[4] || '',
                abstract: params[5] || '',
                video_link: params[6] || '',
                images: params[7] || '[]',
                submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            db.projectDetails.push(newDetail);
            writeDB(db);
            return { rows: [newDetail] };
        }

        if (sql.includes('UPDATE project_details SET')) {
            // Update existing project details
            const groupId = params[7];
            const existingIndex = db.projectDetails.findIndex(pd => pd.group_id === groupId);
            if (existingIndex !== -1) {
                db.projectDetails[existingIndex] = {
                    ...db.projectDetails[existingIndex],
                    aim: params[0],
                    materials: params[1],
                    procedure: params[2],
                    conclusion: params[3],
                    abstract: params[4],
                    video_link: params[5],
                    images: params[6] || '[]',
                    updated_at: new Date().toISOString()
                };
                writeDB(db);
                return { rows: [db.projectDetails[existingIndex]] };
            }
            return { rows: [] };
        }

        if (sql.includes('SELECT * FROM project_details WHERE group_id = $1')) {
            const groupId = params[0];
            const details = db.projectDetails.filter(pd => pd.group_id === groupId);
            return { rows: details };
        }

        // ===== JUDGE SCORES QUERIES =====
        if (sql.includes('INSERT INTO judge_scores')) {
            const newScore = {
                id: db.nextId++,
                group_id: params[0],
                judge_name: params[1],
                score: parseFloat(params[2]),
                comments: params[3] || '',
                created_at: new Date().toISOString()
            };
            db.judgeScores.push(newScore);
            writeDB(db);
            return { rows: [newScore] };
        }

        // ===== PARENT RATINGS QUERIES =====
        if (sql.includes('INSERT INTO parent_ratings')) {
            const newRating = {
                id: db.nextId++,
                group_id: params[0],
                stars: parseInt(params[1]),
                comment: params[2] || '',
                created_at: new Date().toISOString()
            };
            db.parentRatings.push(newRating);
            writeDB(db);
            return { rows: [newRating] };
        }

        // Update group submission status
        if (sql.includes('UPDATE groups SET project_submitted = TRUE')) {
            const groupId = params[0];
            const groupIndex = db.groups.findIndex(g => g.id === groupId);
            if (groupIndex !== -1) {
                db.groups[groupIndex].project_submitted = true;
                db.groups[groupIndex].submitted_at = new Date().toISOString();
                writeDB(db);
                return { rows: [db.groups[groupIndex]] };
            }
            return { rows: [] };
        }

        console.log('⚠️ Unknown query:', sql.substring(0, 100) + '...');
        return { rows: [] };
    }
};

console.log('✅ Database ready at:', DB_PATH);

module.exports = { pool };