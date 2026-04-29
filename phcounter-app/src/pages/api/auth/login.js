import { connectDB } from "@/lib/mongodb";
import User from "@/models/user"; 
import { signToken } from "@/lib/jwt";

export default async function handler(req, res) {
  // 1. Hanya izinkan method POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  try {
    await connectDB();
    const { email, password } = req.body;

    // 2. Validasi input kosong
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 3. Cari user dan PAKSA ambil passwordHash (karena di model diset select: false)
    const user = await User.findOne({ email: lowerEmail }).select("+passwordHash");

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ success: false, message: "Email atau password salah." });
    }

    // 4. PROTEKSI UAS: Cek apakah akun sudah diverifikasi OTP
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Akun Anda belum aktif. Silakan verifikasi email Anda terlebih dahulu." 
      });
    }

    // 5. Validasi Password menggunakan method comparePassword dari model
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Email atau password salah." });
    }

    // 6. Generate JWT Token untuk session dashboard
    const token = signToken({ 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });

    // 7. Respon Sukses: Kirim token dan data user yang aman (toSafeObject)
    return res.status(200).json({
      success: true,
      message: "Login berhasil. Selamat datang kembali!",
      data: { 
        token, 
        user: user.toSafeObject() 
      },
    });

  } catch (error) {
    console.error("--- LOGIN CRITICAL ERROR ---");
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat login: " + error.message 
    });
  }
}