const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");

const JWT_SECRET  = process.env.JWT_SECRET  || "smartphysics-admin-secret-2025";
const ADMIN_USER  = process.env.ADMIN_USER  || "admin";
const ADMIN_PASS  = process.env.ADMIN_PASS  || "smartphysics123";
const TOKEN_EXPIRY = "8h";

/* ─────────────────────────────────────
   POST /api/auth/login
   Login admin → dapat JWT token
───────────────────────────────────── */
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
    }

    // Verifikasi kredensial
    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      // Delay kecil untuk mencegah brute force
      return setTimeout(() => {
        res.status(401).json({ success: false, message: "Username atau password salah." });
      }, 800);
    }

    // Generate JWT
    const token = jwt.sign(
      { username, role: "admin", loginAt: new Date().toISOString() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      success: true,
      message: "Login berhasil!",
      token,
      admin: { username, role: "admin" },
      expiresIn: TOKEN_EXPIRY,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal login.", error: err.message });
  }
});

/* ─────────────────────────────────────
   POST /api/auth/verify
   Cek apakah token masih valid
───────────────────────────────────── */
router.post("/verify", (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token wajib diisi." });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, valid: true, admin: decoded });
  } catch {
    res.json({ success: false, valid: false, message: "Token tidak valid atau kadaluarsa." });
  }
});

module.exports = router;
