// src/models/SensorData.js
import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  device_id:  { type: String, required: true },
  phValue:    { type: Number, required: true, min: 0, max: 14 },
  status:     { type: String, enum: ['Normal', 'Perhatian', 'Anomali'], default: 'Normal' },
  timestamp:  { type: Date, default: Date.now },
});

export default mongoose.models.SensorData || 
  mongoose.model('SensorData', SensorDataSchema);