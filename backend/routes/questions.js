const express      = require("express");
const router       = express.Router();
const Question     = require("../models/Question");
const authMiddleware = require("../middleware/auth");

/* ─────────────────────────────────────
   GET /api/questions
   Ambil semua soal (publik — untuk quiz siswa)
   Query: ?topic=Newton+I&active=true
───────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const { topic, active = "true", difficulty } = req.query;
    const filter = {};
    if (topic)      filter.topic      = topic;
    if (active)     filter.isActive   = active === "true";
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .select("-__v");

    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil soal." });
  }
});

/* ─────────────────────────────────────
   GET /api/questions/:id
   Detail satu soal
───────────────────────────────────── */
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Soal tidak ditemukan." });
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil soal." });
  }
});

/* ─────────────────────────────────────
   POST /api/questions  [ADMIN ONLY]
   Buat soal baru
───────────────────────────────────── */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { topic, question, options, answer, explanation, difficulty, order } = req.body;

    // Validasi manual
    if (!question || !options || answer === undefined) {
      return res.status(400).json({ success: false, message: "question, options, dan answer wajib diisi." });
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ success: false, message: "options harus berupa array dengan tepat 4 elemen." });
    }
    if (answer < 0 || answer > 3) {
      return res.status(400).json({ success: false, message: "answer harus antara 0 dan 3." });
    }

    const newQuestion = await Question.create({
      topic, question, options, answer, explanation, difficulty, order,
      createdBy: req.admin.username,
    });

    res.status(201).json({ success: true, message: "Soal berhasil dibuat!", data: newQuestion });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }
    res.status(500).json({ success: false, message: "Gagal membuat soal.", error: err.message });
  }
});

/* ─────────────────────────────────────
   PUT /api/questions/:id  [ADMIN ONLY]
   Update soal
───────────────────────────────────── */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { topic, question, options, answer, explanation, difficulty, isActive, order } = req.body;

    if (options && (!Array.isArray(options) || options.length !== 4)) {
      return res.status(400).json({ success: false, message: "options harus array dengan 4 elemen." });
    }

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { topic, question, options, answer, explanation, difficulty, isActive, order },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Soal tidak ditemukan." });
    res.json({ success: true, message: "Soal berhasil diperbarui!", data: updated });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }
    res.status(500).json({ success: false, message: "Gagal mengupdate soal." });
  }
});

/* ─────────────────────────────────────
   PATCH /api/questions/:id/toggle  [ADMIN ONLY]
   Aktifkan / nonaktifkan soal
───────────────────────────────────── */
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Soal tidak ditemukan." });

    question.isActive = !question.isActive;
    await question.save();

    res.json({
      success: true,
      message: `Soal berhasil ${question.isActive ? "diaktifkan" : "dinonaktifkan"}.`,
      data:    question,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengubah status soal." });
  }
});

/* ─────────────────────────────────────
   PATCH /api/questions/reorder  [ADMIN ONLY]
   Ubah urutan soal
───────────────────────────────────── */
router.patch("/reorder/bulk", authMiddleware, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }, ...]
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: "orders harus berupa array." });
    }

    await Promise.all(
      orders.map(({ id, order }) =>
        Question.findByIdAndUpdate(id, { order }, { new: true })
      )
    );

    res.json({ success: true, message: "Urutan soal berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengubah urutan." });
  }
});

/* ─────────────────────────────────────
   DELETE /api/questions/:id  [ADMIN ONLY]
   Hapus satu soal
───────────────────────────────────── */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Soal tidak ditemukan." });
    res.json({ success: true, message: "Soal berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus soal." });
  }
});

/* ─────────────────────────────────────
   DELETE /api/questions  [ADMIN ONLY]
   Hapus semua soal (reset bank soal)
───────────────────────────────────── */
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const { confirm } = req.body;
    if (confirm !== "HAPUS_SEMUA") {
      return res.status(400).json({ success: false, message: 'Kirim { confirm: "HAPUS_SEMUA" } untuk konfirmasi.' });
    }
    const result = await Question.deleteMany({});
    res.json({ success: true, message: `${result.deletedCount} soal berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghapus semua soal." });
  }
});

module.exports = router;
