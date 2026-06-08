import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Ganti port sesuai backend kamu (5000 atau 8000) ──
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const QUESTIONS = [
  {
    id: 1, topic: "Newton I",
    question: "Sebuah benda diam di atas meja. Pernyataan yang benar menurut Hukum Newton I adalah...",
    options: ["Benda bergerak karena ada gaya gravitasi","Resultan gaya pada benda sama dengan nol","Benda akan bergerak jika tidak ada meja","Gaya normal menyebabkan benda bergerak ke atas"],
    answer: 1,
    explanation: "Menurut Hukum Newton I, benda diam karena ΣF = 0. Gaya gravitasi (ke bawah) diimbangi gaya normal dari meja (ke atas), sehingga resultan = 0.",
  },
  {
    id: 2, topic: "Newton II",
    question: "Sebuah benda bermassa 10 kg diberi gaya resultan 50 N. Berapakah percepatan benda?",
    options: ["2 m/s²","5 m/s²","10 m/s²","500 m/s²"],
    answer: 1,
    explanation: "Menggunakan F = ma → a = F/m = 50/10 = 5 m/s²",
  },
  {
    id: 3, topic: "Newton II",
    question: "Jika massa benda dijadikan 2 kali lipat sedangkan gaya tetap, maka percepatannya menjadi...",
    options: ["2 kali lebih besar","Tetap sama","½ kali (berkurang setengah)","4 kali lebih besar"],
    answer: 2,
    explanation: "a = F/m. Jika m → 2m, maka a_baru = F/2m = a/2. Percepatan berkurang menjadi setengahnya.",
  },
  {
    id: 4, topic: "Newton III",
    question: "Roket dapat bergerak di luar angkasa karena menerapkan...",
    options: ["Hukum Newton I — kelembaman gas","Hukum Newton II — percepatan konstan","Hukum Newton III — aksi gas keluar, reaksi roket maju","Gravitasi bumi yang menarik roket"],
    answer: 2,
    explanation: "Roket menyemburkan gas ke belakang (aksi). Gas mendorong roket ke depan (reaksi). Ini adalah penerapan Hukum Newton III.",
  },
  {
    id: 5, topic: "Newton I",
    question: "Penumpang di dalam bus yang tiba-tiba berhenti akan terdorong ke depan karena...",
    options: ["Gaya rem bekerja pada penumpang","Kelembaman penumpang mempertahankan geraknya","Supir menekan pedal gas","Gravitasi menarik penumpang ke depan"],
    answer: 1,
    explanation: "Ini adalah Hukum Newton I (Inersia). Tubuh penumpang cenderung mempertahankan keadaan gerak ke depan.",
  },
  {
    id: 6, topic: "Newton III",
    question: "Ketika kamu berdiri di atas lantai, pasangan gaya aksi-reaksi yang benar adalah...",
    options: ["Berat badan ke bawah & gaya normal ke atas pada badanmu","Badanmu menekan lantai ke bawah & lantai menekan badanmu ke atas","Gravitasi bumi & gravitasi bulan","Gaya normal ke atas & gaya gesek ke depan"],
    answer: 1,
    explanation: "Pasangan aksi-reaksi Newton III harus bekerja pada DUA benda berbeda: kamu menekan lantai (aksi) dan lantai menekan kamu ke atas (reaksi).",
  },
  {
    id: 7, topic: "Newton II",
    question: "Satuan Newton (N) dalam SI setara dengan...",
    options: ["kg·m/s","kg·m/s²","kg·m²/s","kg²·m/s²"],
    answer: 1,
    explanation: "Dari F = ma: [F] = [m][a] = kg × m/s² = N. Sehingga 1 Newton = 1 kg·m/s²",
  },
  {
    id: 8, topic: "Newton I",
    question: "Sebuah satelit mengorbit bumi dalam orbit melingkar sempurna. Pernyataan yang benar tentang kecepatan satelit adalah...",
    options: ["Kecepatan satelit konstan (sama besar, arah berubah)","Kecepatan satelit bertambah terus","Satelit tidak bergerak karena ΣF = 0","Kecepatan satelit berkurang karena gravitasi"],
    answer: 0,
    explanation: "Besar kecepatan (speed) satelit konstan, tapi arah kecepatan terus berubah mengikuti kurva orbit.",
  },
  {
    id: 9, topic: "Newton II",
    question: "Dua benda A (5 kg) dan B (10 kg) diberi gaya yang sama. Perbandingan percepatan a_A : a_B adalah...",
    options: ["1 : 2","2 : 1","1 : 1","5 : 10"],
    answer: 1,
    explanation: "a = F/m. a_A = F/5, a_B = F/10. Rasio a_A/a_B = 10/5 = 2. Jadi a_A : a_B = 2 : 1",
  },
  {
    id: 10, topic: "Newton III",
    question: "Seorang perenang mendorong dinding kolam ke belakang. Apa yang menyebabkan perenang maju?",
    options: ["Gaya gravitasi air","Dinding kolam mendorong balik perenang ke depan","Perenang mengayuh air ke depan","Tekanan air dari belakang"],
    answer: 1,
    explanation: "Perenang mendorong dinding (aksi ke belakang) → dinding mendorong balik perenang ke depan (reaksi). Hukum Newton III.",
  },
];

