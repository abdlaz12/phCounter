import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";
import Batch from "@/models/batch";
import SensorData from "@/models/SensorData";
import Notification from "@/models/Notification";
import { sendEmail, getAnomalyTemplate } from "@/lib/mail";

export default async function handler(req, res) {
  try {
    await connectDB();

    // --- LOGIKA POST: Ingest Data dari ESP32/Hardware ---
    if (req.method === "POST") {
      const { deviceId, apiKey, phValue } = req.body;

      // 1. Validasi Keamanan & Kelengkapan Payload
      if (!deviceId || !apiKey || phValue === undefined) {
        return res.status(400).json({ success: false, message: "Missing data fields" });
      }

      const val = parseFloat(phValue);
      // Validasi Rentang Fisik Sensor (0-14)
      if (val < 0 || val > 14) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid pH range. Value must be between 0 and 14." 
        });
      }

      // 2. Otorisasi Perangkat & Update Heartbeat
      const device = await Device.findOne({ deviceId: deviceId.toUpperCase(), apiKey });
      if (!device) {
        return res.status(401).json({ success: false, message: "Unauthorized Device" });
      }

      await Device.findByIdAndUpdate(device._id, { 
        statusOnline: true, 
        lastSeen: new Date() 
      });

      // 3. Pencarian Batch Aktif & Identitas User
      const activeBatch = await Batch.findOne({ deviceId: device._id, status: 'Aktif' })
        .populate('userId', 'email');

      // 4. Penentuan Status Berdasarkan Ambang Batas (Threshold)
      let currentStatus = "Normal";
      let notifType = null;
      let notifTitle = "";

      // Threshold sesuai standar operasional AeroFeed
      if (val > 6.0 || val < 2.5) {
        currentStatus = "Anomali";
        notifType = "alert";
        notifTitle = "Kritis: pH Anomali Terdeteksi!";
      } else if (val > 5.0) {
        currentStatus = "Perhatian";
        notifType = "info"; 
        notifTitle = "Perhatian: Kondisi pH Meningkat";
      }

      // 5. Simpan Pembacaan ke Database
      const newReading = await SensorData.create({
        deviceId: device._id,
        batchId: activeBatch ? activeBatch._id : null,
        phValue: val,
        status: currentStatus,
        timestamp: new Date()
      });

      // 6. Update Metadata Batch untuk Sinkronisasi Dashboard Cepat
      if (activeBatch) {
        await Batch.findByIdAndUpdate(activeBatch._id, {
          latestReading: { pH: val, timestamp: new Date() }
        });

        // 7. Logika Notifikasi Berjenjang & Email Alert
        if (notifType) {
          // Cooldown Check: Mencegah spam notifikasi (Interval 5 menit)
          const lastNotif = await Notification.findOne({ 
            batchId: activeBatch._id, 
            type: notifType 
          }).sort({ createdAt: -1 });

          const now = new Date();
          const cooldown = 5 * 60 * 1000; 

          if (!lastNotif || (now - new Date(lastNotif.createdAt)) > cooldown) {
            // A. Pembuatan Notifikasi Sistem (Lengkap dengan Metadata & Link)
            await Notification.create({
              userId: device.userId,
              batchId: activeBatch._id,
              type: notifType,
              title: notifTitle,
              message: `Batch "${activeBatch.nameBatch}" mencatat pH ${currentStatus.toLowerCase()}: ${val.toFixed(1)} pada alat ${device.nameLabel}.`,
              link: `/batches/`, 
              metadata: {
                phValue: val,
                deviceId: device.deviceId
              },
              createdAt: now
            });

            // B. Pengiriman Email Alert Otomatis (Hanya untuk tipe 'alert')
            if (notifType === 'alert' && activeBatch.userId?.email) {
              try {
                await sendEmail({
                  to: activeBatch.userId.email,
                  subject: `🚨 [AeroFeed Alert] Anomali pada ${activeBatch.nameBatch}`,
                  html: getAnomalyTemplate(activeBatch.nameBatch, val.toFixed(1), device.nameLabel)
                });
              } catch (emailErr) {
                console.error("Gagal mengirim email peringatan:", emailErr);
              }
            }
          }
        }
      }

      return res.status(201).json({ success: true, data: newReading });
    }

    // --- LOGIKA GET: Mengambil Riwayat Pembacaan per Batch ---
    if (req.method === "GET") {
      const { batchId, limit = 50 } = req.query;
      if (!batchId) {
        return res.status(400).json({ success: false, message: "Batch ID is required" });
      }

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