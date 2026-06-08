import { useEffect } from "react";
import { motion } from "framer-motion";

const TUJUAN = [
  "Memahami konsep Hukum Newton I, II, dan III secara mendalam",
  "Menganalisis hubungan antara gaya, massa, dan percepatan",
  "Menerapkan prinsip fisika melalui simulasi interaktif realtime",
  "Mengukur pemahaman melalui evaluasi quiz adaptif",
];

const MANFAAT = [
  { title: "Visualisasi Konkret", desc: "Konsep abstrak menjadi jelas lewat animasi dan simulasi langsung." },
  { title: "Eksperimen Digital",  desc: "Ubah variabel bebas kapan saja tanpa perlu alat laboratorium fisik." },
  { title: "Evaluasi Mandiri",    desc: "Quiz dengan penjelasan per soal dan rekap skor otomatis." },
  { title: "Akses Fleksibel",     desc: "Responsif di desktop maupun mobile — belajar kapan dan di mana saja." },
];

const STEPS = [
  { n: "01", title: "Pendahuluan",  sub: "Pengertian fisika & tujuan pembelajaran", done: true },
  { n: "02", title: "Materi",       sub: "Newton I, II, III + animasi & video",      done: false },
  { n: "03", title: "Simulasi",     sub: "Eksperimen gaya & gerak interaktif",        done: false },
  { n: "04", title: "Evaluasi",     sub: "Quiz 10 soal + skor MongoDB",               done: false },
];

export default function Pendahuluan({ navigate, markProgress }) {
  useEffect(() => { markProgress("pendahuluan"); }, []);

  return (
    <div className="container">
      <div className="page-hero">
        <span className="label">Pendahuluan</span>
        <h1>Apa itu Fisika?</h1>
        <p>
          Fisika adalah ilmu yang mempelajari alam semesta — dari gerak benda sederhana
          hingga perilaku partikel subatomik.
        </p>
      </div>

      {/* Definisi */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: "2rem", borderLeft: "3px solid var(--purple)", borderRadius: "0 var(--r-lg) var(--r-lg) 0" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Definisi Fisika</h3>
        <p>
          Fisika (<em>physics</em>, dari Yunani: <em>physis</em> = alam) adalah cabang ilmu alam yang
          mempelajari materi, energi, dan interaksinya. Mencakup mekanika, termodinamika,
          elektromagnetisme, optik, dan fisika kuantum.
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "1rem" }}>
          {["Mekanika","Energi","Gelombang","Listrik","Optik"].map(t => (
            <span key={t} className="badge badge-purple">{t}</span>
          ))}
        </div>
      </motion.div>

      {/* Tujuan */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Tujuan Pembelajaran</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TUJUAN.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-flat"
              style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}
            >
              <span style={{ color: "var(--purple)", fontWeight: 600, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{i+1}.</span>
              <span style={{ fontSize: 14 }}>{t}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Manfaat */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Manfaat Platform</h3>
        <div className="grid-2">
          {MANFAAT.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card"
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "0.3rem" }}>{m.title}</div>
              <div style={{ fontSize: 13, color: "var(--tx-2)" }}>{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Alur belajar */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Alur Belajar</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "1rem 1.25rem",
              background: "var(--bg-2)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: s.done ? "var(--purple)" : "var(--bg-3)",
                border: `1px solid ${s.done ? "var(--purple)" : "var(--border-2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600,
                color: s.done ? "#fff" : "var(--tx-3)",
              }}>
                {s.done ? "✓" : s.n}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--tx-2)" }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "3rem" }}>
        <button className="btn btn-primary" onClick={() => navigate("materi")}>
          Lanjut ke Materi →
        </button>
      </div>
    </div>
  );
}
