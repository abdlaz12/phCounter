import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";
import Batch from "@/models/Batch";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    await connectDB();
    const { id } = req.query;

    // 1. VERIFIKASI TOKEN
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const token = authHeader.split(' ')[1];
    let currentUserId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUserId = decoded.userId || decoded.id;
      if (!currentUserId) throw new Error();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Session expired." });
    }

    // --- LOGIKA DELETE: HAPUS PERANGKAT ---
    if (req.method === "DELETE") {
      // Cari dan hapus device milik user yang sedang login
      const deletedDevice = await Device.findOneAndDelete({ 
        _id: id, 
        userId: currentUserId 
      });

      if (!deletedDevice) {
        return res.status(404).json({ success: false, message: "Device not found or unauthorized." });
      }

      // OTOMATIS: Hapus semua batch yang pernah menggunakan device ini
      // Ini menjaga integritas database kamu agar tidak ada batch "yatim"
      await Batch.deleteMany({ deviceId: id });

      return res.status(200).json({ 
        success: true, 
        message: "Device and associated batches permanently removed." 
      });
    }

    // --- LOGIKA PUT: UPDATE LABEL PERANGKAT (OPSIONAL) ---
    if (req.method === "PUT") {
      const { nameLabel } = req.body;
      const updatedDevice = await Device.findOneAndUpdate(
        { _id: id, userId: currentUserId },
        { nameLabel },
        { new: true }
      );

      if (!updatedDevice) {
        return res.status(404).json({ success: false, message: "Device not found." });
      }

      return res.status(200).json({ success: true, data: updatedDevice });
    }

    return res.status(405).json({ success: false, message: "Method not allowed." });

  } catch (error) {
    console.error("API DEVICE ID ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}