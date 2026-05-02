import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Fungsi Generic (Untuk Anomali pH & Lainnya)
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
    console.error("Gagal mengirim email:", error);
    throw error;
  }
};

// 2. Fungsi Spesifik Verifikasi (Untuk OTP/Register)
// Tambahkan ini agar error 'sendVerificationEmail doesn't exist' hilang
export const sendVerificationEmail = async (email, otpCode) => {
  return await sendEmail({
    to: email,
    subject: "AeroFeed - Kode Verifikasi Akun",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verifikasi Akun Anda</h2>
        <p>Gunakan kode OTP berikut untuk memverifikasi akun AeroFeed Anda:</p>
        <h1 style="color: #10B981; letter-spacing: 5px;">${otpCode}</h1>
        <p>Kode ini akan kedaluwarsa dalam 5 menit.</p>
      </div>
    `,
  });
};