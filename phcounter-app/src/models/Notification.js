// src/models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    batchId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Batch',
      default: null 
    },
    type: { 
      type: String, 
      enum: {
        values: ['success', 'info', 'alert', 'system'], // Tambah 'system' untuk info maintenance
        message: "Tipe harus: success, info, alert, atau system."
      },
      required: true 
    },
    title: { 
      type: String, 
      required: [true, "Judul notifikasi wajib diisi."] 
    },
    message: { 
      type: String, 
      required: [true, "Pesan notifikasi wajib diisi."] 
    },
    // TAMBAHAN PRO 1: Action Link
    // Agar user bisa klik notifikasi dan langsung diarahkan ke halaman detail batch/sensor
    link: {
      type: String,
      default: null
    },
    // TAMBAHAN PRO 2: Metadata (Snapshot Data)
    // Menyimpan nilai pH saat kejadian agar dashboard tidak perlu query ulang ke SensorData
    metadata: {
      phValue: { type: Number },
      deviceId: { type: String }
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

// --- INDEXING STRATEGY ---

// Mempercepat loading dashboard notifikasi terbaru per user
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Mempercepat filter notifikasi berdasarkan batch tertentu
NotificationSchema.index({ batchId: 1 });

// TAMBAHAN PRO 3: TTL (Time To Live) Index
// Notifikasi IoT bisa menumpuk sangat cepat. 
// Index ini akan otomatis menghapus notifikasi yang sudah berumur lebih dari 30 hari.
// Ini menjaga database tetap ringan (NFR Efficiency).
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 hari dalam detik

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;