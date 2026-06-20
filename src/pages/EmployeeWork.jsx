import React from "react";
import SalesWorkForm from "./SalesWorkForm";
import InstallationWorkForm from "./InstallationWorkForm";
import GeneralWorkForm from "./GeneralWorkForm";
import AdminWorkDashboard from "./AdminWorkDashboard";

// Adjust this to however your app stores the logged-in user (context, redux, localStorage)
function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function EmployeeWork() {
  const user = getCurrentUser();
  const role = (user?.role || "").toLowerCase();

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Please log in</h2>
      </div>
    );
  }

  if (role === "admin") return <AdminWorkDashboard />;
  if (role === "sales") return <SalesWorkForm user={user} />;
  if (role === "installation") return <InstallationWorkForm user={user} />;
  if (["marketing", "digital_marketing", "technical"].includes(role))
    return <GeneralWorkForm user={user} />;

  return (
    <div style={{ padding: 24 }}>
      <h2>No daily work form is configured for your role: <code>{role || "unknown"}</code></h2>
      <p>Please contact the admin.</p>
    </div>
  );
}
