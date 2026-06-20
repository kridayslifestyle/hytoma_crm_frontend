import React, { useEffect, useState } from "react";
import {
  createGeneralEntry,
  listMyGeneralEntries,
} from "../services/employeeWorkApi";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function GeneralWorkForm({ user }) {
  const [form, setForm] = useState({ date: todayISO(), work_details: "" });
  const [recent, setRecent] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try { const r = await listMyGeneralEntries(); setRecent(r.data || []); }
    catch (e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.work_details.trim()) {
      setMsg({ type: "error", text: "Please describe today's work." });
      return;
    }
    setSubmitting(true);
    try {
      await createGeneralEntry(form);
      setMsg({ type: "success", text: "Entry saved." });
      setForm({ date: todayISO(), work_details: "" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.detail || "Failed to save entry." });
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (user?.role || "").replace("_", " ");

  return (
    <div style={s.page}>
      <h1 style={s.title}>{roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)} — Daily Work</h1>
      <p style={s.subtitle}>Hi {user?.name}, log what you worked on today.</p>

      <form onSubmit={onSubmit} style={s.card}>
        <h3 style={s.cardTitle}>Today's Entry</h3>

        <Row>
          <Field label="Name">
            <input value={user?.name || ""} disabled style={s.input} />
          </Field>
          <Field label="Date *">
            <input type="date" value={form.date} onChange={onChange("date")} required style={s.input} />
          </Field>
        </Row>

        <Field label="Work Details *">
          <textarea
            value={form.work_details}
            onChange={onChange("work_details")}
            rows={5} required
            placeholder="Describe today's tasks, accomplishments, blockers, etc."
            style={{ ...s.input, resize: "vertical" }}
          />
        </Field>

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
          <table style={s.table}>
            <thead><tr><th>Date</th><th>Work Details</th></tr></thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: "nowrap", verticalAlign: "top" }}>{r.date}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{r.work_details}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  title: { margin: 0, fontSize: 28, textTransform: "capitalize" },
  subtitle: { marginTop: 4, color: "#6b7280" },
  card: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", margin: "18px 0" },
  cardTitle: { marginTop: 0, marginBottom: 14, fontSize: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  submitBtn: { background: "#f97316", color: "#fff", border: "none", padding: "12px 22px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 6 },
  msg: { padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
};
