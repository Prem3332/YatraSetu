/**
 * PilgrimSafe — Email Service
 *
 * Nodemailer transporter configured for Gmail App Passwords.
 * Exports helper functions for sending verification emails.
 *
 * Required env vars:
 *   EMAIL_USER          – Gmail address
 *   EMAIL_APP_PASSWORD  – Gmail App Password (not the account password)
 */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send an OTP verification email.
 *
 * @param {string} toEmail  – Recipient email address
 * @param {string} userName – Recipient's display name
 * @param {string} otp      – Plaintext 6-digit OTP (shown in email body)
 */
const sendVerificationEmail = async (toEmail, userName, otp) => {
  const mailOptions = {
    from: `"YatraSetu" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5;">
        <div style="background: linear-gradient(135deg, #2D4238 0%, #3a5a4a 100%); padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #C84B31; line-height: 48px; text-align: center; margin-bottom: 12px;">
            <span style="color: #fff; font-size: 22px; font-weight: bold;">Y</span>
          </div>
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 32px 28px;">
          <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Thank you for registering with YatraSetu. Please use the verification code below to complete your registration.</p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #FFF3E8 0%, #FFE8D6 100%); border: 2px dashed #C84B31; border-radius: 12px; padding: 20px 40px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #C84B31; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center; margin: 16px 0 0;">This OTP is valid for <strong>5 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 0;">If you did not create this account, please ignore this email. No action is needed.</p>
        </div>
        <div style="background: #f9f9f9; padding: 16px 28px; text-align: center;">
          <p style="color: #aaa; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} YatraSetu — Seamless Pilgrimage Experience</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
