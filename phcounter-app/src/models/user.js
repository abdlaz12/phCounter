import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Nama depan wajib diisi."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Nama belakang wajib diisi."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password wajib diisi."],
      select: false, 
    },
    role: {
      type: String,
      enum: ["UMKM", "Pemula", "Admin"],
      default: "Pemula",
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    // --- Fitur Baru: Notification Preferences ---
    preferences: {
      notifyPhAlert: { 
        type: Boolean, 
        default: true 
      },
      notifyBatchStatus: { 
        type: Boolean, 
        default: true 
      },
      notifySystemUpdate: { 
        type: Boolean, 
        default: false 
      }
    },
    // --- Field untuk Verifikasi Registrasi ---
    otpCode: { 
      type: String, 
      default: null 
    },
    otpExpires: { 
      type: Date, 
      default: null 
    },
    // --- Field untuk Forgot Password ---
    passwordResetToken: { 
      type: String, 
      default: null 
    },
    passwordResetExpires: { 
      type: Date, 
      default: null 
    }
  },
  { timestamps: true }
);

// --- Hashing password sebelum simpan ---
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (err) {
    throw err;
  }
});

// --- Method untuk cek password saat login ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// --- Method untuk ambil data aman ---
userSchema.methods.toSafeObject = function () {
  const userObj = this.toObject();
  return {
    _id: userObj._id,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    fullName: `${userObj.firstName} ${userObj.lastName}`,
    email: userObj.email,
    role: userObj.role,
    isVerified: userObj.isVerified,
    preferences: userObj.preferences, // Sertakan ini agar FE bisa baca settingan toggle
    createdAt: userObj.createdAt
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;