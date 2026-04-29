import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "Device ID is required."],
      unique: true,
      trim: true,
      uppercase: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false, // Hidden from normal queries
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nameLabel: {
      type: String,
      required: [true, "Label is required."],
      trim: true,
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
      default: true,
    },
  },
  { timestamps: true }
);

// PENTING: Gunakan pola ini agar tidak error saat hot-reload
const Device = mongoose.models.Device || mongoose.model("Device", DeviceSchema);

export default Device;