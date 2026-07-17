require('dotenv').config();
const { sendRegistrationEmail } = require('./src/services/emailService');

async function testEmail() {
    console.log('📧 Testing Brevo email...');
    console.log('📧 BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Set' : '❌ Not Set');
    console.log('📧 BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL);

    const result = await sendRegistrationEmail(
        'your_personal_email@gmail.com', // 👈 CHANGE THIS to your email
        'Test Student',
        'Test Parent',
        'TEST-CODE-123',
        'test123',
        'Test Team',
        'Test Project',
        '5',
        'A'
    );

    if (result.success) {
        console.log('✅ Test email sent successfully!');
    } else {
        console.log('❌ Test email failed:', result.error);
    }
}

testEmail();