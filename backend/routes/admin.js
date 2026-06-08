const express        = require("express");
const router         = express.Router();
const QuizResult     = require("../models/QuizResult");
const authMiddleware = require("../middleware/auth");

// Semua route di sini butuh auth admin
router.use(authMiddleware);

/* ─────────────────────────────────────
   GET /api/admin/results
   Semua hasil quiz dengan filter & paginasi
───────────────────────────────────── */
router.get("/results", async (req, res) => {
  try {
    const { page = 1, limit = 20, topic, grade, search } = req.query;
    const filter = {};
    if (topic)  filter.topic = topic;
    if (grade)  filter.grade = grade;
    if (search) filter.name  = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      QuizResult.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      QuizResult.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil data." });
  }
});

/* ─────────────────────────────────────
   GET /api/admin/stats
   Dashboard statistik admin
───────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const [agg] = await QuizResult.aggregate([
      {
        $group: {
          _id:          null,
          avgScore:     { $avg: "$score" },
          maxScore:     { $max: "$score" },
          minScore:     { $min: "$score" },
          totalEntries: { $sum: 1 },
          avgTime:      { $avg: "$timeUsed" },
          passCount:    { $sum: { $cond: [{ $gte: ["$score", 60] }, 1, 0] } },
        },
      },
    ]);

    const gradeDistribution = await QuizResult.aggregate([
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort:  { _id: 1 } },
    ]);

    const topicDistribution = await QuizResult.aggregate([
      { $group: { _id: "$topic", count: { $sum: 1 }, avg: { $avg: "$score" } } },
    ]);

    // Tren 7 hari terakhir
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyTrend = await QuizResult.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id:   { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          avg:   { $avg: "$score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalEntries:     agg?.totalEntries ?? 0,
        avgScore:         agg ? Math.round(agg.avgScore * 10) / 10 : 0,
        maxScore:         agg?.maxScore     ?? 0,
        minScore:         agg?.minScore     ?? 0,
        avgTimeSeconds:   agg ? Math.round(agg.avgTime)              : 0,
        passCount:        agg?.passCount    ?? 0,
        passRate:         agg ? Math.round((agg.passCount / agg.totalEntries) * 100) : 0,
        gradeDistribution,
        topicDistribution,
        dailyTrend,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil statistik." });
  }
});

/* ─────────────────────────────────────
   DELETE /api/admin/results/:id
   Hapus satu hasil quiz
───────────────────────────────────── */
router.delete("/results/:id", async (req, res) => {
  try {
    const deleted = await QuizResult.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, message: `Data "${deleted.name}" berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus data." });
  }
});

/* ─────────────────────────────────────
   DELETE /api/admin/results
   Hapus semua hasil quiz
───────────────────────────────────── */
router.delete("/results", async (req, res) => {
  try {
    const { confirm } = req.body;
    if (confirm !== "RESET_ALL") {
      return res.status(400).json({ success: false, message: 'Kirim { confirm: "RESET_ALL" } untuk konfirmasi.' });
    }
    const result = await QuizResult.deleteMany({});
    res.json({ success: true, message: `${result.deletedCount} data berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mereset data." });
  }
});

/* ─────────────────────────────────────
   PATCH /api/admin/results/:id
   Edit nama atau skor
───────────────────────────────────── */
router.patch("/results/:id", async (req, res) => {
  try {
    const { name, score } = req.body;
    const update = {};
    if (name  !== undefined) update.name  = name;
    if (score !== undefined) update.score = score;

    const updated = await QuizResult.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, message: "Data berhasil diperbarui.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memperbarui data." });
  }
});

/* ─────────────────────────────────────
   GET /api/admin/export
   Export semua data ke CSV format
───────────────────────────────────── */
// Support token via query param for file downloads
router.get("/export", async (req, res) => {
  try {
    const data = await QuizResult.find().sort({ createdAt: -1 });

    const header = "Nama,Skor,Grade,Topik,Waktu (detik),Benar,Tanggal\n";
    const rows = data.map(d => {
      const tgl = new Date(d.createdAt).toLocaleDateString("id-ID");
      return `"${d.name}",${d.score},${d.grade},"${d.topic}",${d.timeUsed},${d.correctCount},"${tgl}"`;
    }).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="smartphysics-results-${Date.now()}.csv"`);
    res.send("\uFEFF" + header + rows); // BOM for Excel UTF-8
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal export data." });
  }
});

module.exports = router;

/* Allow token via query string for CSV download links */
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "smartphysics-admin-secret-2025";

router.get("/export/csv", async (req, res) => {
  // Verify token from query param (for browser download links)
  const token = req.query.token || (req.headers.authorization || "").split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("not admin");
  } catch {
    return res.status(401).json({ success: false, message: "Token tidak valid." });
  }

  try {
    const QuizResult = require("../models/QuizResult");
    const data = await QuizResult.find().sort({ createdAt: -1 });
    const header = "Nama,Skor,Grade,Topik,Waktu (detik),Benar,Tanggal\n";
    const rows = data.map(d => {
      const tgl = new Date(d.createdAt).toLocaleDateString("id-ID");
      return `"${d.name}",${d.score},${d.grade},"${d.topic}",${d.timeUsed},${d.correctCount},"${tgl}"`;
    }).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="smartphysics-${Date.now()}.csv"`);
    res.send("\uFEFF" + header + rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal export." });
  }
});
