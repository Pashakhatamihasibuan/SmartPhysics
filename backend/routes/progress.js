const express  = require("express");
const router   = express.Router();
const Progress = require("../models/Progress");

/* ─────────────────────────────────────
   GET /api/progress/:sessionId
───────────────────────────────────── */
router.get("/:sessionId", async (req, res) => {
  try {
    let progress = await Progress.findOne({ sessionId: req.params.sessionId });
    if (!progress) {
      progress = await Progress.create({ sessionId: req.params.sessionId });
    }
    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil progress." });
  }
});

/* ─────────────────────────────────────
   PATCH /api/progress/:sessionId
   Update halaman yang sudah selesai
───────────────────────────────────── */
router.patch("/:sessionId", async (req, res) => {
  try {
    const { completedPage, simulasiMode, lastVisited, name, timeSpent } = req.body;

    const update = {};
    if (completedPage)  update["$addToSet"] = { completedPages:  completedPage };
    if (simulasiMode)   update["$addToSet"] = { ...(update["$addToSet"] || {}), simulasiUsed: simulasiMode };
    if (lastVisited)    update["$set"]      = { lastVisited };
    if (name)           update["$set"]      = { ...(update["$set"] || {}), name };
    if (timeSpent)      update["$inc"]      = { totalTimeSpent: timeSpent };

    const progress = await Progress.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      update,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal update progress." });
  }
});

module.exports = router;
