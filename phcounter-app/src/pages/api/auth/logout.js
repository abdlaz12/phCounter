/**
 * POST /api/auth/logout
 *
 * Logout endpoint.
 * Karena JWT bersifat stateless, token tidak bisa dihapus dari server.
 * Endpoint ini hanya memberi sinyal sukses — tanggung jawab menghapus
 * token ada di sisi client (hapus dari localStorage / cookie).
 *
 * Header: Authorization: Bearer <token>  (opsional, untuk validasi)
 */

import { withAuth } from "@/lib/authMiddleware";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  // req.user tersedia dari withAuth: { userId, email, role }
  // Tidak ada yang perlu dilakukan di server untuk JWT logout.
  // Client wajib menghapus token setelah menerima response ini.

  return res.status(200).json({
    success: true,
    message: "Logout berhasil. Silakan hapus token di sisi client.",
  });
}

export default withAuth(handler);