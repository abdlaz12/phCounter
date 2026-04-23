import { getTokenFromRequest } from "./jwt";

/**
 * Higher-order function to protect API routes with JWT auth.
 *
 * Usage in any API route:
 *   export default withAuth(async function handler(req, res) {
 *     // req.user is now available: { userId, email, role }
 *   });
 *
 * Optionally restrict to specific roles:
 *   export default withAuth(handler, ["Admin"]);
 */
export function withAuth(handler, allowedRoles = []) {
  return async function (req, res) {
    try {
      const decoded = getTokenFromRequest(req);
      req.user = decoded;

      // Role-based access control
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Anda tidak memiliki izin untuk resource ini.",
        });
      }

      return handler(req, res);
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            error.name === "TokenExpiredError"
              ? "Sesi telah berakhir. Silakan login kembali."
              : "Token tidak valid. Silakan login kembali.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }
  };
}