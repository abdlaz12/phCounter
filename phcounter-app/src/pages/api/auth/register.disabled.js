// /**
//  * POST /api/auth/register
//  *
//  * Mendaftarkan pengguna baru.
//  * Sesuai F-01 Acceptance Criteria:
//  * - Form: nama, email, password, konfirmasi password
//  * - Password minimal 8 karakter dan harus mengandung huruf dan angka
//  * - Jika email sudah terdaftar, tampilkan pesan error yang jelas
//  * - Setelah register berhasil, kirim email verifikasi (token disimpan ke DB)
//  */

// import { connectDB } from "@/lib/mongodb";
// import User from "@/models/user";
// import crypto from "crypto";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
//   }

//   await connectDB();

//   const { name, email, password, confirmPassword } = req.body;

//   // ── Validasi input ──────────────────────────────────────────────────────────
//   const errors = [];

//   if (!name || name.trim().length < 2) {
//     errors.push("Nama wajib diisi dan minimal 2 karakter.");
//   }

//   if (!email) {
//     errors.push("Email wajib diisi.");
//   } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
//     errors.push("Format email tidak valid.");
//   }

//   if (!password) {
//     errors.push("Password wajib diisi.");
//   } else {
//     if (password.length < 8) {
//       errors.push("Password minimal 8 karakter.");
//     }
//     if (!/[a-zA-Z]/.test(password)) {
//       errors.push("Password harus mengandung minimal satu huruf.");
//     }
//     if (!/[0-9]/.test(password)) {
//       errors.push("Password harus mengandung minimal satu angka.");
//     }
//   }

//   if (!confirmPassword) {
//     errors.push("Konfirmasi password wajib diisi.");
//   } else if (password !== confirmPassword) {
//     errors.push("Password dan konfirmasi password tidak cocok.");
//   }

//   if (errors.length > 0) {
//     return res.status(400).json({ success: false, message: errors[0], errors });
//   }

//   // ── Cek email duplikat ──────────────────────────────────────────────────────
//   const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
//   if (existingUser) {
//     return res.status(409).json({
//       success: false,
//       message: "Email ini sudah terdaftar. Silakan gunakan email lain atau login.",
//     });
//   }

//   // ── Mode bypass: jika SKIP_EMAIL_VERIFICATION=true di .env.local ──────────
//   // Aktifkan saat development/testing agar bisa langsung login tanpa verifikasi email.
//   // JANGAN aktifkan di production.
//   const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === "true";

//   // ── Buat token verifikasi email ─────────────────────────────────────────────
//   const verificationToken = crypto.randomBytes(32).toString("hex");
//   const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

//   // ── Simpan user baru ────────────────────────────────────────────────────────
//   const newUser = await User.create({
//     name: name.trim(),
//     email: email.toLowerCase().trim(),
//     passwordHash: password, // akan di-hash oleh pre-save hook di model
//     // Jika bypass aktif: langsung set verified, tidak perlu simpan token
//     isEmailVerified: skipVerification,
//     emailVerificationToken: skipVerification ? undefined : verificationToken,
//     emailVerificationExpires: skipVerification ? undefined : verificationExpires,
//   });

//   if (!skipVerification) {
//     /**
//      * TODO: Kirim email verifikasi ke newUser.email
//      * Gunakan nodemailer atau layanan seperti Resend / SendGrid.
//      * Link verifikasi: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`
//      *
//      * Contoh (uncomment setelah setup email service):
//      *
//      * await sendVerificationEmail({
//      *   to: newUser.email,
//      *   name: newUser.name,
//      *   token: verificationToken,
//      * });
//      */
//   }

//   return res.status(201).json({
//     success: true,
//     message: skipVerification
//       ? "Registrasi berhasil! Akun langsung aktif (mode development). Silakan login."
//       : "Registrasi berhasil! Silakan cek email Anda untuk melakukan verifikasi akun.",
//     data: newUser.toSafeObject(),
//   });
// }

/**
 * POST /api/auth/register
 *
 * Mendaftarkan pengguna baru.
 * Sesuai F-01 Acceptance Criteria:
 * - Form: nama, email, password, konfirmasi password
 * - Password minimal 8 karakter dan harus mengandung huruf dan angka
 * - Jika email sudah terdaftar, tampilkan pesan error yang jelas
 * - Setelah register berhasil, kirim email verifikasi (token disimpan ke DB)
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  await connectDB();

  const { name, email, password, confirmPassword } = req.body;

  // ── Validasi input ──────────────────────────────────────────────────────────
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Nama wajib diisi dan minimal 2 karakter.");
  }

  if (!email) {
    errors.push("Email wajib diisi.");
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push("Format email tidak valid.");
  }

  if (!password) {
    errors.push("Password wajib diisi.");
  } else {
    if (password.length < 8) {
      errors.push("Password minimal 8 karakter.");
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Password harus mengandung minimal satu huruf.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password harus mengandung minimal satu angka.");
    }
  }

  if (!confirmPassword) {
    errors.push("Konfirmasi password wajib diisi.");
  } else if (password !== confirmPassword) {
    errors.push("Password dan konfirmasi password tidak cocok.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  // ── Cek email duplikat ──────────────────────────────────────────────────────
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email ini sudah terdaftar. Silakan gunakan email lain atau login.",
    });
  }

  // ── Mode bypass: jika SKIP_EMAIL_VERIFICATION=true di .env.local ──────────
  // Aktifkan saat development/testing agar bisa langsung login tanpa verifikasi email.
  // JANGAN aktifkan di production.
  const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === "true";

  // ── Buat token verifikasi email ─────────────────────────────────────────────
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  // ── Simpan user baru ────────────────────────────────────────────────────────
  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password, // akan di-hash oleh pre-save hook di model
    // Jika bypass aktif: langsung set verified, tidak perlu simpan token
    isEmailVerified: skipVerification,
    emailVerificationToken: skipVerification ? undefined : verificationToken,
    emailVerificationExpires: skipVerification ? undefined : verificationExpires,
  });

  if (!skipVerification) {
    await sendVerificationEmail({
      to: newUser.email,
      name: newUser.name,
      token: verificationToken,
    });
  }

  return res.status(201).json({
    success: true,
    message: skipVerification
      ? "Registrasi berhasil! Akun langsung aktif (mode development). Silakan login."
      : "Registrasi berhasil! Silakan cek email Anda untuk melakukan verifikasi akun.",
    data: newUser.toSafeObject(),
  });
}