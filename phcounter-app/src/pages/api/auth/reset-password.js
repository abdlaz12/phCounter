/**
 * POST /api/auth/forgot-password
 *
 * Meminta link reset password via email.
 * Sesuai F-01 Acceptance Criteria no. 7:
 * "Tersedia fitur Lupa Password untuk reset password via email."
 *
 * Untuk keamanan, response selalu sukses meskipun email tidak ditemukan
 * (mencegah user enumeration attack).
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  await connectDB();

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email wajib diisi." });
  }

  // Response generik untuk mencegah user enumeration
  const successResponse = {
    success: true,
    message:
      "Jika email Anda terdaftar, link reset password telah dikirim. Silakan cek inbox Anda.",
  };

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Jika user tidak ada, tetap kembalikan sukses (jangan bocorkan info)
  if (!user) {
    return res.status(200).json(successResponse);
  }

  // ── Buat reset token ────────────────────────────────────────────────────────
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  // Simpan token ke database (raw token disimpan untuk dikirim via email,
  // di produksi sebaiknya di-hash juga sebelum disimpan ke DB)
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save({ validateBeforeSave: false });

  /**
   * TODO: Kirim email reset password ke user.email
   * Link reset: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`
   *
   * Contoh (uncomment setelah setup email service):
   *
   * await sendPasswordResetEmail({
   *   to: user.email,
   *   name: user.name,
   *   token: resetToken,
   * });
   */

  return res.status(200).json(successResponse);
}