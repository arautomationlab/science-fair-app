const axios = require('axios');

const API_KEY = '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';

const data = {
    sender: {
        name: 'Spark 4.0 Science Fair',
        email: 'viceprincipal2.latur@podar.org'  // 👈 Changed to school domain
    },
    to: [
        {
            email: 'viceprincipal2.latur@podar.org'  // 👈 Sending to yourself
        }
    ],
    subject: '🚀 Test from School Domain',
    htmlContent: '<h1>Test from School Domain</h1><p>If you see this, it works!</p>'
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
.then(response => console.log('✅ Sent:', response.data.messageId))
.catch(error => console.error('❌ Error:', error.response?.data || error.message));