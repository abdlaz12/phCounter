import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  // 1. Ubah String jadi ObjectId agar bisa pakai .populate()
  deviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Device', 
    required: true,
    index: true // Penting untuk performa saat data sudah ribuan
  },

  // 2. WAJIB ADA: Link ke Batch yang sedang berjalan (F-06)
  batchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch', 
    required: false, // False agar data tetap masuk meski batch belum start
    index: true 
  },

  phValue: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 14 
  },

  status: { 
    type: String, 
    enum: ['Normal', 'Perhatian', 'Anomali'], 
    default: 'Normal' 
  },

  timestamp: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.SensorData || mongoose.model('SensorData', SensorDataSchema);