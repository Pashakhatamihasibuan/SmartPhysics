const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    sessionId: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    name: {
      type:    String,
      default: "Anonim",
      trim:    true,
    },
    completedPages: {
      type:    [String],
      default: [],
      enum:    ["pendahuluan", "materi", "simulasi", "evaluasi"],
    },
    simulasiUsed: {
      type:    [String],
      default: [],
    },
    lastVisited: {
      type:    String,
      default: "home",
    },
    totalTimeSpent: {
      type:    Number,  // detik
      default: 0,
    },
  },
  { timestamps: true }
);

const Progress = mongoose.model("Progress", progressSchema);
module.exports = Progress;
