// src/pages/api/auth/login.js
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { signToken, setAuthCookie } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi' });
  }

  // ── Find user ─────────────────────────────────────────────────────────────
  const user = await User.findOne({ email: email.toLowerCase() });

  // Generic error message prevents user enumeration
  const invalidMsg = 'Email atau password salah. Silakan coba lagi.';

  if (!user) {
    return res.status(401).json({ message: invalidMsg });
  }

  // ── Check password ────────────────────────────────────────────────────────
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: invalidMsg });
  }

  // ── Check email verification ──────────────────────────────────────────────
  if (!user.isVerified) {
    return res.status(403).json({
      message: 'Akun belum diverifikasi. Silakan cek email Anda.',
      unverified: true,
    });
  }

  // ── Sign JWT and set cookie ───────────────────────────────────────────────
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  setAuthCookie(res, token);

  return res.status(200).json({
    message: 'Login berhasil',
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token, // Also return token for clients that prefer header-based auth
  });
}