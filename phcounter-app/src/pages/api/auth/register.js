// src/pages/api/auth/register.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { sendEmail } from "@/lib/emailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false });

  try {
    await connectDB();
    const { firstName, lastName, email, password } = req.body;

    const lowerEmail = email.toLowerCase().trim();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 1. Cari apakah user sudah ada
    let user = await User.findOne({ email: lowerEmail });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: "Email sudah aktif." });
      }
      // Jika sudah ada tapi belum verifikasi, kita update datanya
      user.firstName = firstName;
      user.lastName = lastName;
      user.passwordHash = password; // Ini akan memicu pre("save") untuk hashing
      user.otpCode = generatedOtp;
      user.otpExpires = otpExpires;
    } else {
      // 2. Jika benar-benar baru, buat instance baru
      user = new User({
        firstName,
        lastName,
        email: lowerEmail,
        passwordHash: password, // Ini juga memicu pre("save")
        otpCode: generatedOtp,
        otpExpires: otpExpires,
      });
    }

    // 3. Simpan (Fungsi .save() akan menjalankan hashing di model)
    await user.save();

    // 4. Kirim Email
    await sendEmail({
      to: lowerEmail,
      subject: "[ecomonitor] Kode Verifikasi Anda",
      html: `<h2>Kode OTP: ${generatedOtp}</h2>`, // Sesuaikan template kamu
    });

    return res.status(201).json({ success: true, message: "OTP dikirim!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}