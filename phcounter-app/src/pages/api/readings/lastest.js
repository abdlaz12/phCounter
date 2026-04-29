import { connectDB } from "@/lib/mongodb";
import SensorData from "@/models/SensorData";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  await connectDB();

  try {
    const { deviceId, batchId } = req.query;
    let query = {};
    
    if (batchId) query.batchId = batchId;
    else if (deviceId) query.deviceId = deviceId;
    else return res.status(400).json({ message: "Required deviceId or batchId" });

    // Ambil 1 data terakhir (F-03)
    const latest = await SensorData.findOne(query).sort({ timestamp: -1 });

    return res.status(200).json({ success: true, data: latest });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}