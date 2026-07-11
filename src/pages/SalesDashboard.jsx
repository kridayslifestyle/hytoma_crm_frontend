import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;
const ALL_KEY = "__ALL__";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(ALL_KEY);
  const [fromDate, setFromDate] = useState(""); // empty = no lower bound
  const [toDate, setToDate] = useState("");     // empty = no upper bound
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async (from, to) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from_date", from);
      if (to) params.set("to_date", to);

      const res = await fetch(`${API}/api/sales/dashboard?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();
      setData(json);
      setSelectedMonth(ALL_KEY); // always land on the combined view after a fetch
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => fetchDashboard(fromDate, toDate);
  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    fetchDashboard("", "");
  };

  if (!data && loading) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  const months = Object.keys(data?.month_totals || {}).sort();

  // ---- build the combined "All Months" view by summing across every month in range ----
  const buildAllMonths = () => {
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

  const isAll = selectedMonth === ALL_KEY;
  const { monthData, rows } = isAll
    ? buildAllMonths()
    : {
        monthData: data?.month_totals?.[selectedMonth],
        rows: Object.entries(data?.employee_monthly || {})
          .map(([name, monthsForEmp]) => ({ name, ...monthsForEmp[selectedMonth] }))
          .filter((r) => r.collected !== undefined),
      };

  const sortedRows = [...rows].sort((a, b) => b.collected - a.collected);

  // top performer: use backend's per-month value, or compute for "All" from totals
  const topPerformer = isAll
    ? (sortedRows[0] && sortedRows[0].collected > 0 ? sortedRows[0] : null)
    : data?.top_performer_month?.[selectedMonth];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Sales Dashboard</h1>

      {/* DATE RANGE FILTER */}
      <div style={styles.filterBar}>
        <div style={styles.filterField}>
          <label style={styles.filterLabel}>From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.dateInput} />
        </div>
        <div style={styles.filterField}>
          <label style={styles.filterLabel}>To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.dateInput} />
        </div>
        <button onClick={applyFilter} style={styles.applyBtn} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </button>
        {(fromDate || toDate) && (
          <button onClick={clearFilter} style={styles.clearBtn} disabled={loading}>
            Clear
          </button>
        )}
      </div>

      {/* MONTH TABS — every month with data, plus a combined "All Months" tab */}
      <div style={styles.tabs}>
        <button
          onClick={() => setSelectedMonth(ALL_KEY)}
          style={{
            ...styles.tab,
            background: isAll ? "#f97316" : "#fff",
            color: isAll ? "#fff" : "#333",
            fontWeight: 600,
          }}
        >
          All Months
        </button>
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
          <Card title={isAll ? "Total Target (all months)" : "Target (incl. carry-forward)"} value={inr(monthData.target)} color="#2563eb" />
        </div>
      )}

      {/* TOP PERFORMER */}
      {topPerformer && (
        <div style={styles.topCard}>
          🏆 Top Performer: <b>{topPerformer.name}</b>
          <br />
          💰 {inr(topPerformer.collected ?? topPerformer.amount)} collected {isAll ? "in this range" : "this month"}
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div style={styles.tableCard}>
        <h3>Employee Performance ({isAll ? "All Months" : selectedMonth})</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Collected</th>
              <th style={styles.th}>Pending</th>
              {!isAll && <th style={styles.th}>Base Target</th>}
              {!isAll && <th style={styles.th}>Carried From Last Month</th>}
              <th style={styles.th}>{isAll ? "Total Target" : "Effective Target"}</th>
              <th style={styles.th}>{isAll ? "Current Carry-Forward" : "Carry to Next Month"}</th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((r, i) => {
              const carriedIn = !isAll ? r.target - r.base_target : 0;
              const met = r.collected >= r.target;
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
                  {!isAll && <td style={styles.td}>{inr(r.base_target)}</td>}
                  {!isAll && <td style={styles.td}>{carriedIn > 0 ? inr(carriedIn) : "—"}</td>}
                  <td style={styles.td}>{inr(r.target)}</td>
                  <td style={{ ...styles.td, color: r.carry_forward > 0 ? "#dc2626" : "#16a34a" }}>
                    {met && !isAll ? "Target met ✅" : inr(r.carry_forward)}
                  </td>
                </tr>
              );
            })}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#9ca3af" }}>
                  No data for this range
                </td>
              </tr>
            )}
          </tbody>
        </table>
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