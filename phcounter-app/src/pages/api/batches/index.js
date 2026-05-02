import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device"; 
import Batch from "@/models/batch"; 
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
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
          model: Device,
          select: 'nameLabel deviceId statusOnline'
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: batches });
    }

    // --- LOGIKA POST: MEMBUAT BATCH BARU ---
    if (req.method === "POST") {
      // PERBAIKAN 1: Destructuring menggunakan nameBatch dan notes (bukan batchName/description)
      const { nameBatch, deviceId, notes, startDate } = req.body;

      // PERBAIKAN 2: Validasi menggunakan nameBatch
      if (!nameBatch || !deviceId) {
        return res.status(400).json({ 
          success: false, 
          message: "Batch name and Device are required." 
        });
      }

      // 1. Validasi Kepemilikan Device
      const deviceExists = await Device.findOne({ _id: deviceId, userId: currentUserId });
      if (!deviceExists) {
        return res.status(404).json({ success: false, message: "Device not found or unauthorized." });
      }

      // 2. Cegah Double Batch (Menggunakan status 'Aktif' sesuai model terbaru)
      const activeBatch = await Batch.findOne({ deviceId, status: 'Aktif' });
      if (activeBatch) {
        return res.status(400).json({ 
          success: false, 
          message: `Device is currently busy with batch: ${activeBatch.nameBatch}` 
        });
      }

      // 3. Eksekusi Pembuatan Batch (Field disesuaikan dengan models/batch.js)
      const newBatch = await Batch.create({
        nameBatch,
        deviceId,
        userId: currentUserId,
        notes: notes || "",
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'Aktif' // Default menggunakan 'Aktif' sesuai Enum model
      });

      return res.status(201).json({ 
        success: true, 
        message: "Batch created successfully!", 
        data: newBatch 
      });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (globalError) {
    console.error("API FATAL ERROR:", globalError);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error.",
      error: globalError.message 
    });
  }
}