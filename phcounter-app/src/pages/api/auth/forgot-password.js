// src/pages/api/auth/forgot-password.js
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { sendPasswordResetEmail } from '@/lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email harus diisi' });
  }

  // Always return 200 to prevent user enumeration
  const successMsg =
    'Jika email terdaftar, link reset password telah dikirim. Silakan cek inbox Anda.';

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(200).json({ message: successMsg });
  }

  // Generate token valid for 1 hour
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    return res.status(500).json({ message: 'Gagal mengirim email. Coba lagi nanti.' });
  }

  return res.status(200).json({ message: successMsg });
}