import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API}/api/sales/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const json = await res.json();
      setData(json);

      // default month selection
      const months = Object.keys(json.month_totals || {});
      if (months.length > 0) setSelectedMonth(months[0]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  const months = Object.keys(data.month_totals || {});
  const monthData = data.month_totals?.[selectedMonth];

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
          <Card title="Collected" value={`₹${monthData.collected}`} color="#16a34a" />
          <Card title="Pending" value={`₹${monthData.pending}`} color="#dc2626" />
          <Card title="Target" value={`₹${monthData.target}`} color="#2563eb" />
        </div>
      )}

      {/* TOP PERFORMER */}
      {data.top_performer_month?.[selectedMonth] && (
        <div style={styles.topCard}>
          🏆 Top Performer:{" "}
          <b>{data.top_performer_month[selectedMonth].name}</b>
          <br />
          💰 ₹{data.top_performer_month[selectedMonth].amount}
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div style={styles.tableCard}>
        <h3>Employee Performance ({selectedMonth})</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Collected</th>
              <th>Pending</th>
              <th>Target</th>
              <th>Carry Forward</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(data.employee_monthly || {}).map(
              ([name, months]) => {
                const m = months[selectedMonth];

                if (!m) return null;

                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>₹{m.collected}</td>
                    <td>₹{m.pending}</td>
                    <td>₹{m.target}</td>
                    <td style={{ color: m.carry_forward > 0 ? "red" : "green" }}>
                      ₹{m.carry_forward}
                    </td>
                  </tr>
                );
              }
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
  page: {
    padding: 20,
    fontFamily: "system-ui",
    background: "#f9fafb",
    minHeight: "100vh",
  },

  title: {
    fontSize: 28,
    marginBottom: 15,
  },

  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  tab: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
    marginBottom: 20,
  },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },

  topCard: {
    background: "#fff7ed",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },

  tableCard: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};