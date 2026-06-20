import React, { useEffect, useState } from "react";
import {
  adminListAllWork,
  adminListTargets,
  adminUpsertTarget,
} from "../services/employeeWorkApi";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => {
  const d = new Date(); d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export default function AdminWorkDashboard() {
  const [tab, setTab] = useState("sales"); // sales | installation | general | targets
  const [filters, setFilters] = useState({ start: monthStartISO(), end: todayISO(), role: "" });
  const [data, setData] = useState({ sales: [], installation: [], general: [] });
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [w, t] = await Promise.all([
        adminListAllWork({ start: filters.start, end: filters.end, role: filters.role || undefined }),
        adminListTargets(),
      ]);
      setData(w.data || { sales: [], installation: [], general: [] });
      setTargets(t.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onSetTarget = async (userId, currentAmount) => {
    const val = window.prompt("Enter monthly target (₹) for this sales person:", currentAmount || "300000");
    if (!val) return;
    const num = Number(val);
    if (!num || num <= 0) return alert("Enter a valid positive number");
    try {
      await adminUpsertTarget({ user_id: userId, target_amount: num });
      load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to update target");
    }
  };

  const exportCsv = () => {
    const rows = [];
    if (tab === "sales") {
      rows.push(["Date","Employee","Customer","Location","Status","Amount","Reason","Zero Amt Reason"]);
      data.sales.forEach(r => rows.push([
        r.date, r.employee_name, r.customer_name, r.site_visit_location,
        r.status, r.amount_collected, (r.reason_for_visit||"").replace(/\n/g," "),
        (r.zero_amount_reason||"").replace(/\n/g," ")
      ]));
    } else if (tab === "installation") {
      rows.push(["Date","Employee","Client","Work Type","Expected Completion","Location"]);
      data.installation.forEach(r => rows.push([
        r.date, r.employee_name, r.installation_client_name, r.work_type,
        r.expected_completion_date, r.location
      ]));
    } else if (tab === "general") {
      rows.push(["Date","Employee","Role","Work Details"]);
      data.general.forEach(r => rows.push([
        r.date, r.employee_name, r.role, (r.work_details||"").replace(/\n/g," ")
      ]));
    } else if (tab === "targets") {
      rows.push(["Employee","Email","Target","Collected","Pending","Days Remaining","Cycle Start","Cycle End"]);
      targets.forEach(r => rows.push([
        r.employee_name, r.email, r.target_amount, r.collected_so_far,
        r.pending_amount, r.days_remaining, r.cycle_start, r.cycle_end
      ]));
    }
    const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `daily-work-${tab}-${todayISO()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Admin — Employee Daily Work</h1>

      <div style={s.toolbar}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["sales","Sales"],
            ["installation","Installation"],
            ["general","Marketing / Technical"],
            ["targets","Targets"],
          ].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
                    style={{ ...s.tab, ...(tab===k ? s.tabActive : {}) }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={s.flabel}>From</label>
          <input type="date" value={filters.start} onChange={e=>setFilters({...filters, start: e.target.value})} style={s.finput}/>
          <label style={s.flabel}>To</label>
          <input type="date" value={filters.end} onChange={e=>setFilters({...filters, end: e.target.value})} style={s.finput}/>
          <select value={filters.role} onChange={e=>setFilters({...filters, role: e.target.value})} style={s.finput}>
            <option value="">All roles</option>
            <option value="sales">Sales</option>
            <option value="installation">Installation</option>
            <option value="marketing">Marketing</option>
            <option value="technical">Technical</option>
          </select>
          <button onClick={load} style={s.applyBtn}>Apply</button>
          <button onClick={exportCsv} style={s.exportBtn}>⬇ Export CSV</button>
        </div>
      </div>

      {loading && <p>Loading…</p>}

      {tab === "sales" && (
        <Section title={`Sales Entries (${data.sales.length})`}>
          <Table headers={["Date","Employee","Customer","Location","Status","Amount","Reason"]} rows={data.sales.map(r=>[
            r.date, r.employee_name, r.customer_name, r.site_visit_location, r.status,
            inr(r.amount_collected),
            Number(r.amount_collected)===0 ? `(₹0) ${r.zero_amount_reason||""}` : r.reason_for_visit,
          ])}/>
        </Section>
      )}

      {tab === "installation" && (
        <Section title={`Installation Entries (${data.installation.length})`}>
          <Table headers={["Date","Employee","Client","Work Type","Expected Completion","Location"]} rows={data.installation.map(r=>[
            r.date, r.employee_name, r.installation_client_name, r.work_type, r.expected_completion_date, r.location
          ])}/>
        </Section>
      )}

      {tab === "general" && (
        <Section title={`Marketing / Technical Entries (${data.general.length})`}>
          <Table headers={["Date","Employee","Role","Work Details"]} rows={data.general.map(r=>[
            r.date, r.employee_name, r.role, r.work_details
          ])}/>
        </Section>
      )}

      {tab === "targets" && (
        <Section title="Sales Targets & Performance (Current 30-Day Cycle)">
          <table style={s.table}>
            <thead>
              <tr>
                <th>Employee</th><th>Email</th><th>Target</th><th>Collected</th>
                <th>Pending</th><th>Progress</th><th>Days Left</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {targets.map(t => {
                const pct = t.target_amount ? Math.min(100, (t.collected_so_far/t.target_amount)*100) : 0;
                return (
                  <tr key={t.user_id}>
                    <td>{t.employee_name}</td>
                    <td>{t.email}</td>
                    <td>{inr(t.target_amount)}</td>
                    <td>{inr(t.collected_so_far)}</td>
                    <td>{inr(t.pending_amount)}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={s.progressBg}>
                        <div style={{ ...s.progressFg, width: `${pct}%` }} />
                      </div>
                      <small style={{ color: "#6b7280" }}>{pct.toFixed(0)}%</small>
                    </td>
                    <td>{t.days_remaining}</td>
                    <td>
                      <button style={s.smallBtn} onClick={() => onSetTarget(t.user_id, t.target_amount)}>
                        {t.target_amount ? "Edit" : "Set"} Target
                      </button>
                    </td>
                  </tr>
                );
              })}
              {targets.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#6b7280", padding: 20 }}>
                  No sales users found.
                </td></tr>
              )}
            </tbody>
          </table>
        </Section>
      )}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={s.card}>
    <h3 style={s.cardTitle}>{title}</h3>
    <div style={{ overflowX: "auto" }}>{children}</div>
  </div>
);

const Table = ({ headers, rows }) => (
  <table style={s.table}>
    <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>
      {rows.length === 0 ? (
        <tr><td colSpan={headers.length} style={{ textAlign:"center", color:"#6b7280", padding:20 }}>No entries.</td></tr>
      ) : rows.map((r,i)=>(
        <tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>
      ))}
    </tbody>
  </table>
);

const s = {
  page: { padding: 24, fontFamily: "system-ui, -apple-system, sans-serif", color: "#111827" },
  title: { margin: 0, fontSize: 28 },
  toolbar: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, margin: "18px 0" },
  tab: { padding: "8px 14px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  tabActive: { background: "#f97316", color: "#fff", borderColor: "#f97316" },
  flabel: { fontSize: 13, color: "#6b7280" },
  finput: { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 },
  applyBtn: { background: "#111827", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer" },
  exportBtn: { background: "#16a34a", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer" },
  card: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", margin: "12px 0" },
  cardTitle: { marginTop: 0, marginBottom: 14, fontSize: 18 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  smallBtn: { background: "#f97316", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  progressBg: { background: "#e5e7eb", height: 8, borderRadius: 4, overflow: "hidden" },
  progressFg: { background: "#16a34a", height: "100%" },
};
