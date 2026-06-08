import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminResults, deleteResult, deleteAllResults, editResult,
} from "../../utils/adminApi";
import { AdminLoader, AdminError } from "./AdminDashboard";
import { ConfirmModal } from "./AdminQuestions";

const GRADE_COLOR = { A: "var(--accent-green)", B: "var(--accent-teal)", C: "var(--accent-blue)", D: "var(--accent-amber)", E: "var(--accent-red)" };

export default function AdminResults() {
  const [data,       setData]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [confirmDel,  setConfirmDel]  = useState(null); // "single:id" | "all"
  const [editModal,   setEditModal]   = useState(null); // { id, name, score }
  const [editForm,    setEditForm]    = useState({});
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState("");

  useEffect(() => { fetchData(); }, [page, filterGrade]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterGrade) params.grade  = filterGrade;
      if (search)      params.search = search;
      const res = await getAdminResults(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") { setPage(1); fetchData(); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async () => {
    try {
      if (confirmDel === "all") {
        await deleteAllResults();
        showToast("🗑️ Semua data berhasil dihapus.");
      } else {
        const res = await deleteResult(confirmDel);
        showToast("🗑️ " + res.message);
      }
      setConfirmDel(null);
      setPage(1);
      fetchData();
    } catch (err) {
      showToast("❌ " + err.message);
      setConfirmDel(null);
    }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await editResult(editModal.id, { name: editForm.name, score: Number(editForm.score) });
      showToast("✅ Data berhasil diperbarui.");
      setEditModal(null);
      fetchData();
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem("sp_admin_token");
    window.open(`http://localhost:5000/api/admin/export/csv?token=${token}`, "_blank");
  };

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", top: 80, right: 24, zIndex: 999, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "0.75rem 1.25rem", fontSize: "0.9rem", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="label">📊 Data Hasil Quiz</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.4rem" }}>
            Manajemen Hasil Quiz
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Total {pagination.total || 0} data tersimpan
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-teal btn-sm" onClick={handleExportCSV}>⬇️ Export CSV</button>
          <button
            className="btn btn-sm"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--accent-red)" }}
            onClick={() => setConfirmDel("all")}
          >🗑️ Hapus Semua</button>
        </div>
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Cari nama peserta... (Enter)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1); }}
          style={{ width: "auto" }}>
          <option value="">Semua Grade</option>
          {["A","B","C","D","E"].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterGrade(""); setPage(1); setTimeout(fetchData, 50); }}>
          ✕ Reset
        </button>
      </div>

      {/* Table */}
      {loading ? <AdminLoader text="Memuat data..." /> :
       error   ? <AdminError msg={error} onRetry={fetchData} /> : (
        <>
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "1rem" }}>
            {/* Table Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 80px 70px 90px 90px 100px",
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              <span>Nama</span>
              <span style={{ textAlign: "center" }}>Skor</span>
              <span style={{ textAlign: "center" }}>Grade</span>
              <span style={{ textAlign: "center" }}>Waktu</span>
              <span style={{ textAlign: "center" }}>Tanggal</span>
              <span style={{ textAlign: "right" }}>Aksi</span>
            </div>

            {data.length === 0 && (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                📭 Tidak ada data yang cocok dengan filter.
              </div>
            )}

            {data.map((row, i) => (
              <motion.div
                key={row._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 80px 70px 90px 90px 100px",
                  padding: "0.85rem 1.5rem",
                  borderBottom: i < data.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-glass)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Name */}
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>{row.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{row.topic}</div>
                </div>

                {/* Score */}
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem", color: row.score >= 80 ? "var(--accent-green)" : row.score >= 60 ? "var(--accent-amber)" : "var(--accent-red)" }}>
                    {row.score}
                  </span>
                </div>

                {/* Grade */}
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontWeight: 700, color: GRADE_COLOR[row.grade] || "var(--text-secondary)" }}>{row.grade}</span>
                </div>

                {/* Time */}
                <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {fmtTime(row.timeUsed)}
                </div>

                {/* Date */}
                <div style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  {fmtDate(row.createdAt)}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => { setEditModal({ id: row._id, name: row.name, score: row.score }); setEditForm({ name: row.name, score: row.score }); }}
                    style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "var(--accent-purple)", padding: "0.3rem 0.6rem" }}
                    title="Edit"
                  >✏️</button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setConfirmDel(row._id)}
                    style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--accent-red)", padding: "0.3rem 0.6rem" }}
                    title="Hapus"
                  >🗑️</button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                {page} / {pagination.totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              style={{ width: "100%", maxWidth: 420, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem" }}
            >
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>✏️ Edit Data Hasil</h3>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.45rem", display: "block" }}>Nama Peserta</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.45rem", display: "block" }}>Skor (0–100)</label>
                <input type="number" min={0} max={100} step={10} value={editForm.score} onChange={e => setEditForm(f => ({ ...f, score: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Batal</button>
                <button className="btn btn-primary" onClick={handleEdit} disabled={saving}>
                  {saving ? "⏳ Menyimpan..." : "💾 Simpan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDel && (
          <ConfirmModal
            title={confirmDel === "all" ? "Hapus SEMUA Data?" : "Hapus Data Ini?"}
            desc={confirmDel === "all"
              ? "Seluruh data hasil quiz akan dihapus permanen. Leaderboard akan dikosongkan."
              : "Data hasil quiz peserta ini akan dihapus permanen."}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDel(null)}
            danger
          />
        )}
      </AnimatePresence>
    </div>
  );
}
