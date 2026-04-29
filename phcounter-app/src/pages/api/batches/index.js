import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device"; 
import Batch from "@/models/Batch"; 
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // GLOBAL TRY-CATCH: Memastikan error apapun direturn sebagai JSON, bukan HTML
  try {
    await connectDB();

    // 1. VERIFIKASI TOKEN & IDENTITAS USER
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const token = authHeader.split(' ')[1];
    let currentUserId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Fallback: Mengakomodasi jika struktur token pakai 'userId' atau 'id'
      currentUserId = decoded.userId || decoded.id; 
      
      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Invalid token payload." });
      }
    } catch (err) {
      return res.status(401).json({ success: false, message: "Session expired, please login again." });
    }

    // --- LOGIKA GET: MENGAMBIL SEMUA BATCH MILIK USER ---
    if (req.method === "GET") {
      const batches = await Batch.find({ userId: currentUserId })
        .populate({
          path: 'deviceId',
          model: Device, // Pastikan model Device terekspor dengan benar di file modelnya
          select: 'nameLabel deviceId statusOnline'
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: batches });
    }

    // --- LOGIKA POST: MEMBUAT BATCH BARU ---
    if (req.method === "POST") {
      const { batchName, deviceId, description, targetYield } = req.body;

      // Validasi input dasar
      if (!batchName || !deviceId) {
        return res.status(400).json({ success: false, message: "Batch name and Device are required." });
      }

      // 1. Validasi Kepemilikan Device
      const deviceExists = await Device.findOne({ _id: deviceId, userId: currentUserId });
      if (!deviceExists) {
        return res.status(404).json({ success: false, message: "Device not found or unauthorized." });
      }

      // 2. Cegah Double Batch (Satu alat tidak bisa menjalankan 2 batch 'Processing' sekaligus)
      const activeBatch = await Batch.findOne({ deviceId, status: 'Processing' });
      if (activeBatch) {
        return res.status(400).json({ 
          success: false, 
          message: `Device is currently busy with batch: ${activeBatch.batchName}` 
        });
      }

      // 3. Eksekusi Pembuatan Batch
      const newBatch = await Batch.create({
        batchName,
        deviceId,
        userId: currentUserId,
        description: description || "",
        targetYield: targetYield || 0,
        status: 'Processing' // Default langsung aktif
      });

      return res.status(201).json({ 
        success: true, 
        message: "Batch created successfully!", 
        data: newBatch 
      });
    }

    // Method selain GET dan POST akan ditolak
    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (globalError) {
    // Tangkap error fatal di sini (misal: gagal koneksi DB atau model salah)
    console.error("API FATAL ERROR:", globalError);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error.",
      error: globalError.message 
    });
  }
}