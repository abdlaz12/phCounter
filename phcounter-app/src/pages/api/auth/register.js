// src/pages/api/auth/register.js
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { sendVerificationEmail } from '@/lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // ── Validation ───────────────────────────────────────────────────────────
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password dan konfirmasi password tidak sama' });
  }

  // Password: min 8 chars, must contain letter and number
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password minimal 8 karakter dan harus mengandung huruf dan angka',
    });
  }

  // ── Check duplicate email ─────────────────────────────────────────────────
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
  }

  // ── Hash password & generate verification token ───────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // ── Create user ───────────────────────────────────────────────────────────
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
    verificationToken,
  });

  // ── Send verification email ───────────────────────────────────────────────
  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    // Don't block registration if email fails; log for dev
    console.error('Failed to send verification email:', err.message);
  }

  return res.status(201).json({
    message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.',
  });
}