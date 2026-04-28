// src/pages/api/auth/reset-password.js
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password dan konfirmasi password tidak sama' });
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password minimal 8 karakter dan harus mengandung huruf dan angka',
    });
  }

  // ── Find user with valid, non-expired token ───────────────────────────────
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({
      message: 'Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.',
    });
  }

  // ── Update password ───────────────────────────────────────────────────────
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return res.status(200).json({ message: 'Password berhasil direset. Silakan login.' });
}