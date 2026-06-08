import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminQuestions from "./AdminQuestions";
import AdminResults from "./AdminResults";
import { getToken, clearToken, verifyToken } from "../../utils/adminApi";

const NAV_ITEMS = [
  { key: "dashboard", icon: "📊", label: "Dashboard"    },
  { key: "questions", icon: "📝", label: "Bank Soal"    },
  { key: "results",   icon: "🏆", label: "Hasil Quiz"   },
];

export default function AdminPanel({ navigate }) {
  const [admin,     setAdmin]     = useState(null);    // null = not logged in
  const [checking,  setChecking]  = useState(true);    // initial token check
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── On mount: check stored token ── */
  useEffect(() => {
    const token = getToken();
    if (!token) { setChecking(false); return; }

    verifyToken(token)
      .then(res => {
        if (res.valid) setAdmin(res.admin);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  const handleLogin  = (adminData) => setAdmin(adminData);
  const handleLogout = () => { clearToken(); setAdmin(null); };

  /* ── Loading spinner while checking token ── */
  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-page)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: "2rem" }}>⚙️</motion.div>
      </div>
    );
  }

  /* ── Not logged in → show Login ── */
  if (!admin) return <AdminLogin onLogin={handleLogin} />;

  /* ── Logged in → show full Admin Panel ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-page)", paddingTop: 0 }}>

      {/* ─ SIDEBAR ─ */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", minHeight: 64 }}>
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--bg-glass)", border: "1px solid var(--border)", cursor: "pointer", fontSize: "1rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
          {sidebarOpen && (
            <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem" }}>
                Smart<span style={{ color: "var(--accent-purple)" }}>Physics</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                border: "none", cursor: "pointer",
                background: activePage === item.key ? "rgba(99,102,241,0.12)" : "transparent",
                color: activePage === item.key ? "var(--accent-purple)" : "var(--text-secondary)",
                fontFamily: "var(--font-body)", fontSize: "0.88rem", fontWeight: activePage === item.key ? 600 : 400,
                transition: "all 0.15s", textAlign: "left",
                borderLeft: activePage === item.key ? "3px solid var(--accent-purple)" : "3px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "0 0.5rem" }} />

        {/* Back to App + Logout */}
        <div style={{ padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "4px" }}>
          <button
            onClick={() => navigate("home")}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)",
              border: "none", cursor: "pointer", background: "transparent",
              color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.88rem",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}
          >
            <span style={{ flexShrink: 0 }}>🏠</span>
            {sidebarOpen && "Kembali ke App"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)",
              border: "none", cursor: "pointer",
              background: "rgba(248,113,113,0.08)",
              color: "var(--accent-red)", fontFamily: "var(--font-body)", fontSize: "0.88rem",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}
          >
            <span style={{ flexShrink: 0 }}>🚪</span>
            {sidebarOpen && "Logout"}
          </button>

          {/* Admin info */}
          {sidebarOpen && (
            <div style={{ marginTop: "0.5rem", padding: "0.65rem 0.85rem", background: "var(--bg-glass)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: "2px" }}>👤 {admin.username}</div>
              <div>Administrator</div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ─ MAIN CONTENT ─ */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 64,
        transition: "margin-left 0.25s",
        padding: "2rem",
        minHeight: "100vh",
      }}>
        {/* Topbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "2rem", paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>{NAV_ITEMS.find(n => n.key === activePage)?.icon}</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700 }}>
              {NAV_ITEMS.find(n => n.key === activePage)?.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="badge badge-green" style={{ fontSize: "0.72rem" }}>🟢 Online</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activePage === "dashboard" && <AdminDashboard admin={admin} />}
            {activePage === "questions" && <AdminQuestions />}
            {activePage === "results"   && <AdminResults />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
