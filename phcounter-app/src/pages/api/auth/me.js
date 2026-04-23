/**
 * GET /api/auth/me
 *
 * Mengembalikan data user yang sedang login berdasarkan JWT.
 * Endpoint ini protected — membutuhkan Bearer token di header Authorization.
 *
 * Header: Authorization: Bearer <token>
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { withAuth } from "@/lib/authMiddleware";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  await connectDB();

  // req.user tersedia dari withAuth middleware: { userId, email, role }
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User tidak ditemukan.",
    });
  }

  return res.status(200).json({
    success: true,
    data: user.toSafeObject(),
  });
}

export default withAuth(handler);