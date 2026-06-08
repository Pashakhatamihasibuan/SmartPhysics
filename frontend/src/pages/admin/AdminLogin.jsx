import { useState } from "react";
import { motion } from "framer-motion";
import { login, setToken } from "../../utils/adminApi";

export default function AdminLogin({ onLogin }) {
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(form.username, form.password);
      setToken(res.token);
      onLogin(res.admin);
    } catch (err) {
      setError(err.message || "Login gagal. Periksa kredensial.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-page)", padding: "1.5rem",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #2dd4bf)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem", margin: "0 auto 1.25rem",
            boxShadow: "0 0 40px rgba(99,102,241,0.4)",
          }}>🔐</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "-0.02em" }}>
            Admin <span style={{ color: "var(--accent-purple)" }}>Panel</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
            SmartPhysics — Masuk sebagai administrator
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: "2rem" }}>
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "var(--radius-md)", padding: "0.75rem 1rem",
                color: "var(--accent-red)", fontSize: "0.85rem", marginBottom: "1.5rem",
                display: "flex", gap: "0.5rem", alignItems: "center",
              }}
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}

          {/* Username */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block", fontWeight: 500 }}>
              Username
            </label>
            <input
              type="text"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              onKeyDown={handleKey}
              autoComplete="username"
              style={{ fontSize: "1rem" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.5rem", display: "block", fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={handleKey}
                autoComplete="current-password"
                style={{ fontSize: "1rem", paddingRight: "3rem" }}
              />
              <button
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: "1rem",
                  color: "var(--text-muted)", padding: "0",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "0.85rem" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>⚙️</motion.span>
                Memverifikasi...
              </span>
            ) : "🔐 Masuk ke Admin Panel"}
          </button>

          {/* Hint */}
          <div style={{ marginTop: "1.25rem", padding: "0.85rem", background: "var(--bg-glass)", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
            Default: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>admin</span> / <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>smartphysics123</span>
            <br />Ubah di file <span style={{ fontFamily: "var(--font-mono)" }}>.env</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Token berlaku 8 jam · JWT secured
          </span>
        </div>
      </motion.div>
    </div>
  );
}
