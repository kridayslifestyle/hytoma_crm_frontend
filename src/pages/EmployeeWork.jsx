import React, { useEffect, useState } from "react";
import { fetchCurrentUser } from "../services/employeeWorkApi";
import SalesWorkForm from "./SalesWorkForm";
import InstallationWorkForm from "./InstallationWorkForm";
import GeneralWorkForm from "./GeneralWorkForm";
import AdminWorkDashboard from "./AdminWorkDashboard";

export default function EmployeeWork() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCurrentUser();
        setUser(res.data);
      } catch (e) {
        setError("Please log in to access this page.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error || !user)
    return (
      <div style={{ padding: 24 }}>
        <h2>{error || "Not authenticated"}</h2>
      </div>
    );

  const role = (user.role || "").toLowerCase();

  if (role === "admin") return <AdminWorkDashboard />;
  if (role === "sales") return <SalesWorkForm user={user} />;
  if (role === "installation") return <InstallationWorkForm user={user} />;
  if (["marketer", "marketing", "technician", "technical", "digital_marketing"].includes(role))
    return <GeneralWorkForm user={user} />;

  return (
    <div style={{ padding: 24 }}>
      <h2>
        No daily work form is configured for your role: <code>{role || "unknown"}</code>
      </h2>
      <p>Please contact the admin.</p>
    </div>
  );
}
