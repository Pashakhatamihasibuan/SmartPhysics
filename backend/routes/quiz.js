const express    = require("express");
const router     = express.Router();
const QuizResult = require("../models/QuizResult");

/* ─────────────────────────────────────
   POST /api/quiz
   Simpan hasil quiz baru
───────────────────────────────────── */
router.post("/", async (req, res) => {
  try {
    const { name, score, topic, timeUsed, answers } = req.body;

    // Validasi
    if (score === undefined || score === null) {
      return res.status(400).json({ success: false, message: "Score wajib diisi." });
    }

    const correctCount = answers
      ? answers.reduce((acc, a, i) => {
          const correct = [1, 1, 2, 2, 1, 1, 1, 0, 1, 1]; // answer key
          return acc + (a === correct[i] ? 1 : 0);
        }, 0)
      : Math.round(score / 10);

    const result = await QuizResult.create({
      name:         name || "Anonim",
      score,
      topic:        topic || "Hukum Newton",
      timeUsed:     timeUsed || 0,
      answers:      answers  || [],
      correctCount,
    });

    res.status(201).json({
      success: true,
      message: "Skor berhasil disimpan!",
      data:    result,
    });
  } catch (err) {
    console.error("POST /quiz error:", err.message);
    res.status(500).json({ success: false, message: "Gagal menyimpan skor.", error: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/quiz/leaderboard
   Top 20 skor tertinggi
───────────────────────────────────── */
router.get("/leaderboard", async (req, res) => {
  try {
    const { topic, limit = 20 } = req.query;
    const filter = topic ? { topic } : {};

    const leaderboard = await QuizResult.find(filter)
      .sort({ score: -1, timeUsed: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .select("name score topic timeUsed grade createdAt -_id");

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil leaderboard." });
  }
});

/* ─────────────────────────────────────
   GET /api/quiz/stats
   Statistik keseluruhan
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
        },
      },
    ]);

    const gradeDistribution = await QuizResult.aggregate([
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort:  { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        avgScore:          agg ? Math.round(agg.avgScore * 10) / 10 : 0,
        maxScore:          agg?.maxScore     ?? 0,
        minScore:          agg?.minScore     ?? 0,
        totalEntries:      agg?.totalEntries ?? 0,
        avgTimeSeconds:    agg ? Math.round(agg.avgTime) : 0,
        gradeDistribution,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil statistik." });
  }
});

/* ─────────────────────────────────────
   GET /api/quiz/recent
   10 hasil terbaru
───────────────────────────────────── */
router.get("/recent", async (req, res) => {
  try {
    const recent = await QuizResult.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name score topic grade createdAt -_id");

    res.json({ success: true, data: recent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil data terbaru." });
  }
});

/* ─────────────────────────────────────
   GET /api/quiz
   Semua data (admin)
───────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, topic } = req.query;
    const filter = topic ? { topic } : {};
    const skip   = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      QuizResult.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      QuizResult.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page:       parseInt(page),
        limit:      parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil data." });
  }
});

/* ─────────────────────────────────────
   DELETE /api/quiz/:id
   Hapus satu hasil
───────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await QuizResult.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, message: "Data berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus data." });
  }
});

module.exports = router;
