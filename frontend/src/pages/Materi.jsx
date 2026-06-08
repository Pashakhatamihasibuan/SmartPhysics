import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LAWS = [
  {
    id: 1, num: "I", color: "var(--purple)", bg: "var(--purple-bg)",
    title: "Hukum Kelembaman", formula: "ΣF = 0 → v = konstan",
    statement: "Benda diam akan tetap diam dan benda bergerak akan terus bergerak lurus beraturan selama tidak ada resultan gaya yang bekerja padanya.",
    penjelasan: "Dikenal sebagai Hukum Inersia. Setiap benda cenderung mempertahankan keadaan geraknya. Ini menjelaskan mengapa penumpang bus terdorong ke depan saat bus berhenti tiba-tiba.",
    contoh: ["Penumpang terdorong ke depan saat bus berhenti mendadak","Buku diam di meja karena gaya gravitasi diimbangi gaya normal","Astronot terus bergerak di luar angkasa tanpa hambatan udara"],
    rumus: "Jika ΣF = 0, maka a = 0, artinya v = konstan (bisa nol atau tetap).",
    ytId: "kKKM8Y-u7ds",
  },
  {
    id: 2, num: "II", color: "var(--teal)", bg: "var(--teal-bg)",
    title: "Hukum Percepatan", formula: "F = m × a",
    statement: "Percepatan suatu benda berbanding lurus dengan gaya yang bekerja padanya dan berbanding terbalik dengan massanya.",
    penjelasan: "Inilah inti dinamika Newton. Semakin besar gaya, semakin besar percepatan. Semakin besar massa, semakin kecil percepatan untuk gaya yang sama.",
    contoh: ["Mendorong truk lebih sulit dari mendorong sepeda (massa berbeda)","Bola ditendang keras melambung lebih jauh (gaya lebih besar)","Roket mempercepat saat membuang massa (massa berkurang → a bertambah)"],
    rumus: "a = F / m → Percepatan (m/s²) = Gaya (N) ÷ Massa (kg)",
    ytId: "ou9YMWlJgkE",
  },
  {
    id: 3, num: "III", color: "var(--amber)", bg: "var(--amber-bg)",
    title: "Hukum Aksi–Reaksi", formula: "F_aksi = −F_reaksi",
    statement: "Setiap gaya aksi selalu menghasilkan gaya reaksi yang sama besar, berlawanan arah, dan bekerja pada benda yang berbeda.",
    penjelasan: "Gaya selalu muncul berpasangan. Jika A mendorong B, maka B mendorong A dengan besar yang sama namun arah berlawanan. Kedua gaya bekerja pada benda yang BERBEDA.",
    contoh: ["Roket menyemburkan gas ke belakang → gas mendorong roket ke depan","Kaki menekan lantai ke bawah → lantai mendorong kaki ke atas","Pistol ditembakkan: peluru ke depan, pistol mundur (recoil)"],
    rumus: "|F_aksi| = |F_reaksi| — besar sama, arah berlawanan, benda berbeda.",
    ytId: "By-ggTfeuJU",
  },
];

