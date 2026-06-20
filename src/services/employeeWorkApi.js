import axios from "axios";

// Read backend URL from Vite env. Adjust the variable name if your project uses a different one.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HttpOnly `token` cookie
});

const base = "/api/employee-work";

// ---- Sales ----
export const createSalesEntry          = (payload)     => client.post(`${base}/sales`, payload);
export const listMySalesEntries        = (params = {}) => client.get(`${base}/sales/my`, { params });
export const getMySalesSummary         = ()            => client.get(`${base}/sales/my/summary`);

// ---- Installation ----
export const createInstallationEntry   = (payload)     => client.post(`${base}/installation`, payload);
export const listMyInstallationEntries = ()            => client.get(`${base}/installation/my`);

// ---- Marketing / Technical ----
export const createGeneralEntry        = (payload)     => client.post(`${base}/general`, payload);
export const listMyGeneralEntries      = ()            => client.get(`${base}/general/my`);

// ---- Admin ----
export const adminListAllWork          = (params = {}) => client.get(`${base}/admin/all`, { params });
export const adminListTargets          = ()            => client.get(`${base}/admin/targets`);
export const adminUpsertTarget         = (payload)     => client.post(`${base}/admin/targets`, payload);

// ---- Auth ----
export const fetchCurrentUser          = ()            => client.get(`/me`);

export default client;
