// Place at: CRM_FRONTEND/src/services/employeeWorkApi.js
// Uses native fetch — no axios dependency.

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000";

// ---------------------------------------------------------------------------
// Internal fetch helper — mimics the { data } shape used by axios so the
// existing form pages don't need any changes.
// ---------------------------------------------------------------------------
async function request(path, { method = "GET", body, params } = {}) {
  let url = BASE_URL.replace(/\/$/, "") + path;

  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const q = qs.toString();
    if (q) url += `?${q}`;
  }

  const opts = {
    method,
    credentials: "include", // sends the HttpOnly `token` cookie
    headers: {},
  };

  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    // Throw axios-shaped error so existing catch blocks still work
    const err = new Error(
      (data && (data.detail || data.message)) || `HTTP ${res.status}`
    );
    err.response = { status: res.status, data };
    throw err;
  }

  return { data, status: res.status };
}

// ---- Sales ----
export const createSalesEntry          = (payload)     => request(`/api/employee-work/sales`, { method: "POST", body: payload });
export const listMySalesEntries        = (params = {}) => request(`/api/employee-work/sales/my`, { params });
export const getMySalesSummary         = ()            => request(`/api/employee-work/sales/my/summary`);

// ---- Installation ----
export const createInstallationEntry   = (payload)     => request(`/api/employee-work/installation`, { method: "POST", body: payload });
export const listMyInstallationEntries = ()            => request(`/api/employee-work/installation/my`);

// ---- Marketing / Technical ----
export const createGeneralEntry        = (payload)     => request(`/api/employee-work/general`, { method: "POST", body: payload });
export const listMyGeneralEntries      = ()            => request(`/api/employee-work/general/my`);

// ---- Admin ----
export const adminListAllWork          = (params = {}) => request(`/api/employee-work/admin/all`, { params });
export const adminListTargets          = ()            => request(`/api/employee-work/admin/targets`);
export const adminUpsertTarget         = (payload)     => request(`/api/employee-work/admin/targets`, { method: "POST", body: payload });

// ---- Auth ----
export const fetchCurrentUser          = ()            => request(`/me`);
