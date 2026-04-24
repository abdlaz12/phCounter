// src/pages/api/devices/heartbeat.js
/**
 * POST /api/devices/heartbeat
 *
 * Dipanggil oleh ESP32/Wokwi secara berkala untuk update status online.
 * Autentikasi menggunakan API Key (bukan JWT) sesuai NFR 3.2.
 *
 * Header: x-api-key: <apiKey>
 * Body:   { deviceId: "ESP32-001" }
 */

import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  await connectDB();

  const apiKey = req.headers["x-api-key"];
  const { deviceId } = req.body;

  if (!apiKey || !deviceId) {
    return res.status(400).json({
      success: false,
      message: "API Key dan Device ID wajib disertakan.",
    });
  }

  // Cari device berdasarkan deviceId dan apiKey
  const device = await Device.findOne({
    deviceId: deviceId.toUpperCase(),
  }).select("+apiKey");

  if (!device || device.apiKey !== apiKey) {
    return res.status(401).json({
      success: false,
      message: "API Key tidak valid.",
    });
  }

  // Update status online dan lastSeen
  device.statusOnline = true;
  device.lastSeen = new Date();
  await device.save();

  return res.status(200).json({
    success: true,
    message: "Heartbeat diterima.",
    data: {
      deviceId: device.deviceId,
      statusOnline: device.statusOnline,
      lastSeen: device.lastSeen,
    },
  });
}