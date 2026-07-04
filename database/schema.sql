-- Updated Groups Table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    registration_code VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    grade INTEGER NOT NULL,
    division VARCHAR(2) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    abstract TEXT,
    
    -- Participants
    participants INTEGER DEFAULT 1,
    students_data JSONB DEFAULT '[]',
    
    -- Project Submission Status
    project_submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop old columns if they exist
ALTER TABLE groups DROP COLUMN IF EXISTS parent_name;
ALTER TABLE groups DROP COLUMN IF EXISTS parent_phone;
ALTER TABLE groups DROP COLUMN IF EXISTS parent_email;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_sent;
ALTER TABLE groups DROP COLUMN IF EXISTS sms_sent_at;

-- Add teacher_guide column to groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS teacher_guide VARCHAR(100);

-- Update project_details table with new columns
ALTER TABLE project_details ADD COLUMN IF NOT EXISTS aim TEXT;
ALTER TABLE project_details ADD COLUMN IF NOT EXISTS materials TEXT;
ALTER TABLE project_details ADD COLUMN IF NOT EXISTS procedure TEXT;
ALTER TABLE project_details ADD COLUMN IF NOT EXISTS conclusion TEXT;
ALTER TABLE project_details ADD COLUMN IF NOT EXISTS video_link VARCHAR(255);
-- Users Table (for Admin, Teachers, Students)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    teacher_name VARCHAR(100), -- For teacher accounts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Admin User (Default: admin / admin123)
INSERT INTO users (username, password, full_name, role) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin');

-- Insert Teacher Users with default passwords
INSERT INTO users (username, password, full_name, role, teacher_name) VALUES
('chauhan.sushma', '$2a$10$YourHashedPasswordHere', 'Chauhan Sushma', 'teacher', 'Chauhan Sushma'),
('dharne.rekha', '$2a$10$YourHashedPasswordHere', 'Dharne Rekha', 'teacher', 'Dharne Rekha'),
('chamedia.aarti', '$2a$10$YourHashedPasswordHere', 'Chamedia Aarti', 'teacher', 'Chamedia Aarti'),
('nazneen.pathan', '$2a$10$YourHashedPasswordHere', 'Nazneen Pathan', 'teacher', 'Nazneen Pathan'),
('pankaja.sherkhane', '$2a$10$YourHashedPasswordHere', 'Pankaja Sherkhane', 'teacher', 'Pankaja Sherkhane'),
('sandya.sr', '$2a$10$YourHashedPasswordHere', 'Sandya S.R.', 'teacher', 'Sandya S.R.'),
('bidarkar.neelam', '$2a$10$YourHashedPasswordHere', 'Bidarkar Neelam', 'teacher', 'Bidarkar Neelam'),
('balaji.hude', '$2a$10$YourHashedPasswordHere', 'Balaji Hude', 'teacher', 'Balaji Hude'),
('patil.smita', '$2a$10$YourHashedPasswordHere', 'Patil Smita', 'teacher', 'Patil Smita'),
('udgire.swati', '$2a$10$YourHashedPasswordHere', 'Udgire Swati', 'teacher', 'Udgire Swati'),
('gupta.premalata', '$2a$10$YourHashedPasswordHere', 'Gupta Premalata', 'teacher', 'Gupta Premalata'),
('shaikh.naaz', '$2a$10$YourHashedPasswordHere', 'Shaikh Naaz', 'teacher', 'Shaikh Naaz'),
('gaikwad.satish', '$2a$10$YourHashedPasswordHere', 'Gaikwad Satish', 'teacher', 'Gaikwad Satish'),
('kadam.sachin', '$2a$10$YourHashedPasswordHere', 'Kadam Sachin', 'teacher', 'Kadam Sachin'),
('gore.sharad', '$2a$10$YourHashedPasswordHere', 'Gore Sharad', 'teacher', 'Gore Sharad'),
('raut.monali', '$2a$10$YourHashedPasswordHere', 'Raut Monali', 'teacher', 'Raut Monali'),
('kondekar.surekha', '$2a$10$YourHashedPasswordHere', 'Kondekar Surekha', 'teacher', 'Kondekar Surekha'),
('tapade.madhuri', '$2a$10$YourHashedPasswordHere', 'Tapade Madhuri', 'teacher', 'Tapade Madhuri'),
('ingle.ravindra', '$2a$10$YourHashedPasswordHere', 'Ingle Ravindra', 'teacher', 'Ingle Ravindra');

-- Add teacher_guide column to groups (if not exists)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS teacher_guide VARCHAR(100);

-- Add user_id to groups for student accounts (optional)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Add teacher_id to groups for easy filtering
ALTER TABLE groups ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES users(id);