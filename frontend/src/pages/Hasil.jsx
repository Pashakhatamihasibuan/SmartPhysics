import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ── Port yang sama dengan Evaluasi.jsx ──
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const MOCK = [
  { name: "Pasha",    score: 100, topic: "Hukum Newton", timeUsed: 312 },
  { name: "Fitriani", score: 100, topic: "Hukum Newton", timeUsed: 290 },
  { name: "Rizky",    score: 90,  topic: "Hukum Newton", timeUsed: 420 },
  { name: "Aulia",    score: 90,  topic: "Hukum Newton", timeUsed: 398 },
  { name: "Dimas",    score: 80,  topic: "Hukum Newton", timeUsed: 510 },
];

const MEDALS = ["🥇","🥈","🥉"];
const MEDAL_COLORS = ["#f0a742","#94a3b8","#cd7c2f"];

export default function Hasil({ navigate, quizResults }) {
  const [leaderboard, setLeaderboard] = useState(MOCK);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [tab,         setTab]         = useState("leaderboard");
  const [lastFetch,   setLastFetch]   = useState(null);

  useEffect(() => { fetchLeaderboard(); }, []);

  // Auto-refresh saat baru submit quiz (quizResults berubah)
  useEffect(() => {
    if (quizResults) {
      setTimeout(fetchLeaderboard, 800); // beri jeda 800ms agar backend selesai simpan
    }
  }, [quizResults]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/quiz/leaderboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setLeaderboard(data.data);
      }
      setLastFetch(new Date());
    } catch (err) {
      setError(`Tidak dapat terhubung ke server (${err.message}). Menampilkan data demo.`);
      // tetap tampilkan mock data agar halaman tidak kosong
    } finally {
      setLoading(false);
    }
  };

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const myName  = quizResults?.name;
  const myScore = quizResults?.score;
  const myRank  = myName ? leaderboard.findIndex(l => l.name === myName) + 1 : null;

  // Podium: #2 kiri, #1 tengah (tinggi), #3 kanan
  const podiumOrder = [
    { leaderIdx: 1, pos: 1, height: 150 },
    { leaderIdx: 0, pos: 0, height: 200 },
    { leaderIdx: 2, pos: 2, height: 110 },
  ];

  return (
    <div className="container">
      <div className="page-hero">
        <span className="label">Hasil Belajar</span>
        <h1>Progress & Leaderboard</h1>
        <p>Pantau perkembangan belajarmu dan bandingkan dengan peserta lain.</p>
      </div>

      {/* Banner hasil terakhir */}
      {myScore !== null && myScore !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: "1.5rem", borderColor: "var(--purple-bd)", display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}
        >
          <div style={{ fontSize: "2.5rem" }}>
            {myScore >= 80 ? "🏆" : myScore >= 60 ? "🎯" : "📚"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {myName} —{" "}
              <span style={{ color: "var(--purple)" }}>{myScore} Poin</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--tx-2)", marginTop: 2 }}>
              Waktu: {fmtTime(quizResults.timeUsed || 0)}
              {myRank > 0 ? ` · Peringkat #${myRank} di leaderboard` : " · Sedang memuat peringkat..."}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("evaluasi")}>
            Ulangi Quiz
          </button>
        </motion.div>
      )}

      {/* Error info */}
      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "var(--amber-bg)", border: "1px solid var(--amber)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--amber)", marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tab selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem" }}>
        {[
          { key: "leaderboard", label: "🏆 Leaderboard" },
          { key: "progress",    label: "📈 Progress"    },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-ghost"}`}>
            {t.label}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={fetchLeaderboard} style={{ marginLeft: "auto" }}>
          🔄 Refresh
        </button>
      </div>

      {/* ── LEADERBOARD TAB ── */}
      {tab === "leaderboard" && (
        <>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--tx-2)" }}>Memuat leaderboard...</div>
          ) : (
            <>
              {/* Podium Top 3 */}
              {leaderboard.length >= 3 && (
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "flex-end", marginBottom: "2rem" }}>
                  {podiumOrder.map(({ leaderIdx, pos, height }) => {
                    const entry = leaderboard[leaderIdx];
                    if (!entry) return null;
                    return (
                      <motion.div key={leaderIdx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pos * 0.12 }}
                        style={{ textAlign: "center", width: 130 }}
                      >
                        <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>{MEDALS[pos]}</div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "0.2rem" }}>{entry.name}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: MEDAL_COLORS[pos], marginBottom: "0.5rem" }}>
                          {entry.score}
                        </div>
                        <div style={{
                          height,
                          background: `rgba(${pos===0?"251,191,36":pos===1?"148,163,184":"205,124,47"},0.12)`,
                          border: `1.5px solid rgba(${pos===0?"251,191,36":pos===1?"148,163,184":"205,124,47"},0.3)`,
                          borderRadius: "var(--r-md) var(--r-md) 0 0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 22,
                          color: `rgba(${pos===0?"251,191,36":pos===1?"148,163,184":"205,124,47"},0.5)`,
                        }}>
                          #{pos + 1}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full table */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Semua Peserta ({leaderboard.length})</span>
                  {lastFetch && <span style={{ fontSize: 12, color: "var(--tx-3)" }}>Update: {lastFetch.toLocaleTimeString("id-ID")}</span>}
                </div>
                {leaderboard.map((entry, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "1rem",
                      padding: "0.85rem 1.25rem",
                      borderBottom: i < leaderboard.length - 1 ? "1px solid var(--border)" : "none",
                      background: myName && entry.name === myName ? "var(--purple-bg)" : "transparent",
                    }}
                  >
                    {/* Rank badge */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: i < 3 ? `rgba(${["251,191,36","148,163,184","205,124,47"][i]},0.12)` : "var(--bg-3)",
                      border: `1px solid ${i < 3 ? `rgba(${["251,191,36","148,163,184","205,124,47"][i]},0.3)` : "var(--border-2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: i < 3 ? 14 : 12, fontWeight: 700,
                      color: i < 3 ? MEDAL_COLORS[i] : "var(--tx-3)",
                    }}>
                      {i < 3 ? MEDALS[i] : i + 1}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: myName && entry.name === myName ? 700 : 500, fontSize: 14 }}>
                        {entry.name}
                        {myName && entry.name === myName && (
                          <span className="badge badge-purple" style={{ marginLeft: 8, fontSize: 10 }}>Kamu</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--tx-3)" }}>{entry.topic}</div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16,
                        color: entry.score >= 80 ? "var(--green)" : entry.score >= 60 ? "var(--amber)" : "var(--red)",
                      }}>
                        {entry.score}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--tx-3)" }}>
                        {entry.timeUsed ? fmtTime(entry.timeUsed) : "--:--"}
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div style={{ width: 70 }}>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── PROGRESS TAB ── */}
      {tab === "progress" && (
        <div>
          {quizResults ? (
            <>
              <h3 style={{ marginBottom: "1rem" }}>Hasil Terakhirmu</h3>
              <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
                {[
                  { label: "Skor",          value: quizResults.score,                             color: "var(--purple)", suffix: "" },
                  { label: "Jawaban Benar", value: quizResults.answers?.filter((a,i)=>a===([1,1,2,2,1,1,1,0,1,1])[i]).length || 0, color: "var(--green)",  suffix: "/10" },
                  { label: "Waktu",         value: fmtTime(quizResults.timeUsed || 0),            color: "var(--amber)",  suffix: "" },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-value" style={{ color: s.color }}>{s.value}{s.suffix}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="card-flat" style={{ fontSize: 14, color: "var(--tx-2)", lineHeight: 1.7 }}>
                {quizResults.score >= 90 && "Luar biasa! Kamu menguasai materi Hukum Newton dengan sangat baik. 🏆"}
                {quizResults.score >= 70 && quizResults.score < 90 && "Bagus! Kamu sudah memahami sebagian besar konsep. Coba ulangi untuk skor lebih tinggi. 🎯"}
                {quizResults.score < 70 && "Jangan menyerah! Pelajari kembali materinya dan coba lagi. 📚"}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--tx-2)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📝</div>
              <p>Belum ada hasil quiz. Ikuti evaluasi terlebih dahulu.</p>
              <button className="btn btn-primary mt-md" onClick={() => navigate("evaluasi")}>
                Mulai Evaluasi →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer nav */}
      <div style={{ display: "flex", gap: 8, marginTop: "2rem", paddingBottom: "3rem", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => navigate("evaluasi")}>🔄 Ulangi Evaluasi</button>
        <button className="btn btn-ghost"   onClick={() => navigate("materi")}>📖 Kembali ke Materi</button>
        <button className="btn btn-ghost"   onClick={() => navigate("simulasi")}>🚀 Ke Simulasi</button>
      </div>
    </div>
  );
}
