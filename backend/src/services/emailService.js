const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'viceprincipal2.latur@podar.org';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Spark 4.0 Science Fair App';

async function sendRegistrationEmail(parentEmail, studentName, parentName, groupCode, password, teamName, projectTitle, grade, division) {
    try {
        console.log('📧 Sending email via Brevo to:', parentEmail);

        const data = {
            sender: {
                name: BREVO_SENDER_NAME,
                email: BREVO_SENDER_EMAIL
            },
            to: [{ email: parentEmail }],
            subject: '🏫 Science Fair 2026 - Registration Confirmation',
            htmlContent: `
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

        const response = await axios({
            method: 'post',
            url: 'https://api.brevo.com/v3/smtp/email',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            data: data
        });

        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', response.data.messageId);
        return { success: true, messageId: response.data.messageId };

    } catch (error) {
        console.error('❌ Brevo Email Error:', error.message);
        if (error.response) {
            console.error('❌ Response:', error.response.data);
        }
        return { success: false, error: error.message };
    }
}

module.exports = { sendRegistrationEmail };