import api from "./api"; 

const base = "/api/employee-work";

// ---- Sales ----
export const createSalesEntry        = (payload)        => api.post(`${base}/sales`, payload);
export const listMySalesEntries      = (params = {})    => api.get(`${base}/sales/my`, { params });
export const getMySalesSummary       = ()               => api.get(`${base}/sales/my/summary`);

// ---- Installation ----
export const createInstallationEntry = (payload)        => api.post(`${base}/installation`, payload);
export const listMyInstallationEntries = ()             => api.get(`${base}/installation/my`);

// ---- Marketing / Technical ----
export const createGeneralEntry      = (payload)        => api.post(`${base}/general`, payload);
export const listMyGeneralEntries    = ()               => api.get(`${base}/general/my`);

// ---- Admin ----
export const adminListAllWork        = (params = {})    => api.get(`${base}/admin/all`, { params });
export const adminListTargets        = ()               => api.get(`${base}/admin/targets`);
export const adminUpsertTarget       = (payload)        => api.post(`${base}/admin/targets`, payload);
