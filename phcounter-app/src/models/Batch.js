// src/models/batch.js
import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema(
  {
    // Sesuai Collection 3: 'Batches' di Model Data Konseptual (Bagian 4.3)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    nameBatch: {
      type: String,
      required: [true, "Nama batch wajib diisi."],
      trim: true,
      maxlength: [100, "Nama batch maksimal 100 karakter."],
    },
    status: {
      type: String,
      enum: {
        values: ["Aktif", "Selesai", "Anomali"],
        message: "Status harus salah satu dari: Aktif, Selesai, Anomali.",
      },
      default: "Aktif",
    },
    startDate: {
      type: Date,
      required: [true, "Tanggal mulai wajib diisi."],
    },
    endDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Catatan maksimal 500 karakter."],
      default: null, // opsional sesuai SRS F-08
    },
    // Embedded object untuk pembacaan terakhir (sesuai Model Data Konseptual)
    latestReading: {
      pH: {
        type: Number,
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query cepat
BatchSchema.index({ userId: 1, createdAt: -1 });
BatchSchema.index({ deviceId: 1 });

const Batch = mongoose.models.Batch || mongoose.model("Batch", BatchSchema);

export default Batch;