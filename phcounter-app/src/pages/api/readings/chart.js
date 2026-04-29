import { connectDB } from "@/lib/mongodb";
import SensorData from "@/models/SensorData";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  await connectDB();

  try {
    const { batchId, limit = 20 } = req.query;
    if (!batchId) return res.status(400).json({ message: "Batch ID is required" });

    // Ambil data terbatas untuk grafik agar tidak berat (F-04 & F-07)
    const chartData = await SensorData.find({ batchId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Balik urutan agar kronologis (dari lama ke baru)
    return res.status(200).json({ success: true, data: chartData.reverse() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}