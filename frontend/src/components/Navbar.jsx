const NAV_ITEMS = [
  { key: "home",        label: "Home"        },
  { key: "pendahuluan", label: "Pendahuluan" },
  { key: "materi",      label: "Materi"      },
  { key: "simulasi",    label: "Simulasi"    },
  { key: "evaluasi",    label: "Evaluasi"    },
  { key: "hasil",       label: "Hasil"       },
  { key: "info",        label: "Info"        },
];

export default function Navbar({ page, navigate, darkMode, setDarkMode, progress }) {
  const done = Object.values(progress).filter(Boolean).length;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-logo" onClick={() => navigate("home")}>
          Smart<span>Physics</span>
        </div>

        <div className="nav-links">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-link ${page === item.key ? "active" : ""}`}
              onClick={() => navigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--tx-2)" }}>
            <div style={{ width: 48 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(done / 4) * 100}%` }} />
              </div>
            </div>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{done}/4</span>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("admin")}
            style={{ fontSize: 12, padding: "0.3rem 0.7rem" }}
          >
            Admin
          </button>

          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle tema">
            {darkMode ? "☀" : "☽"}
          </button>
        </div>
      </div>
    </nav>
  );
}