export default function Materi({ navigate, markProgress }) {
  const [active, setActive] = useState(0);
  const [tab, setTab]       = useState("penjelasan");
  const [audio, setAudio]   = useState(false);

  useEffect(() => { markProgress("materi"); }, []);

  const law = LAWS[active];

  return (
    <div className="container">
      <div className="page-hero">
        <span className="label">Materi</span>
        <h1>Hukum Newton & Gerak</h1>
        <p>Pilih hukum di bawah, lalu pelajari dengan animasi dan video.</p>
      </div>

      {/* Selector tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", background: "var(--bg-3)", padding: 4, borderRadius: "var(--r-md)", width: "fit-content" }}>
        {LAWS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => { setActive(i); setTab("penjelasan"); setAudio(false); }}
            style={{
              padding: "0.4rem 1.1rem", borderRadius: "var(--r-sm)",
              border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
              background: active === i ? "var(--bg-2)" : "transparent",
              color: active === i ? l.color : "var(--tx-2)",
              boxShadow: active === i ? "var(--shadow)" : "none",
              transition: "all 0.18s",
            }}
          >
            Newton {l.num}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="grid-2" style={{ alignItems: "start", gap: "1.25rem" }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Header */}
              <div className="card" style={{ borderLeft: `3px solid ${law.color}`, borderRadius: "0 var(--r-lg) var(--r-lg) 0" }}>
                <span className="label" style={{ color: law.color }}>Hukum Newton {law.num}</span>
                <h3 style={{ marginBottom: "0.5rem" }}>{law.title}</h3>
                <div className="sim-formula" style={{ color: law.color, marginBottom: "0.75rem" }}>{law.formula}</div>
                <p style={{ fontSize: 13, fontStyle: "italic" }}>"{law.statement}"</p>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 4 }}>
                {["penjelasan","contoh","rumus"].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`}
                    style={{ textTransform: "capitalize" }}
                  >{t}</button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-flat" style={{ minHeight: 120 }}>
                  {tab === "penjelasan" && (
                    <div>
                      <p style={{ fontSize: 14, lineHeight: 1.75 }}>{law.penjelasan}</p>
                      <button
                        className={`btn btn-sm ${audio ? "btn-ghost" : "btn-teal"}`}
                        style={{ marginTop: "0.85rem" }}
                        onClick={() => setAudio(a => !a)}
                      >
                        {audio ? "⏸ Pause" : "▶ Dengar Narasi"}
                      </button>
                      {audio && (
                        <div style={{ display: "flex", gap: 3, alignItems: "center", marginTop: "0.75rem" }}>
                          {[1,2,3,4,5].map(i => (
                            <motion.div key={i}
                              style={{ width: 3, background: "var(--teal)", borderRadius: 2 }}
                              animate={{ height: [6, 18, 6] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                            />
                          ))}
                          <span style={{ fontSize: 12, color: "var(--tx-2)", marginLeft: 6 }}>Memutar narasi...</span>
                        </div>
                      )}
                    </div>
                  )}
                  {tab === "contoh" && (
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {law.contoh.map((c, i) => (
                        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                          <span style={{ color: law.color, fontWeight: 600, flexShrink: 0 }}>→</span>
                          <span style={{ color: "var(--tx-2)" }}>{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {tab === "rumus" && (
                    <div>
                      <div className="sim-formula" style={{ color: law.color, fontSize: 15, marginBottom: "0.85rem" }}>{law.formula}</div>
                      <p style={{ fontSize: 13 }}>{law.rumus}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Animation */}
              <div className="card" style={{ padding: "1rem" }}>
                <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: "0.75rem", fontWeight: 500 }}>Animasi Ilustrasi</div>
                <LawAnim law={law} />
              </div>

              {/* YouTube */}
              <YoutubeCard law={law} />

              <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => navigate("simulasi")}>
                Coba Simulasi Interaktif →
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingBottom: "3rem" }}>
        <button className="btn btn-ghost" onClick={() => navigate("pendahuluan")}>← Pendahuluan</button>
        <button className="btn btn-primary" onClick={() => navigate("simulasi")}>Simulasi →</button>
      </div>
    </div>
  );
}

function YoutubeCard({ law }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Video Eksperimen</span>
        <span className="badge badge-red" style={{ fontSize: 11 }}>YouTube</span>
      </div>
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "var(--bg-3)" }}>
        {playing ? (
          <iframe
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            src={`https://www.youtube.com/embed/${law.ytId}?autoplay=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div onClick={() => setPlaying(true)} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8 }}>
            <img src={`https://img.youtube.com/vi/${law.ytId}/mqdefault.jpg`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} onError={e => e.target.style.display="none"} />
            <div style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>▶</div>
            <span style={{ position: "relative", fontSize: 12, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>Klik untuk putar</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LawAnim({ law }) {
  if (law.id === 1) return (
    <div className="sim-canvas" style={{ height: 110 }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--border-2)" }} />
      <motion.div animate={{ x: [0, 240, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: "50%", left: 20, width: 44, height: 44, transform: "translateY(-50%)", background: law.bg, border: `1.5px solid ${law.color}`, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: law.color }}>
        m
      </motion.div>
      <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--tx-3)" }}>v = konstan</div>
    </div>
  );
  if (law.id === 2) return (
    <div className="sim-canvas" style={{ height: 110 }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--border-2)" }} />
      <motion.div animate={{ x: [0, 220] }} transition={{ duration: 2, repeat: Infinity, ease: "easeIn", repeatType: "reverse" }}
        style={{ position: "absolute", top: "50%", left: 20, width: 48, height: 48, transform: "translateY(-50%)", background: law.bg, border: `1.5px solid ${law.color}`, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: law.color }}>
        m
      </motion.div>
      <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--tx-3)" }}>a = F/m</div>
    </div>
  );
  return (
    <div className="sim-canvas" style={{ height: 110 }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--border-2)" }} />
      <motion.div animate={{ x: [-12, 0, -12] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "50%", left: 24, width: 48, height: 48, transform: "translateY(-50%)", background: "var(--purple-bg)", border: "1.5px solid var(--purple)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "var(--purple)" }}>A</motion.div>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 8, height: 8, borderRadius: "50%", background: law.color }} />
      <motion.div animate={{ x: [12, 0, 12] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "50%", right: 24, width: 48, height: 48, transform: "translateY(-50%)", background: law.bg, border: `1.5px solid ${law.color}`, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: law.color }}>B</motion.div>
      <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--tx-3)" }}>F_A = −F_B</div>
    </div>
  );
}
