const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim()

async function sendVerificationEmail(to, name, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: `"NEXUS 2025" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your NEXUS 2025 account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; padding: 40px 30px; border-radius: 12px;">
        <div style="background: #FF4500; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; margin: -40px -30px 30px -30px;">
          <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px;">NEXUS 2025</h1>
        </div>
        <p style="color: #e0e0e0; font-size: 15px;">Hi ${name},</p>
        <p style="color: #e0e0e0; font-size: 15px; line-height: 1.6;">
          Thanks for signing up for NEXUS 2025. Please confirm your email address to activate your account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #FF4500; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">
            VERIFY MY EMAIL
          </a>
        </div>
        <p style="color: #888; font-size: 12px; word-break: break-all;">
          Or copy this link: ${verifyUrl}
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

module.exports = { sendVerificationEmail }