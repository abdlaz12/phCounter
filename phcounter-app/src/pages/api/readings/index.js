import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";
import Batch from "@/models/batch";
import SensorData from "@/models/SensorData";
import Notification from "@/models/Notification"; // WAJIB: Import model notifikasi

export default async function handler(req, res) {
  try {
    await connectDB();

    // --- POST: Receive Data from Wokwi ---
    if (req.method === "POST") {
      const { deviceId, apiKey, phValue } = req.body;

      if (!deviceId || !apiKey || phValue === undefined) {
        return res.status(400).json({ success: false, message: "Missing data fields" });
      }

      // 1. Validasi Perangkat
      const device = await Device.findOne({ deviceId: deviceId.toUpperCase(), apiKey });
      if (!device) return res.status(401).json({ success: false, message: "Unauthorized Device" });

      // 2. Update Status Device ke Online
      await Device.findByIdAndUpdate(device._id, { statusOnline: true, lastSeen: new Date() });

      // 3. Cari Batch Aktif (Processing)
      const activeBatch = await Batch.findOne({ deviceId: device._id, status: 'Processing' });

      // 4. Logika Penentuan Status (F-09) & Setup Notifikasi
      let status = "Normal";
      let notifType = null;
      let notifTitle = "";
      const val = parseFloat(phValue);

      if (val > 5.5 || val < 3.0) {
        status = "Anomali";
        notifType = "alert";
        notifTitle = "Kritis: pH Anomali Terdeteksi!";
      } else if (val > 4.5) {
        status = "Perhatian";
        notifType = "alert"; // Menggunakan desain UI amber/alert kamu
        notifTitle = "Peringatan: pH Mendekati Batas";
      }

      // 5. Simpan Data Sensor (F-05)
      const newReading = await SensorData.create({
        deviceId: device._id,
        batchId: activeBatch ? activeBatch._id : null,
        phValue: val,
        status: status,
        timestamp: new Date()
      });

      // 6. INTEGRASI NOTIFIKASI (Dengan Sistem Anti-Spam IoT)
      if (activeBatch && notifType) {
        // Cek notifikasi terakhir untuk batch ini agar tidak nyepam tiap detik
        const lastNotif = await Notification.findOne({ batchId: activeBatch._id }).sort({ createdAt: -1 });
        const now = new Date();
        
        // Cooldown: Hanya kirim notifikasi jika belum pernah ada, atau sudah lewat 5 menit dari notif terakhir
        if (!lastNotif || (now - lastNotif.createdAt) > 5 * 60 * 1000) {
          await Notification.create({
            userId: device.userId, // Kaitkan dengan pemilik device
            batchId: activeBatch._id,
            type: notifType,
            title: notifTitle,
            message: `Batch "${activeBatch.batchName}" pada alat ${device.nameLabel} mencatat pH tidak normal: ${val}.`,
            createdAt: now
          });
        }
      }

      return res.status(201).json({ success: true, data: newReading });
    }

    // --- GET: Fetch History per Batch (F-06) ---
    if (req.method === "GET") {
      const { batchId } = req.query;
      if (!batchId) return res.status(400).json({ success: false, message: "Batch ID is required" });

      const readings = await SensorData.find({ batchId }).sort({ timestamp: -1 });
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