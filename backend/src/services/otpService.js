const nodemailer = require('nodemailer');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Create email transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
async function sendOTPEmail(email) {
    try {
        const otp = generateOTP();
        const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // Store OTP with expiry
        otpStore.set(email, { otp, expiry: expiryTime });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔐 Science Fair Registration - OTP Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #1a365d;">🏫 Science Fair 2026</h2>
                    <h3 style="color: #2b6cb0;">Email Verification</h3>
                    
                    <p>Your OTP for registration is:</p>
                    
                    <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2b6cb0;">${otp}</span>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>.</p>
                    
                    <p style="color: #718096; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    
                    <p style="font-size: 12px; color: #a0aec0;">
                        - School Science Team ❤️
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent to ${email}`);
        return { success: true, message: 'OTP sent successfully' };

    } catch (error) {
        console.error('OTP Email Error:', error);
        throw error;
    }
}

// Verify OTP
function verifyOTP(email, otp) {
    const storedData = otpStore.get(email);
    
    if (!storedData) {
        return { success: false, message: 'OTP not found. Please request a new one.' };
    }

    if (Date.now() > storedData.expiry) {
        otpStore.delete(email);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (storedData.otp !== otp) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // OTP verified - remove from store
    otpStore.delete(email);
    return { success: true, message: 'OTP verified successfully' };
}

// Resend OTP
async function resendOTP(email) {
    // Remove old OTP if exists
    otpStore.delete(email);
    return await sendOTPEmail(email);
}

module.exports = { sendOTPEmail, verifyOTP, resendOTP };