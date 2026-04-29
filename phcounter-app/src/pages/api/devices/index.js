import { connectDB } from "@/lib/mongodb";
import Device from "@/models/device"; 
import jwt from "jsonwebtoken";
import crypto from "crypto";

export default async function handler(req, res) {
  await connectDB();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // PERBAIKAN: Mengikuti struktur token kamu yang menggunakan 'userId'
    const currentUserId = decoded.userId;

    if (!currentUserId) {
      return res.status(401).json({ 
        success: false, 
        message: "User ID not found in token structure" 
      });
    }

    // --- LOGIKA GET: LIST DEVICES ---
    if (req.method === "GET") {
      const devices = await Device.find({ userId: currentUserId }).select("+apiKey").sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: devices });
    }

    // --- LOGIKA POST: REGISTER DEVICE ---
    if (req.method === "POST") {
    const { deviceId, nameLabel } = req.body;
    
    // 1. Validasi input kosong
    if (!deviceId || !nameLabel) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 2. CEK DUPLIKASI: Pastikan deviceId atau nameLabel belum pernah terdaftar
    const existingDevice = await Device.findOne({
      $or: [
        { deviceId: deviceId.toUpperCase() },
        { nameLabel: { $regex: new RegExp(`^${nameLabel}$`, 'i') }, userId: currentUserId }
      ]
    });

    if (existingDevice) {
      const message = existingDevice.deviceId === deviceId.toUpperCase() 
        ? "Hardware ID (Wokwi ID) sudah terdaftar." 
        : "Asset Label sudah digunakan untuk alat lain.";
      return res.status(400).json({ success: false, message });
    }

    // 3. Generate API Key & Simpan
    const generatedApiKey = crypto.randomBytes(8).toString('hex');

    const newDevice = await Device.create({
      deviceId: deviceId.toUpperCase(),
      apiKey: generatedApiKey,
      userId: currentUserId,
      nameLabel,
    });

    return res.status(201).json({ 
      success: true, 
      message: "Device successfully registered",
      data: newDevice 
    });
  }

    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (error) {
    console.error("API ERROR:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
}