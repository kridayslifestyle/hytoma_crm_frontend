const API_URL = import.meta.env.VITE_API_URL;

// Upload a reference photo for a switch board / curtain / sensor entry.
// Returns { url } to store on that item.
export const uploadRequirementImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/requirements/upload-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
};

// Get all requirements
export const getRequirements = async () => {
  const response = await fetch(`${API_URL}/requirements`, {
    credentials: "include",
  });

  return response.json();
};

// Create requirement
export const createRequirement = async (data) => {
  const response = await fetch(`${API_URL}/requirements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error("Failed to save requirement");
  }

  return response.json();
};

// Get single requirement
export const getRequirementById = async (id) => {
  const response = await fetch(`${API_URL}/requirements/${id}`, {
    credentials: "include",
  });

  return response.json();
};

// Update requirement (full object PUT)
export const updateRequirement = async (id, data) => {
  const response = await fetch(`${API_URL}/requirements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return response.json();
};

// Delete requirement
export const deleteRequirement = async (id) => {
  const response = await fetch(`${API_URL}/requirements/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return response.json();
};

// Save quotation (dedicated endpoint — does NOT touch other requirement fields)
export const saveQuotation = async (id, payload) => {
  const response = await fetch(`${API_URL}/requirements/${id}/quotation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error("Failed to save quotation");
  }

  return response.json();
};

// ---------------------------------------------------------------------------
// WhatsApp quotation workflow
// ---------------------------------------------------------------------------

// Send the quotation PDF to the client on WhatsApp (marks quotation_sent=true)
export const sendQuotationWhatsApp = async (id) => {
  const response = await fetch(`${API_URL}/requirements/${id}/send-quotation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return response.json();
};

// Update quotation workflow status: "pending" | "finalized" | "rejected"
export const updateQuotationStatus = async (id, status) => {
  const response = await fetch(
    `${API_URL}/requirements/${id}/quotation-status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ quotation_status: status }),
    },
  );

  return response.json();
};

// Send a WhatsApp follow-up reminder (optionally a custom message)
export const sendReminderWhatsApp = async (id, message) => {
  const response = await fetch(`${API_URL}/requirements/${id}/send-reminder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(message ? { message } : {}),
  });

  return response.json();
};