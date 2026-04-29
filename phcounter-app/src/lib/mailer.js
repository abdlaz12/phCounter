// src/lib/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// export async function sendVerificationEmail(to, token) {
//   const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to,
//     subject: 'Verifikasi Email EcoMonitor',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
//         <h2 style="color: #2d7a4f;">Selamat Datang di EcoMonitor!</h2>
//         <p>Klik tombol di bawah untuk memverifikasi email Anda:</p>
//         <a href="${verifyUrl}"
//            style="display:inline-block;padding:12px 24px;background:#2d7a4f;color:#fff;
//                   border-radius:6px;text-decoration:none;font-weight:bold;">
//           Verifikasi Email
//         </a>
//         <p style="color:#888;font-size:12px;margin-top:24px;">
//           Link ini berlaku selama 24 jam. Abaikan email ini jika Anda tidak mendaftar.
//         </p>
//       </div>
//     `,
//   });
// }
export async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verifikasi Email EcoMonitor',
      html: `
//       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
//         <h2 style="color: #2d7a4f;">Selamat Datang di EcoMonitor!</h2>
//         <p>Klik tombol di bawah untuk memverifikasi email Anda:</p>
//         <a href="${verifyUrl}"
//            style="display:inline-block;padding:12px 24px;background:#2d7a4f;color:#fff;
//                   border-radius:6px;text-decoration:none;font-weight:bold;">
//           Verifikasi Email
//         </a>
//         <p style="color:#888;font-size:12px;margin-top:24px;">
//           Link ini berlaku selama 24 jam. Abaikan email ini jika Anda tidak mendaftar.
//         </p>
//       </div>
//     `,
    });
    console.log('Email sent:', info.messageId); // ← tambah ini
  } catch (err) {
    console.error('Mailer error detail:', err); // ← tambah ini
    throw err;
  }
}

export async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/forgot-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset Password EcoMonitor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2d7a4f;">Reset Password</h2>
        <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#2d7a4f;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;">
          Link ini berlaku selama 1 jam. Abaikan jika Anda tidak meminta reset password.
        </p>
      </div>
    `,
  });
}