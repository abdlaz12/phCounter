// src/models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // Merujuk ke Collection 1: 'Users'
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    // Merujuk ke Collection 3: 'Batches' agar bisa di-populate
    batchId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Batch',
      default: null 
    },
    // Tipe notifikasi sesuai SRS
    type: { 
      type: String, 
      enum: {
        values: ['success', 'info', 'alert'],
        message: "Tipe harus: success, info, atau alert."
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
    // Status baca untuk fitur "Mark all as read"
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { 
    // Menggunakan timestamps otomatis agar ada createdAt & updatedAt
    timestamps: true 
  }
);

// Indexing untuk mempercepat loading halaman notifikasi per user
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ batchId: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;