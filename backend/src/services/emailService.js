const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("❌ SMTP Verify Error");
        console.error(error);
    } else {
        console.log("✅ Gmail SMTP Connected Successfully");
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
            from: `"Spark 4.0 Science Fair" <${process.env.EMAIL_USER}>`,
            to: parentEmail,
            subject: "🏫 SPARK 4.0 Science Fair - Registration Confirmation",

            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="700" cellpadding="25" cellspacing="0" style="background:#ffffff;margin-top:25px;border-radius:10px;">

<tr>
<td align="center" style="background:#0B5394;color:white;border-radius:10px 10px 0 0;">
<h1 style="margin:0;">SPARK 4.0 Science Fair</h1>
<p style="margin:5px 0;">Podar International School, Latur</p>
</td>
</tr>

<tr>
<td>

<h2 style="color:#1b5e20;">Registration Successful ✅</h2>

<p>Dear <strong>${parentName}</strong>,</p>

<p>
Your ward has been successfully registered for
<strong>SPARK 4.0 Science Fair</strong>.
</p>

<table cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;">

<tr style="background:#f5f5f5;">
<td width="35%"><strong>Student Name</strong></td>
<td>${studentName}</td>
</tr>

<tr>
<td><strong>Grade</strong></td>
<td>${grade} - ${division}</td>
</tr>

<tr style="background:#f5f5f5;">
<td><strong>Team Name</strong></td>
<td>${teamName}</td>
</tr>

<tr>
<td><strong>Project Title</strong></td>
<td>${projectTitle}</td>
</tr>

<tr style="background:#f5f5f5;">
<td><strong>Registration Code</strong></td>
<td><strong>${groupCode}</strong></td>
</tr>

<tr>
<td><strong>Password</strong></td>
<td><strong>${password}</strong></td>
</tr>

</table>

<br>

<div style="text-align:center;">

<a href="${process.env.APP_URL}/dashboard"
style="
background:#0B5394;
color:white;
padding:14px 30px;
text-decoration:none;
border-radius:6px;
display:inline-block;
font-weight:bold;">
Login to Dashboard
</a>

</div>

<br>

<p>
Please keep your Registration Code and Password safe.
They will be required for future login.
</p>

<hr>

<p style="font-size:13px;color:#666;">
This is an automatically generated email from the
<strong>SPARK 4.0 Science Fair Portal</strong>.
Please do not reply to this email.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("========================================");
        console.log("✅ EMAIL SENT SUCCESSFULLY");
        console.log(info.messageId);
        console.log("========================================");

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (err) {

        console.log("========================================");
        console.log("❌ EMAIL FAILED");
        console.log(err);
        console.log("========================================");

        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
    sendRegistrationEmail
};