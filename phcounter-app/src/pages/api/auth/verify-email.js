/**
 * GET /api/auth/verify-email?token=<token>
 *
 * Verifikasi email setelah user mengklik link dari email registrasi.
 * Sesuai F-01 Acceptance Criteria no. 4:
 * "Setelah register berhasil, sistem mengirim email verifikasi."
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  await connectDB();

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token verifikasi tidak ditemukan.",
    });
  }

  // Cari user dengan token yang valid dan belum expired
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Link verifikasi tidak valid atau sudah kadaluarsa. Silakan daftar ulang atau minta link baru.",
    });
  }

  if (user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email sudah terverifikasi sebelumnya. Silakan login.",
    });
  }

  // Tandai email sebagai terverifikasi
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: "Email berhasil diverifikasi! Akun Anda sudah aktif. Silakan login.",
    data: user.toSafeObject(),
  });
}