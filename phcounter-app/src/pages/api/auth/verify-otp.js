import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  try {
    await connectDB();
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email dan kode OTP wajib diisi." });
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // --- LOGIKA VERIFIKASI GANDA (REGISTRASI ATAU RESET) ---

    // 1. Cek apakah ini OTP Registrasi
    const isRegisterOtp = user.otpCode === otp && user.otpExpires > new Date();

    // 2. Cek apakah ini OTP Reset Password
    const isResetOtp = user.passwordResetToken === otp && user.passwordResetExpires > new Date();

    if (isRegisterOtp) {
      // PROSES AKTIVASI AKUN BARU
      user.isVerified = true;
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Akun berhasil diverifikasi! Silakan login.",
      });
    } 
    
    if (isResetOtp) {
      // PROSES VERIFIKASI LUPA PASSWORD (Hanya lewat saja, reset dilakukan di page berikutnya)
      return res.status(200).json({
        success: true,
        message: "OTP Reset valid. Silakan ganti password Anda.",
      });
    }

    // Jika tidak cocok dengan keduanya atau sudah expired
    return res.status(400).json({ 
      success: false, 
      message: "Kode OTP salah atau sudah kadaluarsa." 
    });

  } catch (error) {
    console.error("VERIFY_OTP_ERROR:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
}