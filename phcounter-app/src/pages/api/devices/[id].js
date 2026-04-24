// src/pages/api/devices/[id].js
/**
 * GET    /api/devices/[id] — detail satu perangkat
 * PATCH  /api/devices/[id] — update nama label perangkat
 * DELETE /api/devices/[id] — nonaktifkan/hapus perangkat
 */

import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";
import { withAuth } from "@/lib/authMiddleware";

async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  // Cari device dan pastikan milik user yang login
  const device = await Device.findOne({
    _id: id,
    userId: req.user.userId,
  });

  if (!device) {
    return res.status(404).json({
      success: false,
      message: "Perangkat tidak ditemukan.",
    });
  }

  // ── GET: detail perangkat ───────────────────────────────────────────────────
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      data: device,
    });
  }

  // ── PATCH: update nama label ────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const { nameLabel, isActive } = req.body;

    if (nameLabel !== undefined) {
      if (nameLabel.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Nama label minimal 3 karakter.",
        });
      }
      device.nameLabel = nameLabel.trim();
    }

    // Aktifkan atau nonaktifkan perangkat
    if (isActive !== undefined) {
      device.isActive = isActive;
    }

    await device.save();

    return res.status(200).json({
      success: true,
      message: "Perangkat berhasil diperbarui.",
      data: device,
    });
  }

  // ── DELETE: hapus perangkat ─────────────────────────────────────────────────
  if (req.method === "DELETE") {
    await Device.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Perangkat berhasil dihapus.",
    });
  }

  return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
}

export default withAuth(handler);