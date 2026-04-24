// src/lib/email.js
import nodemailer from "nodemailer";

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // false untuk port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Template: Verifikasi Email ───────────────────────────────────────────────
function verificationEmailTemplate(name, verificationUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verifikasi Email - EcoMonitor</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color:#2d6a4f;padding:30px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;">🌿 EcoMonitor</h1>
                    <p style="color:#b7e4c7;margin:8px 0 0;">Sistem Pemantauan pH Eco-Enzyme</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="color:#1b4332;margin:0 0 16px;">Halo, ${name}! 👋</h2>
                    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
                      Terima kasih sudah mendaftar di EcoMonitor. Satu langkah lagi — 
                      klik tombol di bawah untuk memverifikasi email kamu dan mengaktifkan akun.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:10px 0 30px;">
                          <a href="${verificationUrl}" 
                             style="background-color:#2d6a4f;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
                            ✅ Verifikasi Email Saya
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 8px;">
                      Atau copy link berikut ke browser kamu:
                    </p>
                    <p style="background:#f0f0f0;padding:10px;border-radius:4px;word-break:break-all;font-size:12px;color:#555;margin:0 0 24px;">
                      ${verificationUrl}
                    </p>

                    <p style="color:#888;font-size:13px;margin:0;">
                      ⚠️ Link ini akan kadaluarsa dalam <strong>24 jam</strong>. 
                      Jika kamu tidak mendaftar, abaikan email ini.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
                    <p style="color:#aaa;font-size:12px;margin:0;">
                      © 2026 EcoMonitor — Capstone Project Universitas Prasetiya Mulya
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// ─── Template: Reset Password ─────────────────────────────────────────────────
function resetPasswordEmailTemplate(name, resetUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Password - EcoMonitor</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color:#2d6a4f;padding:30px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;">🌿 EcoMonitor</h1>
                    <p style="color:#b7e4c7;margin:8px 0 0;">Sistem Pemantauan pH Eco-Enzyme</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="color:#1b4332;margin:0 0 16px;">Reset Password, ${name}</h2>
                    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
                      Kami menerima permintaan reset password untuk akun EcoMonitor kamu. 
                      Klik tombol di bawah untuk membuat password baru.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:10px 0 30px;">
                          <a href="${resetUrl}" 
                             style="background-color:#e63946;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
                            🔑 Reset Password Saya
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 8px;">
                      Atau copy link berikut ke browser kamu:
                    </p>
                    <p style="background:#f0f0f0;padding:10px;border-radius:4px;word-break:break-all;font-size:12px;color:#555;margin:0 0 24px;">
                      ${resetUrl}
                    </p>

                    <p style="color:#888;font-size:13px;margin:0;">
                      ⚠️ Link ini akan kadaluarsa dalam <strong>1 jam</strong>. 
                      Jika kamu tidak meminta reset password, abaikan email ini — 
                      password kamu tidak akan berubah.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
                    <p style="color:#aaa;font-size:12px;margin:0;">
                      © 2026 EcoMonitor — Capstone Project Universitas Prasetiya Mulya
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// ─── Fungsi: Kirim Email Verifikasi ──────────────────────────────────────────
export async function sendVerificationEmail({ to, name, token }) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "✅ Verifikasi Email Kamu - EcoMonitor",
    html: verificationEmailTemplate(name, verificationUrl),
  });
}

// ─── Fungsi: Kirim Email Reset Password ──────────────────────────────────────
export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "🔑 Reset Password - EcoMonitor",
    html: resetPasswordEmailTemplate(name, resetUrl),
  });
}