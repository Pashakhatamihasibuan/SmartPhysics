const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    topic: {
      type:     String,
      required: [true, "Topik wajib diisi"],
      enum:     ["Newton I", "Newton II", "Newton III", "Gerak Parabola", "Umum"],
      default:  "Umum",
    },
    question: {
      type:      String,
      required:  [true, "Pertanyaan wajib diisi"],
      trim:      true,
      minlength: [10, "Pertanyaan minimal 10 karakter"],
    },
    options: {
      type:     [String],
      validate: {
        validator: (v) => v.length === 4,
        message:   "Harus tepat 4 pilihan jawaban",
      },
      required: true,
    },
    answer: {
      type:    Number,
      min:     0,
      max:     3,
      required: [true, "Index jawaban benar wajib diisi (0-3)"],
    },
    explanation: {
      type:    String,
      trim:    true,
      default: "",
    },
    difficulty: {
      type:    String,
      enum:    ["mudah", "sedang", "sulit"],
      default: "sedang",
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    order: {
      type:    Number,
      default: 0,
    },
    createdBy: {
      type:    String,
      default: "admin",
    },
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1, isActive: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ order: 1 });

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
