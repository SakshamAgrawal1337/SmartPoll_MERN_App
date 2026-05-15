import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ;
export { SOCKET_URL };

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // httpOnly refreshToken cookie
});

// Attach token to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("sp_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh on 401
// Refresh response: { success, data: { accessToken } }
let refreshing = false;
let queue = [];
const flush = (err, token) =>
  queue.splice(0).forEach((p) => (err ? p.reject(err) : p.resolve(token)));

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      if (refreshing) {
        return new Promise((res, rej) => queue.push({ resolve: res, reject: rej }))
          .then((t) => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
      }
      orig._retry = true;
      refreshing = true;
      try {
        // POST /auth/refresh-token → { success, data: { accessToken } }
        const { data } = await axios.post(
          `${BASE}/auth/refresh-token`, {}, { withCredentials: true }
        );
        const token = data.data?.accessToken;
        if (!token) throw new Error("no token");
        localStorage.setItem("sp_token", token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        flush(null, token);
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      } catch (e) {
        flush(e, null);
        localStorage.removeItem("sp_token");
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── AUTH ─────────────────────────────────────────────────────────────
// POST /auth/register  → { success, data: { name, email, role, ... } }  ← NO token
// POST /auth/login     → { success, data: { accessToken, user } }
// GET  /auth/me        → { success, data: { user } }
// POST /auth/logout    → { success, message }
// POST /auth/refresh-token → { success, data: { accessToken } }
export const authAPI = {
  register:     (b) => api.post("/auth/register", b),
  login:        (b) => api.post("/auth/login", b),
  me:           ()  => api.get("/auth/me"),
  logout:       ()  => api.post("/auth/logout"),
  refreshToken: ()  => api.post("/auth/refresh-token"),
};

// ── POLL ─────────────────────────────────────────────────────────────
// GET  /poll/my      → { success, data: { polls: [] } }
// POST /poll         → { success, data: { ...poll } }
// GET  /poll/:code   → { success, data: { ...poll } }
// ⚠️  DELETE /poll/:id  — not in backend yet, noted below
export const pollAPI = {
  getMyPolls: ()     => api.get("/poll/my"),
  create:     (b)    => api.post("/poll", b),
  getByCode:  (code) => api.get(`/poll/${code}`),
    // edit poll fetch
  getById: (id) => api.get(`/poll/edit/${id}`),
    // update poll
  update: (id, b) => api.put(`/poll/${id}`, b),
  // If backend adds delete: DELETE /poll/:id
  close: (id) => api.patch(`/poll/${id}/close`),
  delete:     (id)   => api.delete(`/poll/${id}`),
};

// ── RESPONSE ─────────────────────────────────────────────────────────
// POST /response/:pollId
// body: { guestName: string|null, answers: [{ questionId, selectedOptions: string[] }] }
// NOTE: backend uses selectedOptions (array), NOT selectedOption (string)
export const responseAPI = {
  submit: (pollId, b) => api.post(`/response/${pollId}`, b),
};

// ── ANALYTICS ────────────────────────────────────────────────────────
// GET /analytics/:pollId
// → { success, data: { pollId, totalResponses, questionStats: { [qId]: { text, totalVotes, options: {opt: count} } } } }
// ⚠️  NOTE: In your test all option counts were 0 even with 1 response.
//     This looks like a backend bug where selectedOptions array isn't being
//     matched. Check your analytics.service.js — it may look for selectedOption
//     (singular) but response stores selectedOptions (plural array).
export const analyticsAPI = {
  get: (pollId) => api.get(`/analytics/${pollId}`),
};
