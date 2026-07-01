import { useState, useEffect } from "react";

export default function TravelExpenses() {
  const [form, setForm] = useState({
    personName: "",
    date: "",
    km: "",
    purpose: "",
  });

  const [expenses, setExpenses] = useState([]);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    fetchMonthly();
  }, []);

  const fetchMonthly = async () => {
    const res = await fetch("/travel-expenses/monthly");
    const data = await res.json();
    setMonthly(data);
  };

  const handleAdd = () => {
    if (!form.personName || !form.date || !form.km || !form.purpose) {
      alert("Please fill all fields");
      return;
    }

    setExpenses([...expenses, form]);

    setForm({
      personName: "",
      date: "",
      km: "",
      purpose: "",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Travel Expenses</h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-xl space-y-4">
        <input
          placeholder="Person Name"
          value={form.personName}
          onChange={(e) =>
            setForm({ ...form, personName: e.target.value })
          }
          className="border p-2 w-full rounded"
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          type="number"
          placeholder="KM Travelled"
          value={form.km}
          onChange={(e) => setForm({ ...form, km: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <select
          value={form.purpose}
          onChange={(e) =>
            setForm({ ...form, purpose: e.target.value })
          }
          className="border p-2 w-full rounded"
        >
          <option value="">Select Purpose</option>
          <option value="Installation">Installation</option>
          <option value="Site Checking">Site Checking</option>
          <option value="Customer Visit">Customer Visit</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Other">Other</option>
        </select>

        <button
          onClick={handleAdd}
          className="bg-orange-500 text-white px-4 py-2 rounded w-full"
        >
          + Add Expense
        </button>
      </div>

      {/* EXPENSE LIST */}
      <div className="mt-6 space-y-3">
        {expenses.map((e, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg shadow"
          >
            <p className="font-semibold">{e.personName}</p>
            <p className="text-sm text-gray-500">
              {e.date} • {e.km} KM • {e.purpose}
            </p>
          </div>
        ))}
      </div>

      {/* MONTHLY REPORT (FIXED POSITION - OUTSIDE LOOP) */}
      <div className="mt-10 bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-4">
          📊 Monthly Travel Report
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Person</th>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">KM</th>
              <th className="p-2 text-left">Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {monthly.map((m, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{m.person}</td>
                <td className="p-2">{m.month}</td>
                <td className="p-2">{m.km}</td>
                <td className="p-2 font-bold text-orange-500">
                  ₹{m.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}