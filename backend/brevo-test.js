const axios = require('axios');

const API_KEY = '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';

const data = {
    sender: {
        name: 'Spark 4.0 Science Fair App',
        email: 'viceprincipal2.latur@podar.org'
    },
    to: [
        {
            email: 'viceprincipal2.latur@podar.org' // Change to your email
        }
    ],
    subject: '🚀 Test Email from Brevo',
    htmlContent: `
        <h1>It works! 🎉</h1>
        <p>This email was sent using Brevo API via axios.</p>
        <p>Tested on: ${new Date().toLocaleString()}</p>
    `
};

axios({
    method: 'post',
    url: 'https://api.brevo.com/v3/smtp/email',
    headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
    },
    data: data
})
.then(response => {
    console.log('✅ SUCCESS! Email sent.');
    console.log('📧 Message ID:', response.data.messageId);
})
.catch(error => {
    console.error('❌ FAILED:');
    console.error('Message:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
    }
});