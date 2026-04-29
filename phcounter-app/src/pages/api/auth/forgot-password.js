import { connectDB } from "@/lib/mongodb";
import User from "@/models/user"; // Pastikan path dan nama model sesuai
import { sendEmail } from "@/lib/emailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  try {
    await connectDB();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email wajib diisi." });
    }

    const lowerEmail = email.toLowerCase().trim();
    const foundUser = await User.findOne({ email: lowerEmail });

    // STRATEGI KEAMANAN: Tetap kirim sukses meski email tidak terdaftar
    if (!foundUser) {
      return res.status(200).json({ 
        success: true, 
        message: "Instruksi pemulihan telah dikirim ke email Anda." 
      });
    }

    // 1. Generate 6 Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Simpan OTP ke Database
    // Gunakan field passwordResetToken agar tidak bentrok dengan OTP registrasi
    foundUser.passwordResetToken = otp; 
    foundUser.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // Set ke 15 Menit (Lebih standar)
    await foundUser.save();

    // 3. Kirim Email SMTP
    await sendEmail({
      to: lowerEmail,
      subject: "[EcoMonitor] Permintaan Reset Password",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; text-align: center;">
          <h2 style="color: #10B981; margin-bottom: 10px;">Reset Password</h2>
          <p style="color: #64748b; line-height: 1.6;">Kami menerima permintaan untuk mereset password akun EcoMonitor Anda. Gunakan kode OTP di bawah ini:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 2px solid #f1f5f9; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #064E3B;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Kode ini berlaku selama 15 menit. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>
        </div>
      `,
    });

    return res.status(200).json({ 
      success: true, 
      message: "Kode OTP telah dikirim ke Gmail Anda." 
    });

  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat memproses permintaan." 
    });
  }
}