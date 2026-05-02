import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";
import Batch from "@/models/batch";
import SensorData from "@/models/SensorData";
import Notification from "@/models/Notification";

export default async function handler(req, res) {
  try {
    await connectDB();

    // --- POST: Menerima Data dari ESP32 (Wokwi) ---
    if (req.method === "POST") {
      const { deviceId, apiKey, phValue } = req.body;

      // 1. Validasi Keamanan & Kelengkapan Data (SRS 3.2)
      if (!deviceId || !apiKey || phValue === undefined) {
        return res.status(400).json({ success: false, message: "Missing data fields" });
      }

      const val = parseFloat(phValue);

      // 2. Validasi Rentang pH (Wajib sesuai NFR 3.2 di DOC-2)
      // Memblokir data jika di luar rentang sensor pH standar (0-14)
      if (val < 0 || val > 14) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid pH range. Value must be between 0 and 14." 
        });
      }

      // 3. Validasi Perangkat (Auth via Body sesuai revisi dokumen kita)
      const device = await Device.findOne({ deviceId: deviceId.toUpperCase(), apiKey });
      if (!device) {
        return res.status(401).json({ success: false, message: "Unauthorized Device" });
      }

      // 4. Update Heartbeat Device
      await Device.findByIdAndUpdate(device._id, { statusOnline: true, lastSeen: new Date() });

      // 5. Cari Batch yang sedang berjalan (Status: 'Aktif' sesuai model Batch fix)
      const activeBatch = await Batch.findOne({ deviceId: device._id, status: 'Aktif' });

      // 6. Logika Penentuan Status & Notifikasi (Sesuai F-09 di DOC-2)
      // Kriteria: Anomali (>6 atau <2.5), Perhatian (5-6), Normal (Trend ke 3-4)
      let currentStatus = "Normal";
      let notifType = null;
      let notifTitle = "";

      if (val > 6.0 || val < 2.5) {
        currentStatus = "Anomali";
        notifType = "alert";
        notifTitle = "Kritis: pH Anomali Terdeteksi!";
      } else if (val > 5.0) {
        currentStatus = "Perhatian";
        notifType = "info"; // Menggunakan warna info/biru untuk perhatian
        notifTitle = "Perhatian: Penurunan pH Lambat";
      }

      // 7. Simpan Data Sensor (F-05)
      const newReading = await SensorData.create({
        deviceId: device._id,
        batchId: activeBatch ? activeBatch._id : null,
        phValue: val,
        status: currentStatus,
        timestamp: new Date()
      });

      // 8. Update Latest Reading di model Batch (untuk efisiensi dashboard)
      if (activeBatch) {
        await Batch.findByIdAndUpdate(activeBatch._id, {
          latestReading: { pH: val, timestamp: new Date() }
        });
      }

      // 9. Integrasi Notifikasi dengan Cooldown 5 Menit (Anti-Spam)
      if (activeBatch && notifType) {
        const lastNotif = await Notification.findOne({ 
          batchId: activeBatch._id, 
          type: notifType 
        }).sort({ createdAt: -1 });

        const now = new Date();
        const cooldown = 5 * 60 * 1000; // 5 menit

        if (!lastNotif || (now - new Date(lastNotif.createdAt)) > cooldown) {
          await Notification.create({
            userId: device.userId,
            batchId: activeBatch._id,
            type: notifType,
            title: notifTitle,
            message: `Batch "${activeBatch.nameBatch}" mencatat pH ${currentStatus.toLowerCase()}: ${val.toFixed(1)} pada alat ${device.nameLabel}.`,
            createdAt: now
          });
        }
      }

      return res.status(201).json({ success: true, data: newReading });
    }

    // --- GET: Mengambil Riwayat per Batch (F-06) ---
    if (req.method === "GET") {
      const { batchId, limit = 50 } = req.query;
      if (!batchId) return res.status(400).json({ success: false, message: "Batch ID is required" });

      const readings = await SensorData.find({ batchId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      return res.status(200).json({ success: true, data: readings });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (error) {
    console.error("READINGS API ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
}