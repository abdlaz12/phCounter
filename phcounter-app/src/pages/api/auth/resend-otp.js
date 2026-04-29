import { connectDB } from "@/lib/mongodb";
import User from "@/models/user"; // Pastikan U besar sesuai file models/User.js
import { sendEmail } from "@/lib/emailer"; // Gunakan utilitas mailer yang sudah kita buat

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  try {
    await connectDB();
    const { email, type } = req.body; // type bisa 'register' atau 'reset'

    if (!email) {
      return res.status(400).json({ success: false, message: "Email wajib diisi." });
    }

    const lowerEmail = email.toLowerCase().trim();
    const foundUser = await User.findOne({ email: lowerEmail });

    // --- PROTEKSI KEAMANAN ---
    // Jika user tidak ditemukan, tetap kirim success agar penyerang tidak tahu 
    // email mana yang sudah terdaftar di sistem kita.
    if (!foundUser) {
      return res.status(200).json({ 
        success: true, 
        message: "Jika email terdaftar, kode baru telah dikirim." 
      });
    }

    // 1. Generate OTP Baru (6 Digit)
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 Menit

    // 2. Simpan ke Database (Sesuaikan dengan Field Model User kita)
    foundUser.otpCode = newOtp;
    foundUser.otpExpires = expiryTime;
    await foundUser.save();

    // 3. Kirim Email Beneran (Bukan simulasi lagi)
    const isReset = type === 'reset';
    await sendEmail({
      to: lowerEmail,
      subject: isReset ? "[ecomonitor] Reset Password OTP" : "[ecomonitor] Verifikasi Akun OTP",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #10B981; text-align: center;">${isReset ? 'Reset Password' : 'Verifikasi Akun'}</h2>
          <p style="text-align: center; color: #475569;">Berikut adalah kode OTP baru Anda. Jangan bagikan kode ini kepada siapapun:</p>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 16px; border: 2px solid #e2e8f0; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #10B981; letter-spacing: 8px;">${newOtp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Kode ini berlaku selama 10 menit.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Kode verifikasi baru telah dikirim ke email Anda."
    });

  } catch (error) {
    console.error("RESEND_OTP_ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gagal mengirim ulang kode: " + error.message 
    });
  }
}