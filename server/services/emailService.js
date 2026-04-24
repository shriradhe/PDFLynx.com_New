const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

const initEmail = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    logger.info('Email service initialized with SMTP');
  } else {
    logger.warn('Email service not configured. Emails will be logged to console.');
    transporter = null;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || 'noreply@pdflynx.com';

  if (transporter) {
    try {
      await transporter.sendMail({ from, to, subject, html, text });
      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (err) {
      logger.error(`Failed to send email to ${to}:`, err.message);
      return false;
    }
  }

  logger.info('Email (not sent - SMTP not configured):', { to, subject, html });
  return false;
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  return sendEmail({
    to: email,
    subject: 'Verify your PDFLynx account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PDFLynx, ${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
    text: `Welcome to PDFLynx! Verify your email: ${verifyUrl}`,
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Reset your PDFLynx password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't request a password reset, ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
    `,
    text: `Reset your PDFLynx password: ${resetUrl}`,
  });
};

module.exports = { initEmail, sendVerificationEmail, sendPasswordResetEmail };
