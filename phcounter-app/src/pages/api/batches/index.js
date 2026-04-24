// src/pages/api/batches/index.js
/**
 * GET  /api/batches — ambil semua batch milik user
 * POST /api/batches — buat batch baru
 */

import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/batch";
import Device from "@/models/device";
import { withAuth } from "@/lib/authMiddleware";

async function handler(req, res) {
  await connectDB();

  // ── GET: ambil semua batch milik user ───────────────────────────────────────
  if (req.method === "GET") {
    const { status } = req.query;

    const filter = { userId: req.user.userId };
    if (status) filter.status = status;

    const batches = await Batch.find(filter)
      .populate("deviceId", "deviceId nameLabel statusOnline")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: batches.length,
      data: batches,
    });
  }

  // ── POST: buat batch baru ───────────────────────────────────────────────────
  if (req.method === "POST") {
    const { nameBatch, startDate, deviceId, notes } = req.body;

    // Validasi input wajib
    const errors = [];
    if (!nameBatch || nameBatch.trim().length < 3) {
      errors.push("Nama batch wajib diisi dan minimal 3 karakter.");
    }
    if (!startDate) {
      errors.push("Tanggal mulai wajib diisi.");
    }
    if (!deviceId) {
      errors.push("Device wajib dipilih.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    // Pastikan device milik user yang login
    const device = await Device.findOne({
      _id: deviceId,
      userId: req.user.userId,
      isActive: true,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Perangkat tidak ditemukan atau bukan milik Anda.",
      });
    }

    // Buat batch baru
    const newBatch = await Batch.create({
      userId: req.user.userId,
      deviceId,
      nameBatch: nameBatch.trim(),
      startDate: new Date(startDate),
      notes: notes ? notes.trim() : null,
    });

    // Populate device info untuk response
    await newBatch.populate("deviceId", "deviceId nameLabel statusOnline");

    return res.status(201).json({
      success: true,
      message: "Batch fermentasi berhasil dibuat!",
      data: newBatch,
    });
  }

  return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
}

export default withAuth(handler);