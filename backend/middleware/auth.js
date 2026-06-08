const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smartphysics-admin-secret-2025";

/**
 * Middleware: verifikasi JWT token dari header Authorization
 * Header format: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya admin yang diizinkan.",
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token kadaluarsa. Silakan login ulang." });
    }
    return res.status(401).json({ success: false, message: "Token tidak valid." });
  }
};

module.exports = authMiddleware;
