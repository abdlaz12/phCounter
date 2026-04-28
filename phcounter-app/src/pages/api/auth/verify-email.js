// src/pages/api/auth/verify-email.js
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token verifikasi tidak ditemukan' });
  }

  await dbConnect();

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }

  if (user.isVerified) {
    // Already verified — redirect to login
    return res.redirect('/login?verified=already');
  }

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  // Redirect to login page with success flag
  return res.redirect('/login?verified=success');
}