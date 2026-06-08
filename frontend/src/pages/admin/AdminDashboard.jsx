import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAdminStats } from "../../utils/adminApi";

export default function AdminDashboard({ admin }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLoader text="Memuat statistik..." />;
  if (error)   return <AdminError msg={error} onRetry={fetchStats} />;

  const gradeMap = Object.fromEntries((stats.gradeDistribution || []).map(g => [g._id, g.count]));
  const totalForPass = stats.totalEntries || 1;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <span className="label">📊 Dashboard</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Selamat datang, <span style={{ color: "var(--accent-purple)" }}>{admin.username}</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Ringkasan data SmartPhysics per hari ini.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        {[
          { icon: "👥", label: "Total Peserta",  value: stats.totalEntries,  color: "var(--accent-purple)", suffix: "orang" },
          { icon: "📈", label: "Rata-rata Skor", value: stats.avgScore,      color: "var(--accent-teal)",   suffix: "/100"  },
          { icon: "🏆", label: "Skor Tertinggi", value: stats.maxScore,      color: "var(--accent-amber)",  suffix: ""      },
          { icon: "✅", label: "Tingkat Lulus",  value: `${stats.passRate}`, color: "var(--accent-green)",  suffix: "%"     },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        {/* Grade Distribution */}
        <div className="card">
          <div className="label" style={{ marginBottom: "1.25rem" }}>Distribusi Grade</div>
          {["A","B","C","D","E"].map((g) => {
            const count = gradeMap[g] || 0;
            const pct   = Math.round((count / totalForPass) * 100);
            const colors = { A:"var(--accent-green)", B:"var(--accent-teal)", C:"var(--accent-blue)", D:"var(--accent-amber)", E:"var(--accent-red)" };
            return (
              <div key={g} style={{ marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontWeight: 600, color: colors[g] }}>Grade {g}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {count} peserta ({pct}%)
                  </span>
                </div>
                <div className="progress-bar-track">
                  <motion.div
                    style={{ height: "100%", borderRadius: 100, background: colors[g], width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Trend */}
        <div className="card">
          <div className="label" style={{ marginBottom: "1.25rem" }}>Aktivitas 7 Hari Terakhir</div>
          {stats.dailyTrend && stats.dailyTrend.length > 0 ? (
            <DailyTrendChart data={stats.dailyTrend} />
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              📭 Belum ada aktivitas 7 hari terakhir
            </div>
          )}

          {/* Additional stats */}
          <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--bg-glass)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-red)", fontSize: "1.1rem" }}>{stats.minScore}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Skor Terendah</div>
            </div>
            <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--bg-glass)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-purple)", fontSize: "1.1rem" }}>
                {Math.floor(stats.avgTimeSeconds / 60)}:{String(stats.avgTimeSeconds % 60).padStart(2,"0")}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Rata-rata Waktu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Distribution */}
      {stats.topicDistribution?.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="label" style={{ marginBottom: "1.25rem" }}>Distribusi per Topik</div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {stats.topicDistribution.map(t => (
              <div key={t._id} style={{
                flex: 1, minWidth: 150, padding: "1rem",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", textAlign: "center",
              }}>
                <div style={{ fontWeight: 600, marginBottom: "0.35rem", fontSize: "0.9rem" }}>{t._id}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "var(--accent-teal)" }}>
                  {Math.round(t.avg)}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Rata-rata skor ({t.count} peserta)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DailyTrendChart({ data }) {
  const W = 300, H = 100;
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const pts = data.map((d, i) => ({
    x: 10 + i * ((W - 20) / Math.max(data.length - 1, 1)),
    y: H - 15 - (d.count / maxCount) * (H - 30),
    count: d.count,
    date: d._id?.split("-").slice(1).join("/"),
  }));
  const path = pts.length > 1 ? "M " + pts.map(p => `${p.x},${p.y}`).join(" L ") : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {path && (
        <>
          <path d={path + ` L ${pts[pts.length-1].x},${H} L ${pts[0].x},${H} Z`}
            fill="rgba(99,102,241,0.1)" />
          <path d={path} fill="none" stroke="var(--accent-purple)" strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="var(--accent-purple)" />
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono">{p.count}</text>
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.25)" fontFamily="JetBrains Mono">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

export function AdminLoader({ text = "Memuat..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem", gap: "1rem" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ fontSize: "2.5rem" }}
      >⚙️</motion.div>
      <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{text}</span>
    </div>
  );
}

export function AdminError({ msg, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</div>
      <p style={{ color: "var(--accent-red)", marginBottom: "1.25rem" }}>{msg}</p>
      {onRetry && <button className="btn btn-ghost" onClick={onRetry}>🔄 Coba Lagi</button>}
    </div>
  );
}
