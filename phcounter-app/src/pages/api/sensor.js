// src/pages/api/sensor.js
import { connectDB } from '../../lib/mongodb';
import SensorData from '../../models/SensorData';

const VALID_API_KEYS = {
  "ECO-KEY-001": "DEVICE_001",
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    // Cek API Key
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || !VALID_API_KEYS[apiKey]) {
      return res.status(401).json({ success: false, message: "API Key tidak valid" });
    }

    try {
      const { device_id, ph_level, status, timestamp } = req.body;

      // Validasi
      if (!device_id || ph_level === undefined || !timestamp) {
        return res.status(400).json({ success: false, message: "Field tidak lengkap" });
      }
      if (ph_level < 0 || ph_level > 14) {
        return res.status(400).json({ success: false, message: "Nilai pH tidak valid" });
      }

      const newData = await SensorData.create({
        device_id,
        phValue: ph_level,
        status,
        timestamp: new Date(timestamp),
      });

      return res.status(201).json({ success: true, data: newData });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const data = await SensorData.find().sort({ timestamp: -1 }).limit(10);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }
}