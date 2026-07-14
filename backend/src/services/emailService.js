const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'yahoo', 'outlook', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});

// Send registration confirmation email
async function sendRegistrationEmail(parentEmail, studentName, parentName, groupCode, password, teamName, projectTitle, grade, division) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: parentEmail,
            subject: '🏫 Science Fair 2026 - Registration Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #1a365d;">🏫 Science Fair 2026</h2>
                    <h3 style="color: #2b6cb0;">Registration Confirmation ✅</h3>
                    
                    <p>Dear <strong>${parentName}</strong>,</p>
                    
                    <p>Your ward <strong>${studentName}</strong> has been successfully registered for the Science Fair!</p>
                    
                    <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin-top: 0; color: #2d3748;">📋 Registration Details:</h4>
                        <p><strong>Team:</strong> ${teamName}</p>
                        <p><strong>Project:</strong> ${projectTitle}</p>
                        <p><strong>Grade:</strong> ${grade} - ${division}</p>
                        <p><strong>Group Code:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${groupCode}</code></p>
                        <p><strong>Password:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
                    </div>
                    
                    <p>🔗 <a href="${process.env.APP_URL}/dashboard" style="color: #3182ce;">Login to your dashboard</a></p>
                    
                    <p style="margin-top: 20px; font-size: 14px; color: #718096;">
                        ⚠️ <strong>Save these credentials securely!</strong>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    
                    <p style="font-size: 12px; color: #a0aec0;">
                        This is an automated message from your School Science Team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return info;

    } catch (error) {
        console.error('❌ Email Error:', error);
        throw error;
    }
}

// Send bulk emails
async function sendBulkRegistrationEmails(groupData) {
    const { students, groupCode, password, teamName, projectTitle, grade, division } = groupData;
    const results = [];

    for (const student of students) {
        if (student.parent_email) {
            try {
                const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
                const result = await sendRegistrationEmail(
                    student.parent_email,
                    studentName,
                    student.parent_name,
                    groupCode,
                    password,
                    teamName,
                    projectTitle,
                    grade,
                    division
                );
                results.push({ 
                    student: studentName, 
                    email: student.parent_email, 
                    success: true 
                });
            } catch (error) {
                results.push({ 
                    student: student.firstName || 'Student', 
                    email: student.parent_email, 
                    success: false, 
                    error: error.message 
                });
            }
        } else {
            results.push({ 
                student: student.firstName || 'Student', 
                email: 'No email provided', 
                success: false, 
                error: 'Email not provided' 
            });
        }
    }

    return results;
}

module.exports = { sendRegistrationEmail, sendBulkRegistrationEmails };