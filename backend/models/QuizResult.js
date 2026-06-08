const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Nama wajib diisi"],
      trim:      true,
      maxlength: [60, "Nama maksimal 60 karakter"],
      default:   "Anonim",
    },
    score: {
      type:    Number,
      required: true,
      min:     [0,   "Skor tidak boleh negatif"],
      max:     [100, "Skor maksimal 100"],
    },
    topic: {
      type:    String,
      default: "Hukum Newton",
      enum:    ["Hukum Newton", "Gerak Parabola", "Listrik Dinamis", "Gelombang"],
    },
    timeUsed: {
      type:    Number,  // detik
      default: 0,
      min:     0,
    },
    answers: {
      type:    [Number],  // array index jawaban
      default: [],
    },
    grade: {
      type: String,
      enum: ["A","B","C","D","E"],
    },
    correctCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,  // createdAt, updatedAt otomatis
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

/* ── Virtual: Grade otomatis dari skor ── */
quizResultSchema.pre("save", function (next) {
  if      (this.score >= 90) this.grade = "A";
  else if (this.score >= 80) this.grade = "B";
  else if (this.score >= 70) this.grade = "C";
  else if (this.score >= 60) this.grade = "D";
  else                        this.grade = "E";
  next();
});

/* ── Index untuk leaderboard query ── */
quizResultSchema.index({ score: -1, timeUsed: 1 });
quizResultSchema.index({ topic: 1 });
quizResultSchema.index({ createdAt: -1 });

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
module.exports = QuizResult;
