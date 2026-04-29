import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: 465,                    // Pakai 465
  secure: true,                 // Wajib TRUE untuk port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email terkirim: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim email via SMTP:", error);
    throw error;
  }
};