const TOTAL_TIME = 600; // 10 menit

export default function Evaluasi({ navigate, markProgress, setQuizResults }) {
  const [phase,    setPhase]    = useState("intro");
  const [name,     setName]     = useState("");      // ← state nama di level atas
  const [currentQ, setCurrentQ] = useState(0);
  const [answers,  setAnswers]  = useState(Array(QUESTIONS.length).fill(null));
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const timerRef = useRef(null);

  useEffect(() => { markProgress("evaluasi"); }, []);

  // Timer — hanya jalan saat phase === "quiz"
  useEffect(() => {
    if (phase !== "quiz") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleFinish(answers); // kirim answers snapshot agar tidak stale
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const calcScore = (ans) =>
    ans.reduce((acc, a, i) => acc + (a === QUESTIONS[i].answer ? 10 : 0), 0);

  const handleFinish = (finalAnswers) => {
    clearInterval(timerRef.current);
    const ans   = finalAnswers || answers;
    const score = calcScore(ans);
    const result = {
      name:     name.trim() || "Anonim",  // ← nama diambil dari state atas
      score,
      answers:  ans,
      timeUsed: TOTAL_TIME - timeLeft,
      topic:    "Hukum Newton",
    };
    setQuizResults(result);   // simpan ke App state untuk halaman Hasil
    setPhase("done");
  };

  // Dipanggil dari tombol di halaman done
  const handleSubmitDB = async (result) => {
    setSubmitMsg("Menyimpan...");
    try {
      const res = await fetch(`${API}/quiz`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:         result.name,
          score:        result.score,
          topic:        result.topic,
          timeUsed:     result.timeUsed,
          answers:      result.answers,
          correctCount: result.answers.filter((a, i) => a === QUESTIONS[i].answer).length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitMsg("✅ Skor berhasil disimpan!");
        setSubmitted(true);
      } else {
        setSubmitMsg("❌ " + (data.message || "Gagal menyimpan."));
      }
    } catch (err) {
      // Backend tidak jalan — tetap simpan, kasih tahu user
      setSubmitMsg("⚠️ Backend tidak terhubung. Skor tidak tersimpan ke database.");
      setSubmitted(true);
    }
  };

  const handleSelect = (optIdx) => {
    if (revealed) return;
    setSelected(optIdx);
    setRevealed(true);
    const newAns    = [...answers];
    newAns[currentQ] = optIdx;
    setAnswers(newAns);
  };

  const goTo = (idx) => {
    setCurrentQ(idx);
    setSelected(answers[idx]);
    setRevealed(answers[idx] !== null);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const answered = answers.filter(a => a !== null).length;

  // ── INTRO ──
  if (phase === "intro") return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-hero">
        <span className="label">Evaluasi</span>
        <h1>Quiz Hukum Newton</h1>
        <p>Uji pemahamanmu dengan 10 soal pilihan ganda. Waktu: 10 menit.</p>
      </div>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Petunjuk</h3>
        {[
          ["⏱", "10 menit untuk 10 soal — timer berjalan otomatis"],
          ["📊", "Setiap jawaban benar = 10 poin, total maksimal 100"],
          ["💡", "Penjelasan jawaban muncul langsung setelah kamu memilih"],
          ["💾", "Skor disimpan ke database MongoDB jika nama diisi"],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
            <span>{icon}</span><span style={{ color: "var(--tx-2)" }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Input nama — state langsung dikelola di sini */}
      <div className="card-flat" style={{ marginBottom: "1.25rem" }}>
        <label style={{ fontSize: 13, color: "var(--tx-2)", marginBottom: "0.5rem", display: "block" }}>
          Nama Peserta <span style={{ color: "var(--tx-3)" }}>(opsional — untuk leaderboard)</span>
        </label>
        <input
          type="text"
          placeholder="Masukkan namamu..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && name.trim()) setPhase("quiz"); }}
          maxLength={50}
          autoFocus
        />
        {name.trim() && (
          <div style={{ fontSize: 12, color: "var(--green)", marginTop: "0.4rem" }}>
            ✓ Namamu akan muncul di leaderboard sebagai "<strong>{name.trim()}</strong>"
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-lg"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={() => setPhase("quiz")}
      >
        {name.trim() ? `Mulai sebagai ${name.trim()} →` : "Mulai Quiz (Anonim) →"}
      </button>
    </div>
  );

  // ── DONE ──
  if (phase === "done") {
    const result = {
      name:     name.trim() || "Anonim",
      score:    calcScore(answers),
      answers,
      timeUsed: TOTAL_TIME - timeLeft,
      topic:    "Hukum Newton",
    };
    const correct = answers.filter((a, i) => a === QUESTIONS[i].answer).length;
    const grade   = result.score >= 90 ? "A" : result.score >= 80 ? "B" : result.score >= 70 ? "C" : result.score >= 60 ? "D" : "E";
    const gradeColor = result.score >= 80 ? "var(--green)" : result.score >= 60 ? "var(--amber)" : "var(--red)";
    const timeFmt = `${String(Math.floor(result.timeUsed/60)).padStart(2,"0")}:${String(result.timeUsed%60).padStart(2,"0")}`;

    return (
      <div className="container" style={{ maxWidth: 680 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "2.5rem 0 1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
            {result.score >= 80 ? "🏆" : result.score >= 60 ? "🎯" : "📚"}
          </div>
          <h2 style={{ marginBottom: "0.25rem" }}>Quiz Selesai!</h2>
          <p>Hasil untuk <strong>{result.name}</strong></p>
        </motion.div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.5rem" }}>
          {[
            { label: "Skor",    value: result.score,  color: "var(--purple)" },
            { label: "Grade",   value: grade,          color: gradeColor      },
            { label: "Benar",   value: `${correct}/10`, color: "var(--teal)" },
            { label: "Waktu",   value: timeFmt,        color: "var(--amber)"  },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rekap jawaban */}
        <div className="card" style={{ marginBottom: "1.25rem", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 14 }}>
            Rekap Jawaban
          </div>
          {QUESTIONS.map((q, i) => {
            const benar = answers[i] === q.answer;
            const belum = answers[i] === null;
            return (
              <div key={q.id} style={{
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
                padding: "0.65rem 1.25rem",
                borderBottom: i < QUESTIONS.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                  {belum ? "⬜" : benar ? "✅" : "❌"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{q.question.substring(0, 65)}...</div>
                  <div style={{ fontSize: 12, color: "var(--tx-2)", marginTop: 2 }}>
                    Jawaban benar: {q.options[q.answer]}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--tx-3)", flexShrink: 0 }}>{q.topic}</span>
              </div>
            );
          })}
        </div>

        {/* Submit & navigasi */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className={`btn btn-lg ${submitted ? "btn-ghost" : "btn-primary"}`}
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => handleSubmitDB(result)}
            disabled={submitted}
          >
            {submitted ? submitMsg : "💾 Simpan Skor ke Database"}
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate("hasil")}>
            Lihat Leaderboard →
          </button>
        </div>

        {submitMsg && !submitted && (
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--red)", textAlign: "center" }}>
            {submitMsg}
          </div>
        )}
      </div>
    );
  }

  // ── QUIZ ──
  const q = QUESTIONS[currentQ];

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: "1.25rem", paddingTop: "1rem" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-purple" style={{ fontSize: 11 }}>Quiz</span>
          <span style={{ fontSize: 13, color: "var(--tx-2)" }}>Soal {currentQ + 1} dari {QUESTIONS.length}</span>
          <span style={{ fontSize: 13, color: "var(--tx-3)" }}>· {answered} dijawab</span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600,
          color: timeLeft < 120 ? "var(--red)" : "var(--teal)",
          background: "var(--bg-3)", border: "1px solid var(--border)",
          padding: "0.3rem 0.85rem", borderRadius: "var(--r-sm)",
        }}>
          {mm}:{ss}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom: "0.75rem" }}>
        <div className="progress-fill" style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} />
      </div>

      {/* Dot navigator */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {QUESTIONS.map((_, i) => {
          const isAnswered = answers[i] !== null;
          const isCorrect  = isAnswered && answers[i] === QUESTIONS[i].answer;
          const isCurrent  = i === currentQ;
          return (
            <div key={i} onClick={() => goTo(i)} style={{
              width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600,
              background: isAnswered ? (isCorrect ? "var(--green-bg)" : "var(--red-bg)") : "var(--bg-3)",
              border: `1.5px solid ${isCurrent ? "var(--purple)" : isAnswered ? (isCorrect ? "var(--green)" : "var(--red)") : "var(--border-2)"}`,
              color: isAnswered ? (isCorrect ? "var(--green)" : "var(--red)") : isCurrent ? "var(--purple)" : "var(--tx-3)",
              transition: "all 0.15s",
            }}>
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          <div className="card" style={{ marginBottom: "0.85rem" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>Soal {currentQ + 1}</span>
              <span className="badge badge-teal" style={{ fontSize: 11 }}>{q.topic}</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.65, color: "var(--tx-1)", marginBottom: "1.25rem" }}>
              {q.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect  = idx === q.answer;
                let cls = "quiz-opt";
                let icon = ["A","B","C","D"][idx];
                if (revealed) {
                  if (isCorrect)            { cls += " correct"; icon = "✓"; }
                  else if (isSelected)      { cls += " wrong";   icon = "✗"; }
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={revealed}>
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: "var(--bg-2)", border: "1px solid var(--border-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                    }}>{icon}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="card-flat"
                style={{
                  marginBottom: "1rem",
                  borderLeft: `3px solid ${selected === q.answer ? "var(--green)" : "var(--red)"}`,
                  borderRadius: "0 var(--r-md) var(--r-md) 0",
                }}
              >
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ fontSize: 16 }}>{selected === q.answer ? "✅" : "❌"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: selected === q.answer ? "var(--green)" : "var(--red)" }}>
                      {selected === q.answer ? "Benar!" : "Kurang tepat"}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{q.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-between">
        <button className="btn btn-ghost" onClick={() => goTo(currentQ - 1)} disabled={currentQ === 0}>← Sebelumnya</button>
        {currentQ < QUESTIONS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => goTo(currentQ + 1)}>Berikutnya →</button>
        ) : (
          <button className="btn btn-amber" style={{ background: "var(--amber)", color: "#fff", border: "none" }}
            onClick={() => handleFinish(answers)}>
            🏁 Selesai & Lihat Skor
          </button>
        )}
      </div>
    </div>
  );
}
