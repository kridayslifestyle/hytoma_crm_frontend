// Place at: CRM_FRONTEND/src/services/customerWorkApi.js
// Native fetch — same shape/pattern as employeeWorkApi.js (returns { data }).

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000";

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

  const opts = { method, credentials: "include", headers: {} };
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
    const err = new Error((data && (data.detail || data.message)) || `HTTP ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }
  return { data, status: res.status };
}

// ---- Customer Work (admin) ----
export const createCustomerWork = (payload) =>
  request(`/api/customer-work`, { method: "POST", body: payload });

export const listCustomerWork = (params = {}) =>
  request(`/api/customer-work`, { params });

export const getCustomerWork = (id) =>
  request(`/api/customer-work/${id}`);

export const updateCustomerWork = (id, payload) =>
  request(`/api/customer-work/${id}`, { method: "PUT", body: payload });

export const deleteCustomerWork = (id) =>
  request(`/api/customer-work/${id}`, { method: "DELETE" });

export const updateCustomerWorkStatus = (id, status) =>
  request(`/api/customer-work/${id}/status`, { method: "PATCH", body: { status } });

export const rescheduleCustomerWork = (id, payload) =>
  request(`/api/customer-work/${id}/reschedule`, { method: "POST", body: payload });

export const getAvailability = (start, end) =>
  request(`/api/customer-work/availability`, { params: { start, end } });

export const listInstallers = () =>
  request(`/api/customer-work/installers`);

// ---- Installer self-service ----
export const getInstallerJobs = (when = "today", installer) =>
  request(`/api/customer-work/installer/jobs`, { params: { when, installer } });