const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim()

const EMAIL_HEADER = `
  <div style="background: #FF4500; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; margin: -40px -30px 30px -30px;">
    <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px;">NEXUS 2025</h1>
  </div>
`
const EMAIL_WRAPPER = (innerHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; padding: 40px 30px; border-radius: 12px;">
    ${EMAIL_HEADER}
    ${innerHtml}
  </div>
`

async function sendVerificationEmail(to, name, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: `"NEXUS 2025" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your NEXUS 2025 account',
    html: EMAIL_WRAPPER(`
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
    `),
  })
}

// Sent right after signup (fires alongside the verification email, separate message so
// the verify CTA doesn't get lost among welcome copy)
async function sendWelcomeEmail(to, name) {
  await transporter.sendMail({
    from: `"NEXUS 2025" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to NEXUS 2025 🎉',
    html: EMAIL_WRAPPER(`
      <p style="color: #e0e0e0; font-size: 15px;">Hi ${name},</p>
      <p style="color: #e0e0e0; font-size: 15px; line-height: 1.6;">
        You're in! Your NEXUS 2025 account is ready. Explore speakers, the schedule,
        and grab your ticket whenever you're ready.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/#tickets" style="background: #FF4500; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">
          BROWSE TICKETS
        </a>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        See you at NEXUS 2025 — September 15–17.
      </p>
    `),
  })
}

// Sent after a successful checkout
async function sendOrderConfirmationEmail(to, name, order) {
  const itemsHtml = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding: 10px 0; color: #e0e0e0; font-size: 14px; border-bottom: 1px solid #222;">${i.quantity}× ${i.tier}</td>
        <td style="padding: 10px 0; color: #e0e0e0; font-size: 14px; border-bottom: 1px solid #222; text-align: right;">$${(i.unitPrice * i.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join('')

  await transporter.sendMail({
    from: `"NEXUS 2025" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order confirmed — ${order.paymentRef}`,
    html: EMAIL_WRAPPER(`
      <p style="color: #e0e0e0; font-size: 15px;">Hi ${name},</p>
      <p style="color: #e0e0e0; font-size: 15px; line-height: 1.6;">
        Your NEXUS 2025 tickets are confirmed. See you there!
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${itemsHtml}
        <tr>
          <td style="padding: 12px 0 0 0; color: #fff; font-size: 15px; font-weight: bold;">Total</td>
          <td style="padding: 12px 0 0 0; color: #FF4500; font-size: 15px; font-weight: bold; text-align: right;">$${order.total.toLocaleString()}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 12px;">Reference: ${order.paymentRef}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/my-tickets" style="background: #FF4500; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">
          VIEW MY TICKETS
        </a>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Bring your QR code from the My Tickets page for gate entry.
      </p>
    `),
  })
}

// Sent by the daily reminder cron job to everyone with a paid ticket, N days before the event
async function sendReminderEmail(to, name, daysLeft, eventDate) {
  await transporter.sendMail({
    from: `"NEXUS 2025" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} until NEXUS 2025`,
    html: EMAIL_WRAPPER(`
      <p style="color: #e0e0e0; font-size: 15px;">Hi ${name},</p>
      <p style="color: #e0e0e0; font-size: 15px; line-height: 1.6;">
        NEXUS 2025 kicks off in <strong style="color:#FF4500;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>
        (${eventDate}). Don't forget your ticket QR code for gate entry.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/my-tickets" style="background: #FF4500; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">
          VIEW MY TICKET
        </a>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        See you soon!
      </p>
    `),
  })
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendReminderEmail,
}