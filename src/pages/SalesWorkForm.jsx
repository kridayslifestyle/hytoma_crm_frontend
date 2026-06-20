import React, { useEffect, useState } from "react";
import {
  createSalesEntry,
  getMySalesSummary,
  listMySalesEntries,
} from "../services/employeeWorkApi";

const STATUS_OPTIONS = ["Interested", "Rejected", "Not Interested"];
const todayISO = () => new Date().toISOString().slice(0, 10);

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function SalesWorkForm({ user }) {
  const [form, setForm] = useState({
    date: todayISO(),
    site_visit_location: "",
    customer_name: "",
    reason_for_visit: "",
    status: "Interested",
    amount_collected: "",
    zero_amount_reason: "",
  });
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadAll = async () => {
    try {
      const [s, r] = await Promise.all([getMySalesSummary(), listMySalesEntries()]);
      setSummary(s.data);
      setRecent(r.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const isZero = Number(form.amount_collected || 0) === 0;

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.site_visit_location || !form.customer_name || !form.reason_for_visit) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }
    if (isZero && !form.zero_amount_reason.trim()) {
      setMsg({ type: "error", text: "Please enter a reason for ₹0 amount." });
      return;
    }
    setSubmitting(true);
    try {
      await createSalesEntry({
        ...form,
        amount_collected: Number(form.amount_collected || 0),
        zero_amount_reason: isZero ? form.zero_amount_reason : null,
      });
      setMsg({ type: "success", text: "Entry saved." });
      setForm({
        date: todayISO(),
        site_visit_location: "",
        customer_name: "",
        reason_for_visit: "",
        status: "Interested",
        amount_collected: "",
        zero_amount_reason: "",
      });
      loadAll();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.detail || "Failed to save entry." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Sales — Daily Work</h1>
      <p style={styles.subtitle}>Hi {user?.name || "there"}, log today's visit and collection.</p>

      {/* Target summary */}
      {summary && (
        <div style={styles.statGrid}>
          <Stat label="Monthly Target" value={inr(summary.target_amount)} color="#0ea5e9" />
          <Stat label="Collected so far" value={inr(summary.collected_so_far)} color="#16a34a" />
          <Stat label="Pending Amount" value={inr(summary.pending_amount)} color="#f97316" />
          <Stat label="Days Remaining" value={`${summary.days_remaining} days`} color="#7c3aed" />
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} style={styles.card}>
        <h3 style={styles.cardTitle}>Today's Entry</h3>

        <Row>
          <Field label="Name of Employee">
            <input value={user?.name || ""} disabled style={styles.input} />
          </Field>
          <Field label="Today's Date *">
            <input type="date" value={form.date} onChange={onChange("date")} required style={styles.input} />
          </Field>
        </Row>

        <Row>
          <Field label="Site Visit Location *">
            <input value={form.site_visit_location} onChange={onChange("site_visit_location")} required style={styles.input} />
          </Field>
          <Field label="Customer Name *">
            <input value={form.customer_name} onChange={onChange("customer_name")} required style={styles.input} />
          </Field>
        </Row>

        <Field label="Reason for Site Visit *">
          <textarea
            value={form.reason_for_visit}
            onChange={onChange("reason_for_visit")}
            required rows={3} style={{ ...styles.input, resize: "vertical" }}
          />
        </Field>

        <Field label="Status *">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUS_OPTIONS.map((s) => (
              <button
                type="button" key={s}
                onClick={() => setForm({ ...form, status: s })}
                style={{
                  ...styles.statusBtn,
                  background: form.status === s ? "#f97316" : "#fff",
                  color: form.status === s ? "#fff" : "#374151",
                  borderColor: form.status === s ? "#f97316" : "#d1d5db",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Row>
          <Field label="Total Amount Collected (₹) *">
            <input
              type="number" min="0" step="1"
              value={form.amount_collected}
              onChange={onChange("amount_collected")}
              required style={styles.input}
              placeholder="0"
            />
          </Field>
          <div />
        </Row>

        {isZero && form.amount_collected !== "" && (
          <Field label="Reason for ₹0 Amount *">
            <textarea
              value={form.zero_amount_reason}
              onChange={onChange("zero_amount_reason")}
              required rows={2}
              placeholder="Why was nothing collected today?"
              style={{ ...styles.input, resize: "vertical", borderColor: "#f59e0b" }}
            />
          </Field>
        )}

        {msg && (
          <div style={{ ...styles.msg, background: msg.type === "error" ? "#fee2e2" : "#dcfce7",
                        color: msg.type === "error" ? "#991b1b" : "#166534" }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? "Saving..." : "Save Entry"}
        </button>
      </form>

      {/* Recent entries */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>My Recent Entries</h3>
        {recent.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No entries yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Date</th><th>Customer</th><th>Location</th>
                  <th>Status</th><th>Amount</th><th>Reason / Zero Reason</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.site_visit_location}</td>
                    <td><StatusBadge s={r.status} /></td>
                    <td>{inr(r.amount_collected)}</td>
                    <td style={{ maxWidth: 260 }}>
                      {Number(r.amount_collected) === 0 ? r.zero_amount_reason : r.reason_for_visit}
                    </td>
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

// ---------- helpers ----------
const Stat = ({ label, value, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value}</div>
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const StatusBadge = ({ s }) => {
  const map = {
    "Interested": { bg: "#dcfce7", fg: "#166534" },
    "Rejected": { bg: "#fee2e2", fg: "#991b1b" },
    "Not Interested": { bg: "#fef3c7", fg: "#92400e" },
  };
  const c = map[s] || { bg: "#e5e7eb", fg: "#374151" };
  return <span style={{ background: c.bg, color: c.fg, padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{s}</span>;
};

const styles = {
  page: { padding: 24, fontFamily: "system-ui, -apple-system, sans-serif", color: "#111827" },
  title: { margin: 0, fontSize: 28 },
  subtitle: { marginTop: 4, color: "#6b7280" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "18px 0" },
  statCard: { background: "#fff", padding: 14, borderRadius: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  statLabel: { fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontWeight: 700, marginTop: 4 },
  card: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 18 },
  cardTitle: { marginTop: 0, marginBottom: 14, fontSize: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  statusBtn: { padding: "8px 14px", border: "1px solid", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 },
  submitBtn: { background: "#f97316", color: "#fff", border: "none", padding: "12px 22px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 6 },
  msg: { padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
};
