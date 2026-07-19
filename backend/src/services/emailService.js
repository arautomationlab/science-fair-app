const axios = require("axios");

async function sendRegistrationEmail(
    parentEmail,
    studentName,
    parentName,
    groupCode,
    password,
    teamName,
    projectTitle,
    grade,
    division,
    qrCodeDataUrl
) {
    try {

        console.log("======================================");
        console.log("📧 Parent Email :", parentEmail);
        console.log("👦 Student Name :", studentName);
        console.log("🔑 Registration :", groupCode);
        console.log("======================================");

        const response = await axios.post(
            process.env.GOOGLE_SCRIPT_URL,
            {
                parentEmail,
                studentName,
                parentName,
                groupCode,
                password,
                teamName,
                projectTitle,
                grade,
                division,
                qrCodeDataUrl
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        console.log("======================================");
        console.log("✅ Email sent successfully");
        console.log(response.data);
        console.log("======================================");

        return {
            success: true
        };

    } catch (err) {

        console.log("======================================");
        console.log("❌ Email sending failed");
        console.log(err.response?.data || err.message);
        console.log("======================================");

        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
    sendRegistrationEmail
};