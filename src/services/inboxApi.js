const API_URL = import.meta.env.VITE_API_URL;

export const getConversations = async () => {
  const response = await fetch(`${API_URL}/api/inbox/conversations`, {
    credentials: "include",
  });
  return response.json();
};

export const getThread = async (phone) => {
  const response = await fetch(`${API_URL}/api/inbox/messages/${phone}`, {
    credentials: "include",
  });
  return response.json();
};

export const sendReply = async (phone, message) => {
  const response = await fetch(`${API_URL}/api/inbox/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to send reply");
  }

  return response.json();
};