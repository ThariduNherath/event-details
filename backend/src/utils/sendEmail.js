const nodemailer = require('nodemailer');

const sendEmailToAdmin = async (newUserName, newUserEmail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // ඔයා Gmail පාවිච්චි කරනවා නම්
    auth: {
      user: process.env.EMAIL_USER, // ඔයාගේ Email එක (.env එකේ තියන්න)
      pass: process.env.EMAIL_PASS  // ඔයාගේ App Password එක
    }
  });

  await transporter.sendMail({
    from: '"NEXUS 2025" <no-reply@nexus.com>',
    to: 'thariduherath7@gmail.com', // Admin ගේ email එක
    subject: 'New User Registered!',
    text: `New user joined: ${newUserName} (${newUserEmail})`
  });
};

module.exports = sendEmailToAdmin;