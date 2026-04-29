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
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 2. Ambil password lama dan baru dari body
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Password lama dan baru wajib diisi." });
    }

    // 3. Cari User dan PAKSA ambil passwordHash
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // 4. Bandingkan Password Lama menggunakan method comparePassword (dari model user.js)
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password lama salah." });
    }

    // 5. Set Password Baru
    // Middleware pre("save") di model akan otomatis melakukan hashing pada password baru ini
    user.passwordHash = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password berhasil diperbarui."
    });

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return res.status(500).json({ success: false, message: "Gagal memperbarui password." });
  }
}