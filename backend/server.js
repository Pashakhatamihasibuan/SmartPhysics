const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const quizRoutes = require("./routes/quiz");
const progressRoutes = require("./routes/progress");
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/questions");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

/* ─── CORS — harus sebelum semua route ─── */
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (Postman, curl) dan localhost apapun
    const allowed = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origin tidak diizinkan — " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "*"],
  credentials: true,
  optionsSuccessStatus: 200, // penting untuk browser lama
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS untuk semua route
app.options("*", cors(corsOptions));

/* ─── Middleware ─── */
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

/* ─── Routes ─── */
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes);

/* ─── Health Check ─── */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "SmartPhysics API",
    version: "1.1.0",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    routes: [
      "/api/quiz",
      "/api/questions",
      "/api/admin",
      "/api/auth",
      "/api/progress",
    ],
  });
});

/* ─── 404 Handler ─── */
app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `Route ${req.originalUrl} tidak ditemukan.`,
    });
});

/* ─── Global Error Handler ─── */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ─── MongoDB Connection ─── */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartphysics";

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ MongoDB terhubung:", MONGO_URI.split("@").pop());
    app.listen(PORT, () => {
      console.log(`\n🚀 SmartPhysics API    → http://localhost:${PORT}`);
      console.log(
        `📊 Health check        → http://localhost:${PORT}/api/health`,
      );
      console.log(`🔐 Admin login         → POST /api/auth/login`);
      console.log(`📝 Bank soal           → /api/questions\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Gagal terhubung ke MongoDB:", err.message);
    console.log("⚠️  Pastikan MongoDB berjalan: mongod --dbpath ./data/db");
    process.exit(1);
  });

module.exports = app;
