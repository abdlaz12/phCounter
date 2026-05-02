import { connectDB } from "@/lib/mongodb";
import SensorData from "@/models/SensorData";

export default async function handler(req, res) {
  // Hanya izinkan metode GET sesuai spesifikasi API di DOC-2
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  await connectDB();

  try {
    const { batchId, range = '7d' } = req.query;

    if (!batchId) {
      return res.status(400).json({ success: false, message: "Batch ID is required" });
    }

    // --- Logika Filter Rentang Waktu (Sesuai DOC-2 F-04) ---
    const query = { batchId };
    const now = new Date();

    if (range === '7d') {
      // Filter data 7 hari terakhir
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      query.timestamp = { $gte: sevenDaysAgo };
    } else if (range === '30d') {
      // Filter data 30 hari terakhir
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      query.timestamp = { $gte: thirtyDaysAgo };
    }
    // Jika range 'all', query tidak difilter berdasarkan waktu (mengambil seluruh durasi batch)

    // Ambil data dengan limit dinamis agar performa tetap terjaga (NFR 3.1)
    // Sort descending (-1) untuk mengambil data terbaru terlebih dahulu
    const chartData = await SensorData.find(query)
      .sort({ timestamp: -1 })
      .limit(range === 'all' ? 1000 : 200); 

    /**
     * PENTING: Kita membalik urutan (.reverse()) sebelum dikirim ke frontend.
     * Tujuannya agar grafik di Dashboard menampilkan data secara kronologis 
     * (dari waktu terlama di kiri ke waktu terbaru di kanan).
     */
    return res.status(200).json({ 
      success: true, 
      range: range,
      count: chartData.length,
      data: chartData.reverse() 
    });

  } catch (error) {
    console.error("CHART API ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}