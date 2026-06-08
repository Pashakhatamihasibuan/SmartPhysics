import { motion } from "framer-motion";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
});

const ROUTES = {
  PENDAHULUAN: "pendahuluan",
  MATERI: "materi",
  SIMULASI: "simulasi",
};

const TOPICS = [
  {
    num: "I",
    title: "Hukum Kelembaman",
    formula: "ΣF = 0",
    color: "var(--purple)",
    bg: "var(--purple-bg)",
  },
  {
    num: "II",
    title: "Hukum Percepatan",
    formula: "F = m·a",
    color: "var(--teal)",
    bg: "var(--teal-bg)",
  },
  {
    num: "III",
    title: "Aksi & Reaksi",
    formula: "F₁ = −F₂",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
  },
];

const FEATURES = [
  {
    title: "Simulasi Realtime",
    desc: "Ubah gaya & massa, lihat percepatan berubah seketika.",
  },
  {
    title: "Materi Multimedia",
    desc: "Animasi, video YouTube, dan narasi audio per hukum.",
  },
  {
    title: "Quiz Adaptif",
    desc: "10 soal pilihan ganda dengan timer dan penjelasan.",
  },
  {
    title: "Leaderboard",
    desc: "Skor tersimpan di MongoDB, bandingkan dengan teman.",
  },
];

export default function Home({ navigate }) {
  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(ROUTES.MATERI);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "5rem 0 3rem" }}>
        <div className="container">
          <motion.div {...fade(0)}>
            <span className="label">Multimedia Interaktif · Hukum Newton</span>
          </motion.div>

          <motion.h1 {...fade(0.06)} style={{ marginBottom: "1rem" }}>
            Belajar Fisika
            <br />
            <span style={{ color: "var(--purple)" }}>Lebih Interaktif</span>
          </motion.h1>

          <motion.p
            {...fade(0.12)}
            style={{
              maxWidth: 480,
              marginBottom: "2rem",
            }}
          >
            Platform pembelajaran berbasis simulasi untuk SMP, SMA, dan
            mahasiswa. Eksperimen langsung, quiz adaptif, dan progress tracking.
          </motion.p>

          <motion.div
            {...fade(0.18)}
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(ROUTES.MATERI)}
            >
              Mulai Belajar
            </button>

            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate(ROUTES.SIMULASI)}
            >
              Coba Simulasi
            </button>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="divider" />
      </div>

      {/* Topics */}
      <section className="section">
        <div className="container">
          <span className="label">Materi Utama</span>

          <h2 style={{ marginBottom: "1.5rem" }}>Tiga Hukum Newton</h2>

          <div className="grid-3">
            {TOPICS.map((t, i) => (
              <motion.div
                key={t.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(ROUTES.MATERI)}
                onKeyDown={handleCardKeyDown}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    background: t.bg,
                    marginBottom: "1rem",
                    fontWeight: 600,
                    fontSize: 15,
                    color: t.color,
                    borderRadius: "var(--r-md)",
                  }}
                >
                  {t.num}
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  Newton {t.num}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "var(--tx-2)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {t.title}
                </div>

                <code
                  style={{
                    fontSize: 13,
                    color: t.color,
                    background: t.bg,
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  {t.formula}
                </code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="label">Fitur</span>

          <h2 style={{ marginBottom: "1.5rem" }}>Kenapa SmartPhysics?</h2>

          <div className="grid-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card-flat"
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.3rem",
                    fontSize: 14,
                  }}
                >
                  {f.title}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "var(--tx-2)",
                  }}
                >
                  {f.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="section"
        style={{
          paddingTop: 0,
          paddingBottom: "4rem",
        }}
      >
        <div className="container">
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "2.5rem",
              borderColor: "var(--purple-bd)",
            }}
          >
            <h2 style={{ marginBottom: "0.75rem" }}>Siap mulai?</h2>

            <p style={{ marginBottom: "1.5rem" }}>
              Ikuti alur belajar dari pendahuluan, materi, simulasi, hingga
              evaluasi.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate(ROUTES.PENDAHULUAN)}
            >
              Mulai dari Pendahuluan →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
