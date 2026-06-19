const API_URL = import.meta.env.VITE_API_URL;

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

// Update requirement (full object only — customer info, switch boards, etc.)
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

// Save quotation (items + pricing) — hits the dedicated quotation endpoint
// which accepts a partial dict and won't wipe out other requirement fields.
export const saveQuotation = async (id, data) => {
  const response = await fetch(`${API_URL}/requirements/${id}/quotation`, {
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
    throw new Error("Failed to save quotation");
  }

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