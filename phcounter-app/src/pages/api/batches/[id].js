// src/pages/api/batches/[id].js
/**
 * GET    /api/batches/[id] — detail satu batch
 * PATCH  /api/batches/[id] — update batch (nama, status, catatan)
 * DELETE /api/batches/[id] — hapus batch
 */

import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/batch";
import { withAuth } from "@/lib/authMiddleware";

async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  // Cari batch dan pastikan milik user yang login
  const batch = await Batch.findOne({
    _id: id,
    userId: req.user.userId,
  }).populate("deviceId", "deviceId nameLabel statusOnline lastSeen");

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Batch tidak ditemukan.",
    });
  }

  // ── GET: detail batch ───────────────────────────────────────────────────────
  if (req.method === "GET") {
    // Hitung durasi batch (hari)
    const startDate = new Date(batch.startDate);
    const endDate = batch.endDate ? new Date(batch.endDate) : new Date();
    const durationDays = Math.floor(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    return res.status(200).json({
      success: true,
      data: {
        ...batch.toObject(),
        durationDays,
      },
    });
  }

  // ── PATCH: update batch ─────────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const { nameBatch, status, notes } = req.body;

    if (nameBatch !== undefined) {
      if (nameBatch.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Nama batch minimal 3 karakter.",
        });
      }
      batch.nameBatch = nameBatch.trim();
    }

    if (status !== undefined) {
      const validStatus = ["Aktif", "Selesai", "Anomali"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status tidak valid. Pilih: Aktif, Selesai, atau Anomali.",
        });
      }
      batch.status = status;

      // Set endDate otomatis saat batch ditandai Selesai
      if (status === "Selesai" && !batch.endDate) {
        batch.endDate = new Date();
      }
    }

    if (notes !== undefined) {
      batch.notes = notes ? notes.trim() : null;
    }

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch berhasil diperbarui.",
      data: batch,
    });
  }

  // ── DELETE: hapus batch ─────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    await Batch.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Batch berhasil dihapus.",
    });
  }

  return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
}

export default withAuth(handler);