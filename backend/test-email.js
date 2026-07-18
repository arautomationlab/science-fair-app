const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "viceprincipal2.latur@podar.org",
        pass: "loqthdvjimldunjk"
    }
});

async function testEmail() {
    try {
        const info = await transporter.sendMail({
            from: '"SMTP Test" <viceprincipal2.latur@podar.org>',
            to: "raheman.maths47@gmail.com",
            subject: "SMTP Test",
            text: "This email was sent from Nodemailer."
        });

        console.log("SUCCESS");
        console.log(info);
    } catch (err) {
        console.error("FAILED");
        console.error(err);
    }
}

testEmail();