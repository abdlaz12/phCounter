import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: [true, 'Nama batch wajib diisi'],
    trim: true,
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device', 
    required: true,
    index: true, // Tambahkan index untuk performa filter hardware
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Processing', 'Completed', 'Failed', 'Quality Check'],
    default: 'Processing',
  },
  // Disamakan dengan nama field di UI (targetYield)
  targetYield: {
    type: Number, // Pakai Number agar bisa dihitung rata-ratanya nanti
    default: 0,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);