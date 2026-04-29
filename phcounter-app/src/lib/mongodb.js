// src/lib/mongodb.js
import mongoose from 'mongoose';

// Tambahkan baris ini tepat di bawah import
console.log('--- CEK KONEKSI ---');
console.log('Isi MONGODB_URI:', process.env.MONGODB_URI ? "Ditemukan (Aman)" : "KOSONG/TIDAK TERBACA");
console.log('-------------------');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI belum diset di .env.local');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// ✅ FIX: tambah default export agar bisa di-import sebagai `dbConnect`
export default connectDB;