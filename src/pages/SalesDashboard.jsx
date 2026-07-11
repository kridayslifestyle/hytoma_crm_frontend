import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API}/api/sales/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();
      setData(json);

      const months = Object.keys(json.month_totals || {}).sort();
      if (months.length > 0) setSelectedMonth(months[months.length - 1]); // default: latest month
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  const months = Object.keys(data.month_totals || {}).sort();
  const monthData = data.month_totals?.[selectedMonth];

  // build this month's employee rows, sorted best performer first
  const rows = Object.entries(data.employee_monthly || {})
    .map(([name, monthsForEmp]) => ({ name, ...monthsForEmp[selectedMonth] }))
    .filter((r) => r.collected !== undefined)
    .sort((a, b) => b.collected - a.collected);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Sales Dashboard</h1>

      {/* MONTH TABS */}
      <div style={styles.tabs}>
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            style={{
              ...styles.tab,
              background: selectedMonth === m ? "#f97316" : "#fff",
              color: selectedMonth === m ? "#fff" : "#333",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      {monthData && (
        <div style={styles.grid}>
          <Card title="Collected" value={inr(monthData.collected)} color="#16a34a" />
          <Card title="Pending" value={inr(monthData.pending)} color="#dc2626" />
          <Card title="Target (incl. carry-forward)" value={inr(monthData.target)} color="#2563eb" />
        </div>
      )}

      {/* TOP PERFORMER */}
      {data.top_performer_month?.[selectedMonth] && (
        <div style={styles.topCard}>
          🏆 Top Performer: <b>{data.top_performer_month[selectedMonth].name}</b>
          <br />
          💰 {inr(data.top_performer_month[selectedMonth].amount)} collected this month
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div style={styles.tableCard}>
        <h3>Employee Performance ({selectedMonth})</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Collected</th>
              <th style={styles.th}>Pending</th>
              <th style={styles.th}>Base Target</th>
              <th style={styles.th}>Carried From Last Month</th>
              <th style={styles.th}>Effective Target</th>
              <th style={styles.th}>Carry to Next Month</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              const carriedIn = r.target - r.base_target; // what was added on top this month
              const met = r.collected >= r.target;
              return (
                <tr key={r.name} style={i === 0 ? { background: "#fff7ed" } : undefined}>
                  <td style={styles.td}>
                    {i === 0 && "🏆 "}
                    {r.name}
                  </td>
                  <td style={{ ...styles.td, color: "#16a34a", fontWeight: 600 }}>{inr(r.collected)}</td>
                  <td style={styles.td}>{inr(r.pending)}</td>
                  <td style={styles.td}>{inr(r.base_target)}</td>
                  <td style={styles.td}>{carriedIn > 0 ? inr(carriedIn) : "—"}</td>
                  <td style={styles.td}>{inr(r.target)}</td>
                  <td style={{ ...styles.td, color: r.carry_forward > 0 ? "#dc2626" : "#16a34a" }}>
                    {met ? "Target met ✅" : inr(r.carry_forward)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#9ca3af" }}>
                  No data for this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

const Card = ({ title, value, color }) => (
  <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
    <h4 style={{ margin: 0 }}>{title}</h4>
    <h2 style={{ margin: "6px 0 0 0" }}>{value}</h2>
  </div>
);

/* ---------------- STYLES ---------------- */

const styles = {
  page: { padding: 20, fontFamily: "system-ui", background: "#f9fafb", minHeight: "100vh" },
  title: { fontSize: 28, marginBottom: 15 },
  tabs: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  tab: { padding: "6px 12px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15, marginBottom: 20 },
  card: { background: "#fff", padding: 15, borderRadius: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  topCard: { background: "#fff7ed", padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  tableCard: { background: "#fff", padding: 15, borderRadius: 10, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #eee", whiteSpace: "nowrap" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f1f1f1", whiteSpace: "nowrap" },
};