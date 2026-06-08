/**
 * SmartPhysics — Questions Seeder
 * Jalankan: node scripts/seedQuestions.js
 * Mengisi bank soal dari soal default (10 soal Hukum Newton)
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Question = require("../models/Question");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartphysics";

const DEFAULT_QUESTIONS = [
  {
    topic: "Newton I", order: 1, difficulty: "mudah",
    question: "Sebuah benda diam di atas meja. Pernyataan yang benar menurut Hukum Newton I adalah...",
    options: [
      "Benda bergerak karena ada gaya gravitasi",
      "Resultan gaya pada benda sama dengan nol",
      "Benda akan bergerak jika tidak ada meja",
      "Gaya normal menyebabkan benda bergerak ke atas",
    ],
    answer: 1,
    explanation: "Menurut Hukum Newton I, benda diam karena ΣF = 0. Gaya gravitasi (ke bawah) diimbangi gaya normal dari meja (ke atas), sehingga resultan = 0.",
  },
  {
    topic: "Newton II", order: 2, difficulty: "mudah",
    question: "Sebuah benda bermassa 10 kg diberi gaya resultan 50 N. Berapakah percepatan benda?",
    options: ["2 m/s²", "5 m/s²", "10 m/s²", "500 m/s²"],
    answer: 1,
    explanation: "Menggunakan F = ma → a = F/m = 50/10 = 5 m/s²",
  },
  {
    topic: "Newton II", order: 3, difficulty: "sedang",
    question: "Jika massa benda dijadikan 2 kali lipat sedangkan gaya tetap, maka percepatannya menjadi...",
    options: ["2 kali lebih besar", "Tetap sama", "½ kali (berkurang setengah)", "4 kali lebih besar"],
    answer: 2,
    explanation: "a = F/m. Jika m → 2m, maka a_baru = F/2m = a/2. Percepatan berkurang menjadi setengahnya.",
  },
  {
    topic: "Newton III", order: 4, difficulty: "sedang",
    question: "Roket dapat bergerak di luar angkasa karena menerapkan...",
    options: [
      "Hukum Newton I — kelembaman gas",
      "Hukum Newton II — percepatan konstan",
      "Hukum Newton III — aksi gas keluar, reaksi roket maju",
      "Gravitasi bumi yang menarik roket",
    ],
    answer: 2,
    explanation: "Roket menyemburkan gas ke belakang (aksi). Gas mendorong roket ke depan (reaksi). Ini adalah penerapan Hukum Newton III.",
  },
  {
    topic: "Newton I", order: 5, difficulty: "mudah",
    question: "Penumpang di dalam bus yang tiba-tiba berhenti akan terdorong ke depan karena...",
    options: [
      "Gaya rem bekerja pada penumpang",
      "Kelembaman penumpang mempertahankan geraknya",
      "Supir menekan pedal gas",
      "Gravitasi menarik penumpang ke depan",
    ],
    answer: 1,
    explanation: "Ini adalah Hukum Newton I (Inersia). Tubuh penumpang cenderung mempertahankan keadaan gerak ke depan, sehingga saat bus berhenti, tubuh terdorong ke depan.",
  },
  {
    topic: "Newton III", order: 6, difficulty: "sedang",
    question: "Ketika kamu berdiri di atas lantai, pasangan gaya aksi-reaksi yang benar adalah...",
    options: [
      "Berat badan ke bawah & gaya normal ke atas pada badanmu",
      "Badanmu menekan lantai ke bawah & lantai menekan badanmu ke atas",
      "Gravitasi bumi & gravitasi bulan",
      "Gaya normal ke atas & gaya gesek ke depan",
    ],
    answer: 1,
    explanation: "Pasangan aksi-reaksi Newton III harus bekerja pada DUA benda berbeda: kamu menekan lantai (aksi) dan lantai menekan kamu ke atas (reaksi).",
  },
  {
    topic: "Newton II", order: 7, difficulty: "mudah",
    question: "Satuan Newton (N) dalam SI setara dengan...",
    options: ["kg·m/s", "kg·m/s²", "kg·m²/s", "kg²·m/s²"],
    answer: 1,
    explanation: "Dari F = ma: [F] = [m][a] = kg × m/s² = N. Sehingga 1 Newton = 1 kg·m/s²",
  },
  {
    topic: "Newton I", order: 8, difficulty: "sulit",
    question: "Sebuah satelit mengorbit bumi dalam orbit melingkar sempurna. Pernyataan yang benar tentang kecepatan satelit adalah...",
    options: [
      "Kecepatan satelit konstan (sama besar, arah berubah)",
      "Kecepatan satelit bertambah terus",
      "Satelit tidak bergerak karena ΣF = 0",
      "Kecepatan satelit berkurang karena gravitasi",
    ],
    answer: 0,
    explanation: "Besar kecepatan (speed) satelit konstan, tapi arah kecepatan terus berubah mengikuti kurva orbit.",
  },
  {
    topic: "Newton II", order: 9, difficulty: "sedang",
    question: "Dua benda A (5 kg) dan B (10 kg) diberi gaya yang sama. Perbandingan percepatan a_A : a_B adalah...",
    options: ["1 : 2", "2 : 1", "1 : 1", "5 : 10"],
    answer: 1,
    explanation: "a = F/m. a_A = F/5, a_B = F/10. Rasio a_A/a_B = 10/5 = 2. Jadi a_A : a_B = 2 : 1",
  },
  {
    topic: "Newton III", order: 10, difficulty: "mudah",
    question: "Seorang perenang mendorong dinding kolam ke belakang. Apa yang menyebabkan perenang maju?",
    options: [
      "Gaya gravitasi air",
      "Dinding kolam mendorong balik perenang ke depan",
      "Perenang mengayuh air ke depan",
      "Tekanan air dari belakang",
    ],
    answer: 1,
    explanation: "Perenang mendorong dinding (aksi ke belakang) → dinding mendorong balik perenang ke depan (reaksi). Hukum Newton III.",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB terhubung\n");

    const existing = await Question.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  Sudah ada ${existing} soal di database.`);
      console.log("   Hapus manual via admin panel, atau tambah soal lewat admin.\n");
      console.log("   Untuk replace paksa, ubah baris ini di seed.js");
      await mongoose.disconnect();
      return;
    }

    const inserted = await Question.insertMany(DEFAULT_QUESTIONS);
    console.log(`✅ ${inserted.length} soal berhasil di-seed\n`);

    console.log("📝 Bank Soal:");
    console.log("─".repeat(50));
    inserted.forEach((q, i) => {
      console.log(`${i+1}. [${q.topic}][${q.difficulty}] ${q.question.substring(0,50)}...`);
    });
    console.log("─".repeat(50));
    console.log("\n✅ Seeding soal selesai!");
  } catch (err) {
    console.error("❌ Seeding gagal:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
