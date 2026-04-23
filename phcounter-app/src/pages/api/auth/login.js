/**
 * POST /api/auth/login
 *
 * Login pengguna dengan email dan password.
 * Sesuai F-01 Acceptance Criteria:
 * - Login berhasil → kembalikan JWT token + data user
 * - Gagal login (email/password salah) → pesan error informatif
 * - Session tetap aktif hingga logout manual (JWT dengan expiry panjang)
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { signToken } from "@/lib/jwt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  await connectDB();

  const { email, password } = req.body;

  // ── Validasi input dasar ────────────────────────────────────────────────────
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi.",
    });
  }

  // ── Cari user (sertakan passwordHash yang di-select: false) ─────────────────
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash"
  );

  // Gunakan pesan generik agar tidak membocorkan info (email terdaftar atau tidak)
  const invalidCredentialsMsg =
    "Email atau password salah. Silakan periksa kembali.";

  if (!user) {
    return res.status(401).json({ success: false, message: invalidCredentialsMsg });
  }

  // ── Verifikasi password ─────────────────────────────────────────────────────
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: invalidCredentialsMsg });
  }

  // ── Cek verifikasi email ────────────────────────────────────────────────────
  // Dilewati jika SKIP_EMAIL_VERIFICATION=true (mode development/testing)
  const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === "true";
  if (!skipVerification && !user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Akun belum diverifikasi. Silakan cek email Anda dan klik link verifikasi.",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  // ── Generate JWT ────────────────────────────────────────────────────────────
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return res.status(200).json({
    success: true,
    message: "Login berhasil.",
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
}