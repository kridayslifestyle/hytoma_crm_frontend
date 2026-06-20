import React, { useEffect, useState } from "react";
import {
  createInstallationEntry,
  listMyInstallationEntries,
} from "../services/employeeWorkApi";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function InstallationWorkForm({ user }) {
  const [form, setForm] = useState({
    date: todayISO(),
    installation_client_name: "",
    work_type: "",
    expected_completion_date: todayISO(),
    location: "",
  });
  const [recent, setRecent] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try {
      const r = await listMyInstallationEntries();
      setRecent(r.data || []);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      await createInstallationEntry(form);
      setMsg({ type: "success", text: "Entry saved." });
      setForm({
        date: todayISO(),
        installation_client_name: "",
        work_type: "",
        expected_completion_date: todayISO(),
        location: "",
      });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.detail || "Failed to save entry." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Installation — Daily Work</h1>
      <p style={s.subtitle}>Hi {user?.name}, log today's installation work.</p>

      <form onSubmit={onSubmit} style={s.card}>
        <h3 style={s.cardTitle}>Today's Entry</h3>

        <Row>
          <Field label="Name of Person">
            <input value={user?.name || ""} disabled style={s.input} />
          </Field>
          <Field label="Today's Date *">
            <input type="date" value={form.date} onChange={onChange("date")} required style={s.input} />
          </Field>
        </Row>

        <Row>
          <Field label="Installation Client Name *">
            <input value={form.installation_client_name} onChange={onChange("installation_client_name")} required style={s.input} />
          </Field>
          <Field label="Work Type (Installation Type) *">
            <input value={form.work_type} onChange={onChange("work_type")} required placeholder="e.g. AC installation, CCTV setup" style={s.input} />
          </Field>
        </Row>

        <Row>
          <Field label="Expected Work Completion Date *">
            <input type="date" value={form.expected_completion_date} onChange={onChange("expected_completion_date")} required style={s.input} />
          </Field>
          <Field label="Location *">
            <input value={form.location} onChange={onChange("location")} required style={s.input} />
          </Field>
        </Row>

        {msg && (
          <div style={{ ...s.msg, background: msg.type === "error" ? "#fee2e2" : "#dcfce7",
                        color: msg.type === "error" ? "#991b1b" : "#166534" }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={submitting} style={s.submitBtn}>
          {submitting ? "Saving..." : "Save Entry"}
        </button>
      </form>

      <div style={s.card}>
        <h3 style={s.cardTitle}>My Recent Entries</h3>
        {recent.length === 0 ? <p style={{ color: "#6b7280" }}>No entries yet.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr><th>Date</th><th>Client</th><th>Work Type</th><th>Completion</th><th>Location</th></tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.installation_client_name}</td>
                    <td>{r.work_type}</td>
                    <td>{r.expected_completion_date}</td>
                    <td>{r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const Row = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
);
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={s.label}>{label}</label>{children}
  </div>
);
const s = {
  page: { padding: 24, fontFamily: "system-ui, -apple-system, sans-serif", color: "#111827" },
  title: { margin: 0, fontSize: 28 },
  subtitle: { marginTop: 4, color: "#6b7280" },
  card: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", margin: "18px 0" },
  cardTitle: { marginTop: 0, marginBottom: 14, fontSize: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  submitBtn: { background: "#f97316", color: "#fff", border: "none", padding: "12px 22px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 6 },
  msg: { padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
};
