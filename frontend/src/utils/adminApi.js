const BASE = "http://localhost:8000/api";

/* ── Token helpers ── */
export const getToken = () => localStorage.getItem("sp_admin_token");
export const setToken = (t) => localStorage.setItem("sp_admin_token", t);
export const clearToken = () => localStorage.removeItem("sp_admin_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request gagal");
  return data;
};

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
export const login = (username, password) =>
  fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then(handle);

export const verifyToken = (token) =>
  fetch(`${BASE}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).then(handle);

/* ══════════════════════════════
   ADMIN STATS & RESULTS
══════════════════════════════ */
export const getAdminStats = () =>
  fetch(`${BASE}/admin/stats`, { headers: authHeaders() }).then(handle);

export const getAdminResults = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}/admin/results?${q}`, { headers: authHeaders() }).then(
    handle,
  );
};

export const deleteResult = (id) =>
  fetch(`${BASE}/admin/results/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handle);

export const deleteAllResults = () =>
  fetch(`${BASE}/admin/results`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ confirm: "RESET_ALL" }),
  }).then(handle);

export const editResult = (id, data) =>
  fetch(`${BASE}/admin/results/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

export const exportCSV = () => {
  const a = document.createElement("a");
  a.href = `${BASE}/admin/export`;
  // pass token as query param for file download
  a.href = `${BASE}/admin/export/csv?token=${getToken()}`;
  a.download = "smartphysics-results.csv";
  a.click();
};

/* ══════════════════════════════
   QUESTIONS (BANK SOAL)
══════════════════════════════ */
export const getQuestions = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}/questions?${q}`, { headers: authHeaders() }).then(
    handle,
  );
};

export const getQuestion = (id) =>
  fetch(`${BASE}/questions/${id}`, { headers: authHeaders() }).then(handle);

export const createQuestion = (data) =>
  fetch(`${BASE}/questions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

export const updateQuestion = (id, data) =>
  fetch(`${BASE}/questions/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

export const toggleQuestion = (id) =>
  fetch(`${BASE}/questions/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  }).then(handle);

export const deleteQuestion = (id) =>
  fetch(`${BASE}/questions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handle);
