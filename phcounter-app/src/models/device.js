// src/models/device.js
import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    // Sesuai Collection 2: 'Devices' di Model Data Konseptual (Bagian 4.3)
    deviceId: {
      type: String,
      required: [true, "Device ID wajib diisi."],
      unique: true,
      trim: true,
      uppercase: true, // selalu simpan dalam huruf kapital
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false, // tidak ikut terambil di query biasa
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nameLabel: {
      type: String,
      required: [true, "Nama label perangkat wajib diisi."],
      trim: true,
      maxlength: [100, "Nama label maksimal 100 karakter."],
    },
    statusOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true, // false = perangkat dinonaktifkan
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query cepat berdasarkan userId
DeviceSchema.index({ userId: 1 });

const Device =
  mongoose.models.Device || mongoose.model("Device", DeviceSchema);

export default Device;