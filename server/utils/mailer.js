const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

async function sendVerificationEmail(to, firstName, token, baseUrl) {
    const verifyUrl = `${baseUrl}/api/users/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"Family Hospital" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Verify your email — Family Hospital',
        html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="color:#0F4C81;font-size:22px;margin:0;">Family<span style="color:#00796B;">Hospital</span></h2>
          </div>
          <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid #e2e8f0;">
            <h3 style="color:#00355F;margin-top:0;">Hello, ${firstName}!</h3>
            <p style="color:#42474F;line-height:1.6;">Thanks for creating an account. Please verify your email address to activate your account.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${verifyUrl}" style="background:#0F4C81;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">Verify Email Address</a>
            </div>
            <p style="color:#727780;font-size:13px;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
          </div>
        </div>`
    });
}

async function sendOtpEmail(to, firstName, otp) {
    await transporter.sendMail({
        from: `"Family Hospital" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Your login code is ${otp} — Family Hospital`,
        html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="color:#0F4C81;font-size:22px;margin:0;">Family<span style="color:#00796B;">Hospital</span></h2>
          </div>
          <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid #e2e8f0;">
            <h3 style="color:#00355F;margin-top:0;">Hello, ${firstName}!</h3>
            <p style="color:#42474F;line-height:1.6;">Your one-time login code is:</p>
            <div style="text-align:center;margin:28px 0;">
              <div style="display:inline-block;background:#EFF6FF;border:2px dashed #0F4C81;border-radius:10px;padding:20px 40px;">
                <span style="font-size:36px;font-weight:700;color:#0F4C81;letter-spacing:10px;">${otp}</span>
              </div>
            </div>
            <p style="color:#727780;font-size:13px;">This code expires in 10 minutes. Never share it with anyone.</p>
          </div>
        </div>`
    });
}

module.exports = { sendVerificationEmail, sendOtpEmail };
