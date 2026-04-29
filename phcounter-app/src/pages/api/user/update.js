import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  try {
    await connectDB();

    // 1. Verifikasi Token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token tidak valid atau tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 2. Ambil data dari body
    const { firstName, lastName, role } = req.body;

    // 3. Update User di Database
    // Kita gunakan { new: true } agar Mongoose mengembalikan data yang sudah terupdate
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui.",
      data: updatedUser.toSafeObject() // Kembalikan objek yang sudah difilter (tanpa password)
    });

  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error);
    return res.status(500).json({ success: false, message: "Gagal memperbarui profil: " + error.message });
  }
}