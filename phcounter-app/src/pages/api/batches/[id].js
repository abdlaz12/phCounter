import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/batch";
import Device from "@/models/device"; 
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
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
      currentUserId = decoded.userId || decoded.id; 
      if (!currentUserId) throw new Error("User ID tidak valid.");
    } catch (err) {
      return res.status(401).json({ success: false, message: "Sesi habis atau token tidak valid." });
    }

    // --- LOGIKA GET (DETAIL BATCH) ---
    if (req.method === "GET") {
      const batch = await Batch.findOne({ _id: id, userId: currentUserId }).populate('deviceId');
      if (!batch) return res.status(404).json({ success: false, message: "Batch tidak ditemukan." });
      
      return res.status(200).json({ success: true, data: batch });
    }

    // --- LOGIKA PUT (UPDATE BATCH) ---
    if (req.method === "PUT") {
      let updateData = { ...req.body };

      // Logika Otomatisasi endDate (Sesuai kebutuhan Laporan PDF di DOC-2)
      // Jika status diubah menjadi 'Selesai', otomatis catat waktu berakhirnya
      if (updateData.status === 'Selesai') {
        updateData.endDate = new Date();
      } else if (updateData.status === 'Aktif') {
        updateData.endDate = null; // Reset jika dikembalikan ke Aktif
      }

      const batch = await Batch.findOneAndUpdate(
        { _id: id, userId: currentUserId },
        updateData,
        { new: true, runValidators: true } // runValidators memastikan Enum "Aktif/Selesai" ditaati
      );
      
      if (!batch) {
        return res.status(404).json({ success: false, message: "Batch tidak ditemukan atau akses ditolak." });
      }
      return res.status(200).json({ success: true, data: batch });
    }

    // --- LOGIKA DELETE ---
    if (req.method === "DELETE") {
      const deletedBatch = await Batch.findOneAndDelete({ _id: id, userId: currentUserId });
      
      if (!deletedBatch) {
        return res.status(404).json({ success: false, message: "Batch tidak ditemukan atau akses ditolak." });
      }
      
      return res.status(200).json({ success: true, message: "Batch berhasil dihapus." });
    }

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