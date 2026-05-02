import { connectDB } from "@/lib/mongodb";
import SensorData from "@/models/SensorData";

export default async function handler(req, res) {
  // Hanya izinkan metode GET (SRS 3.4)
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { deviceId, batchId } = req.query;
    let query = {};
    
    // Prioritaskan pencarian berdasarkan batchId untuk akurasi data fermentasi
    if (batchId) {
      query.batchId = batchId;
    } else if (deviceId) {
      query.deviceId = deviceId;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Required deviceId or batchId parameter." 
      });
    }

    // Ambil 1 data terakhir berdasarkan timestamp (Fitur F-03: Real-time Monitoring)
    const latestData = await SensorData.findOne(query).sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(200).json({ 
        success: true, 
        data: null, 
        message: "No readings found for this criteria." 
      });
    }

    // Validasi Integritas Data (NFR 3.2: Memastikan data yang tampil logis 0-14)
    if (latestData.phValue < 0 || latestData.phValue > 14) {
      return res.status(200).json({ 
        success: true, 
        data: null, 
        message: "Invalid sensor data detected in record." 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: latestData 
    });

  } catch (error) {
    console.error("LATEST READING API ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
}