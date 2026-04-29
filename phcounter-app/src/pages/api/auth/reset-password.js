import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  try {
    await connectDB();
    const { email, otp, newPassword } = req.body;

    // 1. Validasi Input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter." });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 2. Cari user dan validasi OTP Reset
    const user = await User.findOne({ 
      email: lowerEmail,
      passwordResetToken: otp,
      passwordResetExpires: { $gt: new Date() } // Cek apakah belum expired
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Kode OTP salah atau sudah kadaluarsa. Silakan minta kode baru." 
      });
    }

    // 3. Update Password
    // Ingat: passwordHash akan otomatis di-hash oleh bcrypt di models/user.js (pre-save hook)
    user.passwordHash = newPassword;

    // 4. Bersihkan token reset agar tidak bisa dipakai lagi
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "Password berhasil diperbarui! Silakan login dengan password baru Anda." 
    });

  } catch (error) {
    console.error("RESET_PASSWORD_API_ERROR:", error);
    return res.status(500).json({ success: false, message: "Gagal mereset password." });
  }
}