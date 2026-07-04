const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    }

    // Send registration confirmation to each parent
    async sendRegistrationMessage(phoneNumber, studentName, parentName, groupCode, password, teamName, projectTitle, grade, division) {
        try {
            const cleanPhone = phoneNumber.replace(/\s/g, '');
            let formattedPhone = cleanPhone;
            if (!cleanPhone.startsWith('+')) {
                formattedPhone = `+91${cleanPhone}`;
            }

            // Personalized WhatsApp message
            const message = `🏫 *Science Fair 2026 - Registration Confirmation* ✅

Dear *${parentName}*,

Your ward *${studentName}* has been successfully registered for the Science Fair!

📋 *Registration Details:*
• Team: *${teamName}*
• Project: *${projectTitle}*
• Grade: *${grade} - ${division}*
• Group Code: *${groupCode}*
• Password: *${password}*

🔗 *Login:* ${process.env.APP_URL}/dashboard

📌 *Important Dates:*
• Abstract Submission: [Date]
• Project Upload: [Date]
• Fair Day: [Date]

⚠️ *Save these credentials securely!*
*Do not share the password with anyone.*

For any queries, contact the Science Department.

- School Science Team ❤️`;

            const textMessage = {
                messaging_product: "whatsapp",
                to: formattedPhone,
                type: "text",
                text: {
                    body: message
                }
            };

            const response = await axios.post(
                this.apiUrl,
                textMessage,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ WhatsApp sent to ${parentName} (${formattedPhone})`);
            console.log(`   Student: ${studentName}, Team: ${teamName}`);
            return response.data;

        } catch (error) {
            console.error('❌ WhatsApp failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Send bulk messages to all parents in a group
    async sendBulkRegistrationMessages(groupData) {
        const { students, groupCode, password, teamName, projectTitle, grade, division } = groupData;
        const results = [];

        for (const student of students) {
            try {
                const result = await this.sendRegistrationMessage(
                    student.parent_phone,
                    student.name,
                    student.parent_name,
                    groupCode,
                    password,
                    teamName,
                    projectTitle,
                    grade,
                    division
                );
                results.push({ 
                    student: student.name, 
                    phone: student.parent_phone, 
                    success: true, 
                    result 
                });
                
                // Wait 1 second between messages to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                results.push({ 
                    student: student.name, 
                    phone: student.parent_phone, 
                    success: false, 
                    error: error.message 
                });
            }
        }

        return results;
    }
}

module.exports = new WhatsAppService();