import { motion } from "framer-motion";

const STACK = [
  {
    cat: "Frontend",
    items: ["React 18", "Framer Motion", "Vite"],
    color: "var(--purple)",
  },
  {
    cat: "Styling",
    items: ["CSS Variables", "Dark/Light Mode"],
    color: "var(--blue)",
  },
  {
    cat: "Backend",
    items: ["Express.js", "Node.js", "REST API"],
    color: "var(--green)",
  },
  {
    cat: "Database",
    items: ["MongoDB", "Mongoose", "Atlas Cloud"],
    color: "var(--amber)",
  },
  { cat: "Auth", items: ["JWT Token", "Admin Panel"], color: "var(--red)" },
  { cat: "Tools", items: ["Figma", "Git", "VS Code"], color: "var(--teal)" },
];

const REFS = [
  { title: "Halliday, Resnick & Walker — Fisika Dasar", type: "Buku" },
  { title: "Arthur Beiser — Konsep Fisika Modern", type: "Buku" },
  { title: "Khan Academy — Classical Mechanics", type: "Online" },
  { title: "PhET Interactive Simulations — CU Boulder", type: "Online" },
  {
    title: "Kurikulum Merdeka Fisika SMA — Kemendikbud 2022",
    type: "Kurikulum",
  },
];

export default function Info({ navigate }) {
  return (
    <div className="container">
      <div className="page-hero">
        <span className="label">Info</span>
        <h1>Tentang SmartPhysics</h1>
        <p>
          Informasi developer, teknologi yang digunakan, dan referensi ilmiah.
        </p>
      </div>

      {/* Developer */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "1.25rem",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--purple-bg)",
            border: "1.5px solid var(--purple-bd)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          👨‍💻
        </div>
        <div style={{ flex: 1 }}>
          <span className="label">Developer</span>
          <h3 style={{ marginBottom: "0.25rem" }}>
            Pasha Khatami Hasibuan, S.Kom.
          </h3>
          <p style={{ fontSize: 13, marginBottom: "0.75rem" }}>
            Mahasiswa Teknik Informatika · Mata Kuliah: Sistem Multimedia ·
            2025/2026
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="badge badge-purple">React</span>
            <span className="badge badge-teal">Full-Stack</span>
            <span className="badge badge-amber">UI/UX</span>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Stack Teknologi</h3>
        <div className="grid-3">
          {STACK.map((s, i) => (
            <motion.div
              key={s.cat}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-flat"
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: s.color,
                  marginBottom: "0.6rem",
                }}
              >
                {s.cat}
              </div>
              {s.items.map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize: 13,
                    color: "var(--tx-2)",
                    padding: "3px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {item}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </section>

      {/* References */}
      <section style={{ marginBottom: "3rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Referensi & Pustaka</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: "var(--border)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
          }}
        >
          {REFS.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "0.85rem 1.25rem",
                background: "var(--bg-2)",
              }}
            >
              <span style={{ fontSize: 13 }}>{r.title}</span>
              <span
                className={`badge badge-${r.type === "Buku" ? "purple" : r.type === "Online" ? "teal" : "amber"}`}
                style={{ flexShrink: 0, fontSize: 11 }}
              >
                {r.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          paddingBottom: "3rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: "0.3rem" }}>
          Smart<span style={{ color: "var(--purple)" }}>Physics</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--tx-3)" }}>
          Interactive Multimedia Learning System © 2025 · React · Express.js ·
          MongoDB
        </div>
      </div>
    </div>
  );
}
