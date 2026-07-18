const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendRegistrationEmail(
    parentEmail,
    studentName,
    parentName,
    groupCode,
    password,
    teamName,
    projectTitle,
    grade,
    division
) {
    try {

        console.log("📧 Sending email to:", parentEmail);

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: parentEmail,
            subject: "🏫 SPARK 4.0 Science Fair - Registration Confirmation",

            html: `
            <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px">

                <h2 style="color:#0b5394">
                    SPARK 4.0 Science Fair
                </h2>

                <h3 style="color:green">
                    Registration Successful ✅
                </h3>

                <p>Dear <b>${parentName}</b>,</p>

                <p>
                We are pleased to inform you that your ward has been successfully registered
                for <b>SPARK 4.0 Science Fair</b>.
                </p>

                <table style="border-collapse:collapse;width:100%">
                    <tr>
                        <td><b>Student</b></td>
                        <td>${studentName}</td>
                    </tr>

                    <tr>
                        <td><b>Grade</b></td>
                        <td>${grade} - ${division}</td>
                    </tr>

                    <tr>
                        <td><b>Team Name</b></td>
                        <td>${teamName}</td>
                    </tr>

                    <tr>
                        <td><b>Project Title</b></td>
                        <td>${projectTitle}</td>
                    </tr>

                    <tr>
                        <td><b>Registration Code</b></td>
                        <td><b>${groupCode}</b></td>
                    </tr>

                    <tr>
                        <td><b>Password</b></td>
                        <td><b>${password}</b></td>
                    </tr>

                </table>

                <br>

                <a href="${process.env.APP_URL}/dashboard"
                   style="background:#0b5394;color:white;padding:12px 18px;
                   text-decoration:none;border-radius:5px">
                   Login to Dashboard
                </a>

                <br><br>

                <p>
                Please keep the Registration Code and Password safe for future login.
                </p>

                <hr>

                <p style="font-size:12px;color:#777">
                Podar International School, Latur<br>
                SPARK 4.0 Science Fair
                </p>

            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email Sent");
        console.log(info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (err) {

        console.error("❌ Email Error");
        console.error(err);

        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
    sendRegistrationEmail
};