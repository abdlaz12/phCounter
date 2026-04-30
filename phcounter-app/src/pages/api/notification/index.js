import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import batch from "@/models/batch"; // Wajib import model Batch untuk populate
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    await connectDB();
    if (req.method !== "GET") return res.status(405).json({ success: false });

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    // PERBAIKAN: Gunakan .populate() untuk mengambil info dari model Batch
    const notifications = await Notification.find({ userId })
      .populate("batchId", "nameBatch") // Mengambil field 'nameBatch' saja dari collection Batches
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}