// src/pages/api/auth/me.js
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { withAuth } from '@/lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const user = await User.findById(req.user.userId).select(
    '-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires'
  );

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  return res.status(200).json({ user });
}

export default withAuth(handler);