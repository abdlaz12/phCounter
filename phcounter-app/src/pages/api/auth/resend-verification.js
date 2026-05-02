// src/pages/api/auth/resend-verification.js
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { sendVerificationEmail } from '@/lib/emailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email harus diisi' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Return 200 always to avoid enumeration
  const msg = 'Jika email terdaftar dan belum terverifikasi, email verifikasi telah dikirim ulang.';

  if (!user || user.isVerified) {
    return res.status(200).json({ message: msg });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    console.error('Failed to resend verification email:', err.message);
  }

  return res.status(200).json({ message: msg });
}