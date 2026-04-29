import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/batch";
import Device from "@/models/device"; // WAJIB ADA karena butuh .populate()
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // GLOBAL TRY-CATCH agar tidak ada lagi error HTML balasan dari server
  try {
    await connectDB();
    const { id } = req.query;

    // 1. KEAMANAN: Verifikasi Token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Akses ditolak." });
    }

    const token = authHeader.split(' ')[1];
    let currentUserId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Fallback ganda agar lebih aman
      currentUserId = decoded.userId || decoded.id; 
      
      if (!currentUserId) throw new Error("User ID tidak valid.");
    } catch (err) {
      return res.status(401).json({ success: false, message: "Sesi habis atau token tidak valid." });
    }

    // --- LOGIKA GET (DETAIL BATCH) ---
    if (req.method === "GET") {
      try {
        // Pastikan batch yang dicari adalah milik user yang login
        const batch = await Batch.findOne({ _id: id, userId: currentUserId }).populate('deviceId');
        if (!batch) return res.status(404).json({ success: false, message: "Batch tidak ditemukan." });
        
        return res.status(200).json({ success: true, data: batch });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    }

    // --- LOGIKA PUT (UPDATE BATCH) ---
    if (req.method === "PUT") {
      try {
        // Validasi kepemilikan sebelum update
        const batch = await Batch.findOneAndUpdate(
          { _id: id, userId: currentUserId },
          req.body,
          { new: true }
        );
        
        if (!batch) return res.status(404).json({ success: false, message: "Batch tidak ditemukan atau akses ditolak." });
        return res.status(200).json({ success: true, data: batch });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    // --- LOGIKA DELETE ---
    if (req.method === "DELETE") {
      try {
        // Validasi kepemilikan sebelum hapus
        const deletedBatch = await Batch.findOneAndDelete({ _id: id, userId: currentUserId });
        
        if (!deletedBatch) {
          return res.status(404).json({ success: false, message: "Batch tidak ditemukan atau akses ditolak." });
        }
        
        return res.status(200).json({ success: true, message: "Batch berhasil dihapus." });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    }

    // Jika method selain GET, PUT, DELETE
    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (globalError) {
    console.error("API [ID] FATAL ERROR:", globalError);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error.",
      error: globalError.message 
    });
  }
}