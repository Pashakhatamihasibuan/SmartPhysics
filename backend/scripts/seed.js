/**
 * SmartPhysics — Database Seeder
 * Jalankan: node scripts/seed.js
 * Mengisi database dengan data contoh untuk demo/presentasi
 */

require("dotenv").config({ path: "../.env" });
const mongoose   = require("mongoose");
const QuizResult = require("../models/QuizResult");
const Progress   = require("../models/Progress");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartphysics";

const SAMPLE_RESULTS = [
  { name: "Pasha Aditya",   score: 100, topic: "Hukum Newton", timeUsed: 312, correctCount: 10 },
  { name: "Fitriani Dewi",  score: 100, topic: "Hukum Newton", timeUsed: 290, correctCount: 10 },
  { name: "Rizky Pratama",  score: 90,  topic: "Hukum Newton", timeUsed: 420, correctCount: 9  },
  { name: "Aulia Rahman",   score: 90,  topic: "Hukum Newton", timeUsed: 398, correctCount: 9  },
  { name: "Dimas Susanto",  score: 80,  topic: "Hukum Newton", timeUsed: 510, correctCount: 8  },
  { name: "Siti Nurhaliza", score: 70,  topic: "Hukum Newton", timeUsed: 480, correctCount: 7  },
  { name: "Budi Santoso",   score: 60,  topic: "Hukum Newton", timeUsed: 540, correctCount: 6  },
  { name: "Maharani Putri", score: 80,  topic: "Hukum Newton", timeUsed: 385, correctCount: 8  },
  { name: "Fajar Nugraha",  score: 90,  topic: "Hukum Newton", timeUsed: 460, correctCount: 9  },
  { name: "Intan Permata",  score: 70,  topic: "Hukum Newton", timeUsed: 520, correctCount: 7  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB terhubung\n");

    // Clear existing
    await QuizResult.deleteMany({});
    await Progress.deleteMany({});
    console.log("🗑️  Data lama dihapus");

    // Insert quiz results
    const inserted = await QuizResult.insertMany(SAMPLE_RESULTS);
    console.log(`✅ ${inserted.length} data quiz berhasil di-seed`);

    // Print leaderboard
    console.log("\n📊 Leaderboard Preview:");
    console.log("─".repeat(45));
    inserted.sort((a,b) => b.score - a.score || a.timeUsed - b.timeUsed).forEach((r, i) => {
      const mm = String(Math.floor(r.timeUsed/60)).padStart(2,"0");
      const ss = String(r.timeUsed % 60).padStart(2,"0");
      console.log(`#${i+1} ${r.name.padEnd(18)} | ${r.score}/100 | ${r.grade} | ${mm}:${ss}`);
    });
    console.log("─".repeat(45));
    console.log("\n✅ Seeding selesai!");
  } catch (err) {
    console.error("❌ Seeding gagal:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
