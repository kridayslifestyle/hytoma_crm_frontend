import React, { useEffect, useState } from "react";
import { getSalesUsers } from "../services/api";

const API = import.meta.env.VITE_API_URL;

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState(""); // empty = no lower bound
  const [toDate, setToDate] = useState("");     // empty = no upper bound
  const [salesPerson, setSalesPerson] = useState(""); // "" = everyone
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Target management ----
  const [showTargets, setShowTargets] = useState(false);
  const [targets, setTargets] = useState([]); // [{user_id, employee_name, target_amount, ...}]
  const [targetDrafts, setTargetDrafts] = useState({}); // user_id -> string being typed
  const [savingTargetId, setSavingTargetId] = useState(null);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [targetsError, setTargetsError] = useState("");

  const fetchTargets = async () => {
    setTargetsLoading(true);
    setTargetsError("");
    try {
      const res = await fetch(`${API}/api/employee-work/admin/targets`, { credentials: "include" });
      if (res.status === 403) {
        setTargetsError("Only admins can manage targets.");
        setTargets([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to load targets");
      const json = await res.json();
      setTargets(Array.isArray(json) ? json : []);
      const drafts = {};
      (Array.isArray(json) ? json : []).forEach((t) => {
        drafts[t.user_id] = t.target_amount;
      });
      setTargetDrafts(drafts);
    } catch (err) {
      console.error(err);
      setTargetsError("Failed to load targets.");
    } finally {
      setTargetsLoading(false);
    }
  };

  const saveTarget = async (userId) => {
    const value = Number(targetDrafts[userId]);
    if (!value || value <= 0) {
      alert("Please enter a target amount greater than 0.");
      return;
    }
    setSavingTargetId(userId);
    try {
      const res = await fetch(`${API}/api/employee-work/admin/targets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, target_amount: value }),
      });
      if (!res.ok) throw new Error("Failed to save target");
      await fetchTargets();
      // Refresh the dashboard figures so carry-forward reflects the new target immediately.
      fetchDashboard(fromDate, toDate, salesPerson);
    } catch (err) {
      alert("Failed to save target. Please try again.");
      console.error(err);
    } finally {
      setSavingTargetId(null);
    }
  };

  const toggleTargets = () => {
    const next = !showTargets;
    setShowTargets(next);
    if (next && targets.length === 0) fetchTargets();
  };

  useEffect(() => {
    fetchDashboard(fromDate, toDate, salesPerson);
    getSalesUsers().then(setSalesUsers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async (from, to, person) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from_date", from);
      if (to) params.set("to_date", to);
      if (person) params.set("sales_person", person);

      const res = await fetch(`${API}/api/sales/dashboard?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => fetchDashboard(fromDate, toDate, salesPerson);
  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setSalesPerson("");
    fetchDashboard("", "", "");
  };

  if (!data && loading) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  const months = Object.keys(data?.month_totals || {}).sort();

  // Combined summary across every month in the selected range (there's no
  // per-month tab view anymore — this is always the whole-range figure).
  const buildSummary = () => {
    const totals = { collected: 0, pending: 0, target: 0 };
    months.forEach((m) => {
      const md = data.month_totals[m];
      totals.collected += md.collected;
      totals.pending += md.pending;
      totals.target += md.target;
    });

    const perEmployee = {};
    Object.entries(data?.employee_monthly || {}).forEach(([name, monthsForEmp]) => {
      let collected = 0, pending = 0, target = 0, lastCarry = 0, lastMonthKey = null;
      months.forEach((m) => {
        const md = monthsForEmp[m];
        if (!md) return;
        collected += md.collected;
        pending += md.pending;
        target += md.target;
        if (!lastMonthKey || m > lastMonthKey) {
          lastMonthKey = m;
          lastCarry = md.carry_forward;
        }
      });
      if (lastMonthKey) {
        perEmployee[name] = { name, collected, pending, target, base_target: target, carry_forward: lastCarry };
      }
    });

    return { monthData: totals, rows: Object.values(perEmployee) };
  };

  const { monthData, rows } = buildSummary();
  const sortedRows = [...rows].sort((a, b) => b.collected - a.collected);

  const topPerformer =
    sortedRows[0] && sortedRows[0].collected > 0 ? sortedRows[0] : null;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Sales Dashboard</h1>

      {/* FILTERS: date range + sales person */}
      <div style={styles.filterBar}>
        <div style={styles.filterField}>
          <label style={styles.filterLabel}>From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.dateInput} />
        </div>
        <div style={styles.filterField}>
          <label style={styles.filterLabel}>To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.dateInput} />
        </div>
        <div style={styles.filterField}>
          <label style={styles.filterLabel}>Sales Person</label>
          <select value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} style={styles.dateInput}>
            <option value="">All Sales Persons</option>
            {salesUsers.map((u) => (
              <option key={u.id || u.name} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>
        <button onClick={applyFilter} style={styles.applyBtn} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </button>
        {(fromDate || toDate || salesPerson) && (
          <button onClick={clearFilter} style={styles.clearBtn} disabled={loading}>
            Clear
          </button>
        )}
        <button onClick={toggleTargets} style={styles.clearBtn}>
          {showTargets ? "Hide Targets" : "🎯 Manage Targets"}
        </button>
      </div>

      {/* TARGET MANAGEMENT */}
      {showTargets && (
        <div style={styles.tableCard}>
          <h3>Monthly Targets</h3>
          <p style={styles.note}>
            Set each person's target. Carry-forward calculations use whatever target is saved here.
          </p>
          {targetsLoading ? (
            <p>Loading targets...</p>
          ) : targetsError ? (
            <p style={{ color: "#dc2626" }}>{targetsError}</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Current Target</th>
                  <th style={styles.th}>New Target</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <tr key={t.user_id}>
                    <td style={styles.td}>{t.employee_name}</td>
                    <td style={styles.td}>{inr(t.target_amount)}</td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="1"
                        value={targetDrafts[t.user_id] ?? ""}
                        onChange={(e) =>
                          setTargetDrafts((d) => ({ ...d, [t.user_id]: e.target.value }))
                        }
                        style={{ ...styles.dateInput, width: 140 }}
                      />
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => saveTarget(t.user_id)}
                        disabled={savingTargetId === t.user_id}
                        style={styles.applyBtn}
                      >
                        {savingTargetId === t.user_id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
                {targets.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ ...styles.td, textAlign: "center", color: "#9ca3af" }}>
                      No sales users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SUMMARY CARDS */}
      {monthData && (
        <div style={styles.grid}>
          <Card title="Collected" value={inr(monthData.collected)} color="#16a34a" />
          <Card title="Pending" value={inr(monthData.pending)} color="#dc2626" />
          <Card title="Total Target (selected range)" value={inr(monthData.target)} color="#2563eb" />
        </div>
      )}

      {/* TOP PERFORMER */}
      {topPerformer && !salesPerson && (
        <div style={styles.topCard}>
          🏆 Top Performer: <b>{topPerformer.name}</b>
          <br />
          💰 {inr(topPerformer.collected)} collected in this range
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div style={styles.tableCard}>
        <h3>Employee Performance{salesPerson ? ` — ${salesPerson}` : ""}</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Collected</th>
              <th style={styles.th}>Pending</th>
              <th style={styles.th}>Total Target</th>
              <th style={styles.th}>Current Carry-Forward</th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((r, i) => {
              const zero = r.collected === 0;
              return (
                <tr
                  key={r.name}
                  style={i === 0 && !zero ? { background: "#fff7ed" } : zero ? { color: "#9ca3af" } : undefined}
                >
                  <td style={styles.td}>
                    {i === 0 && !zero && "🏆 "}
                    {r.name}
                  </td>
                  <td style={{ ...styles.td, color: zero ? "#9ca3af" : "#16a34a", fontWeight: 600 }}>
                    {inr(r.collected)}
                  </td>
                  <td style={styles.td}>{inr(r.pending)}</td>
                  <td style={styles.td}>{inr(r.target)}</td>
                  <td style={{ ...styles.td, color: r.carry_forward > 0 ? "#dc2626" : "#16a34a" }}>
                    {inr(r.carry_forward)}
                  </td>
                </tr>
              );
            })}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: "center", color: "#9ca3af" }}>
                  No data for this range
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p style={styles.note}>
          Carry-forward only accumulates from June 2026 onward — shortfalls before that month aren't carried into targets.
        </p>
      </div>
    </div>
  );
}

const Card = ({ title, value, color }) => (
  <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
    <h4 style={{ margin: 0 }}>{title}</h4>
    <h2 style={{ margin: "6px 0 0 0" }}>{value}</h2>
  </div>
);

const styles = {
  page: { padding: 20, fontFamily: "system-ui", background: "#f9fafb", minHeight: "100vh" },
  title: { fontSize: 28, marginBottom: 15 },
  filterBar: {
    display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap",
    background: "#fff", padding: 14, borderRadius: 10, marginBottom: 16,
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  filterField: { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  dateInput: { padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6 },
  applyBtn: { background: "#f97316", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  clearBtn: { background: "#fff", color: "#374151", border: "1px solid #d1d5db", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15, marginBottom: 20 },
  card: { background: "#fff", padding: 15, borderRadius: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  topCard: { background: "#fff7ed", padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  tableCard: { background: "#fff", padding: 15, borderRadius: 10, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #eee", whiteSpace: "nowrap" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f1f1f1", whiteSpace: "nowrap" },
  note: { fontSize: 12, color: "#9ca3af", marginTop: 10 },
};