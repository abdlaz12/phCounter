import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // Sesuai Collection 1: 'Users' di Model Data Konseptual (Bagian 4.3)
    name: {
      type: String,
      required: [true, "Nama wajib diisi."],
      trim: true,
      minlength: [2, "Nama minimal 2 karakter."],
      maxlength: [100, "Nama maksimal 100 karakter."],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Format email tidak valid.",
      ],
    },
    // Disimpan sebagai bcrypt hash — TIDAK PERNAH plain-text (sesuai NFR 3.2)
    passwordHash: {
      type: String,
      required: [true, "Password wajib diisi."],
      select: false, // tidak ikut terambil di query biasa
    },
    role: {
      type: String,
      enum: {
        values: ["UMKM", "Pemula", "Admin"],
        message: "Role harus salah satu dari: UMKM, Pemula, Admin.",
      },
      default: "Pemula",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    // Untuk fitur Lupa Password (F-01 Acceptance Criteria no. 7)
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // otomatis tambah createdAt & updatedAt
  }
);

// ─── Pre-save hook: hash password sebelum disimpan ───────────────────────────
UserSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// ─── Instance method: bandingkan password input dengan hash ──────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ─── Instance method: data aman untuk dikirim ke client ──────────────────────
UserSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Cegah model redefinition saat hot-reload Next.js
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;