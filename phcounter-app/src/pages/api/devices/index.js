// src/pages/api/devices/index.js
/**
 * GET  /api/devices — ambil semua perangkat milik user yang login
 * POST /api/devices — daftarkan perangkat baru via Device ID
 */

import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";
import { withAuth } from "@/lib/authMiddleware";
import crypto from "crypto";

async function handler(req, res) {
  await connectDB();

  // ── GET: ambil semua perangkat milik user ───────────────────────────────────
  if (req.method === "GET") {
    const devices = await Device.find({
      userId: req.user.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: devices,
    });
  }

  // ── POST: daftarkan perangkat baru ──────────────────────────────────────────
  if (req.method === "POST") {
    const { deviceId, nameLabel } = req.body;

    // Validasi input
    if (!deviceId || !nameLabel) {
      return res.status(400).json({
        success: false,
        message: "Device ID dan nama label wajib diisi.",
      });
    }

    if (nameLabel.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Nama label minimal 3 karakter.",
      });
    }

    // Cek apakah Device ID sudah terdaftar
    const existingDevice = await Device.findOne({
      deviceId: deviceId.trim().toUpperCase(),
    });

    if (existingDevice) {
      return res.status(409).json({
        success: false,
        message:
          "Device ID ini sudah terdaftar. Pastikan Device ID yang kamu masukkan benar.",
      });
    }

    // Generate API Key unik untuk perangkat ini
    const apiKey = crypto.randomBytes(32).toString("hex");

    // Simpan perangkat baru
    const newDevice = await Device.create({
      deviceId: deviceId.trim().toUpperCase(),
      apiKey,
      userId: req.user.userId,
      nameLabel: nameLabel.trim(),
    });

    // Kembalikan data device beserta apiKey (hanya saat pertama dibuat)
    return res.status(201).json({
      success: true,
      message: "Perangkat berhasil didaftarkan!",
      data: {
        _id: newDevice._id,
        deviceId: newDevice.deviceId,
        nameLabel: newDevice.nameLabel,
        statusOnline: newDevice.statusOnline,
        lastSeen: newDevice.lastSeen,
        isActive: newDevice.isActive,
        createdAt: newDevice.createdAt,
        // API Key ditampilkan HANYA saat pertama kali didaftarkan
        // User harus copy dan taruh di firmware ESP32/Wokwi
        apiKey,
      },
    });
  }

  return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
}

export default withAuth(handler);