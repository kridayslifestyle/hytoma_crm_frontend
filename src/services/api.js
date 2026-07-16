const API =  import.meta.env.VITE_API_URL;


export const getSalesUsers = async () => {
  const res = await fetch(`${API}/users/sales-list`, { credentials: "include" });
  return res.json();
};


export const getLeads = async () => {
  const res = await fetch(`${API}/leads`,{
    credentials:"include"
  });
  return res.json();
};

export const addLead = async (data) => {
  const res = await fetch(`${API}/leads`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Fast-path entry: name (optional) + phone + sales person -> creates a
// minimal lead and immediately WhatsApp-notifies that sales person.
export const quickAddLead = async (data) => {
  const res = await fetch(`${API}/leads/quick`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send lead");
  }
  return res.json();
};

export const updateLead = async (id, data) => {
  const res = await fetch(`${API}/leads/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const logoutUser = async () => {
  await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("role");
  window.location.href = "/login";
};

export const deleteLead = async (id) => {
  await fetch(`${API}/leads/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
};

export const getInventory = async () => {
  const res = await fetch(`${API}/inventory`, { credentials: "include" });
  return res.json();
};

export const addProduct = async (data) => {
  const res = await fetch(`${API}/inventory`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProduct = async (id, data) => {
  const res = await fetch(`${API}/inventory/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProduct = async (id) => {
  await fetch(`${API}/inventory/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// COMPLAINTS
export const getComplaints = async () => {
  const res = await fetch(`${API}/complaints`, { credentials: "include" });
  return res.json();
};
export const addComplaint = async (data) => {
  const res = await fetch(`${API}/complaints`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const updateComplaint = async (id, data) => {
  const res = await fetch(`${API}/complaints/${id}`, {
    method: "PUT", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const deleteComplaint = async (id) => {
  await fetch(`${API}/complaints/${id}`, { method: "DELETE", credentials: "include" });
};

// SOCIAL ENQUIRIES
export const getSocialEnquiries = async () => {
  const res = await fetch(`${API}/social-enquiries`, { credentials: "include" });
  return res.json();
};
export const addSocialEnquiry = async (data) => {
  const res = await fetch(`${API}/social-enquiries`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const updateSocialEnquiry = async (id, data) => {
  const res = await fetch(`${API}/social-enquiries/${id}`, {
    method: "PUT", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const deleteSocialEnquiry = async (id) => {
  await fetch(`${API}/social-enquiries/${id}`, { method: "DELETE", credentials: "include" });
};

export const getPendingMovements = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/movements/pending`, {
    credentials: "include"
  });
  return res.json();
};

export const getImports = async () => {
  const res = await fetch(`${API}/imports`, { credentials: "include" }); // ✅
  return res.json();
};

export const addImport = async (data) => {
  const res = await fetch(`${API}/imports`, {  // ✅
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteImport = async (id) => {
  await fetch(`${API}/imports/${id}`, {  // ✅
    method: "DELETE", credentials: "include"
  });
};