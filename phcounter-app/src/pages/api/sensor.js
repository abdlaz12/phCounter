// src/pages/api/sensor.js
import { connectDB } from '../../lib/mongodb';
import SensorData from '../../models/SensorData';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const { phValue, turbidityValue } = req.body;
      const newData = await SensorData.create({ phValue, turbidityValue });
      return res.status(201).json({ success: true, data: newData });
    } catch (error) {
      return res.status(500).json({ success: false, error });
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