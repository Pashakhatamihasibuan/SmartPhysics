import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getQuestions, createQuestion, updateQuestion,
  deleteQuestion, toggleQuestion,
} from "../../utils/adminApi";
import { AdminLoader, AdminError } from "./AdminDashboard";

const TOPICS     = ["Newton I", "Newton II", "Newton III", "Gerak Parabola", "Umum"];
const DIFFS      = ["mudah", "sedang", "sulit"];
const DIFF_COLOR = { mudah: "var(--accent-green)", sedang: "var(--accent-amber)", sulit: "var(--accent-red)" };

const EMPTY_FORM = {
  topic: "Newton II", difficulty: "sedang", order: 0,
  question: "", explanation: "",
  options: ["", "", "", ""],
  answer: 0,
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [modal,     setModal]     = useState(null); // null | "create" | "edit"
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState("");
  const [filter,    setFilter]    = useState({ topic: "", active: "" });
  const [confirmDel, setConfirmDel] = useState(null); // question id to delete
  const [toast,     setToast]     = useState("");

  useEffect(() => { fetchQ(); }, [filter]);

  const fetchQ = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.topic)  params.topic  = filter.topic;
      if (filter.active !== "") params.active = filter.active;
      const res = await getQuestions(params);
      setQuestions(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError("");
    setModal("create");
  };

  const openEdit = (q) => {
    setForm({
      topic:       q.topic,
      difficulty:  q.difficulty,
      order:       q.order,
      question:    q.question,
      explanation: q.explanation || "",
      options:     [...q.options],
      answer:      q.answer,
    });
    setEditId(q._id);
    setFormError("");
    setModal("edit");
  };

  const handleSave = async () => {
    // Validasi
    if (!form.question.trim()) return setFormError("Pertanyaan wajib diisi.");
    if (form.options.some(o => !o.trim())) return setFormError("Semua pilihan jawaban wajib diisi.");
    setFormError("");
    setSaving(true);
    try {
      if (modal === "create") {
        await createQuestion(form);
        showToast("✅ Soal berhasil dibuat!");
      } else {
        await updateQuestion(editId, form);
        showToast("✅ Soal berhasil diperbarui!");
      }
      setModal(null);
      fetchQ();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleQuestion(id);
      showToast(res.message);
      fetchQ();
    } catch (err) {
      showToast("❌ " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteQuestion(confirmDel);
      showToast("🗑️ " + res.message);
      setConfirmDel(null);
      fetchQ();
    } catch (err) {
      showToast("❌ " + err.message);
    }
  };

  const activeCount   = questions.filter(q => q.isActive).length;
  const inactiveCount = questions.length - activeCount;

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
          <span className="label">📝 Bank Soal</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.4rem" }}>
            Manajemen Soal Quiz
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            {questions.length} soal · {activeCount} aktif · {inactiveCount} nonaktif
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ Buat Soal Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select value={filter.topic} onChange={e => setFilter(f => ({ ...f, topic: e.target.value }))}
          style={{ width: "auto", flex: "1 0 140px" }}>
          <option value="">Semua Topik</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filter.active} onChange={e => setFilter(f => ({ ...f, active: e.target.value }))}
          style={{ width: "auto", flex: "1 0 130px" }}>
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={fetchQ}>🔄 Refresh</button>
      </div>

      {/* Content */}
      {loading ? <AdminLoader text="Memuat soal..." /> :
       error   ? <AdminError msg={error} onRetry={fetchQ} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {questions.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
              📭 Belum ada soal. Klik "Buat Soal Baru" untuk memulai.
            </div>
          )}
          {questions.map((q, i) => (
            <motion.div key={q._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
              style={{
                padding: "1.25rem 1.5rem",
                opacity: q.isActive ? 1 : 0.55,
                borderColor: q.isActive ? "var(--border)" : "transparent",
              }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Order badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.85rem", color: "var(--accent-purple)",
                }}>{q.order || i+1}</div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>{q.topic}</span>
                    <span style={{ fontSize: "0.7rem", padding: "3px 10px", borderRadius: 100, background: `rgba(${DIFF_COLOR[q.difficulty] === "var(--accent-green)" ? "52,211,153" : DIFF_COLOR[q.difficulty] === "var(--accent-amber)" ? "251,191,36" : "248,113,113"},0.12)`, color: DIFF_COLOR[q.difficulty], border: `1px solid ${DIFF_COLOR[q.difficulty]}33` }}>
                      {q.difficulty}
                    </span>
                    {!q.isActive && <span className="badge badge-red" style={{ fontSize: "0.7rem" }}>nonaktif</span>}
                  </div>

                  <p style={{ fontWeight: 500, fontSize: "0.95rem", marginBottom: "0.6rem", lineHeight: 1.5 }}>
                    {q.question}
                  </p>

                  {/* Options preview */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    {q.options.map((opt, idx) => (
                      <div key={idx} style={{
                        fontSize: "0.78rem", padding: "4px 8px", borderRadius: "6px",
                        background: idx === q.answer ? "rgba(52,211,153,0.12)" : "var(--bg-glass)",
                        border: `1px solid ${idx === q.answer ? "rgba(52,211,153,0.3)" : "var(--border)"}`,
                        color: idx === q.answer ? "var(--accent-green)" : "var(--text-secondary)",
                        display: "flex", gap: "5px", alignItems: "center",
                      }}>
                        <span style={{ fontWeight: 600 }}>{["A","B","C","D"][idx]}.</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
                        {idx === q.answer && <span style={{ marginLeft: "auto" }}>✓</span>}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      💡 {q.explanation.substring(0, 80)}{q.explanation.length > 80 ? "..." : ""}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)} title="Edit soal">✏️</button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleToggle(q._id)}
                    style={{ background: q.isActive ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)", border: `1px solid ${q.isActive ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.3)"}`, color: q.isActive ? "var(--accent-amber)" : "var(--accent-green)" }}
                    title={q.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {q.isActive ? "⏸" : "▶"}
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setConfirmDel(q._id)}
                    style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--accent-red)" }}
                    title="Hapus soal"
                  >🗑️</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit */}
      <AnimatePresence>
        {modal && (
          <QuestionModal
            mode={modal}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={() => setModal(null)}
            saving={saving}
            error={formError}
          />
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDel && (
          <ConfirmModal
            title="Hapus Soal?"
            desc="Soal ini akan dihapus permanen dan tidak dapat dikembalikan."
            onConfirm={handleDelete}
            onCancel={() => setConfirmDel(null)}
            danger
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Question Form Modal ── */
function QuestionModal({ mode, form, setForm, onSave, onClose, saving, error }) {
  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700 }}>
            {mode === "create" ? "➕ Buat Soal Baru" : "✏️ Edit Soal"}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Tutup</button>
        </div>

        {error && (
          <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", color: "var(--accent-red)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Row 1: Topic + Difficulty + Order */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <label style={labelStyle}>Topik</label>
            <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tingkat Kesulitan</label>
            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Urutan</label>
            <input type="number" min={1} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Pertanyaan <span style={{ color: "var(--accent-red)" }}>*</span></label>
          <textarea
            rows={3}
            placeholder="Tuliskan pertanyaan di sini..."
            value={form.question}
            onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
            style={{ resize: "vertical", minHeight: 80 }}
          />
        </div>

        {/* Options */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Pilihan Jawaban <span style={{ color: "var(--accent-red)" }}>*</span></label>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            Klik tombol radio untuk menandai jawaban yang benar (✓)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button
                  onClick={() => setForm(f => ({ ...f, answer: i }))}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: form.answer === i ? "rgba(52,211,153,0.2)" : "var(--bg-glass)",
                    border: `2px solid ${form.answer === i ? "var(--accent-green)" : "var(--border)"}`,
                    color: form.answer === i ? "var(--accent-green)" : "var(--text-muted)",
                    fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {form.answer === i ? "✓" : ["A","B","C","D"][i]}
                </button>
                <input
                  type="text"
                  placeholder={`Pilihan ${["A","B","C","D"][i]}...`}
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  style={{ flex: 1, borderColor: form.answer === i ? "rgba(52,211,153,0.4)" : undefined }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div style={{ marginBottom: "1.75rem" }}>
          <label style={labelStyle}>Penjelasan Jawaban <span style={{ color: "var(--text-muted)" }}>(opsional)</span></label>
          <textarea
            rows={2}
            placeholder="Jelaskan mengapa jawaban tersebut benar..."
            value={form.explanation}
            onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
            style={{ resize: "vertical", minHeight: 60 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "⏳ Menyimpan..." : mode === "create" ? "➕ Buat Soal" : "💾 Simpan Perubahan"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Confirm Dialog ── */
export function ConfirmModal({ title, desc, onConfirm, onCancel, danger }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: 420, width: "100%", textAlign: "center" }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{danger ? "⚠️" : "❓"}</div>
        <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>{desc}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button
            className="btn"
            style={{ background: danger ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.2)", border: `1px solid ${danger ? "rgba(248,113,113,0.4)" : "rgba(99,102,241,0.4)"}`, color: danger ? "var(--accent-red)" : "var(--accent-purple)" }}
            onClick={onConfirm}
          >
            {danger ? "🗑️ Ya, Hapus" : "✓ Konfirmasi"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const labelStyle = { fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.45rem", display: "block", fontWeight: 500 };
