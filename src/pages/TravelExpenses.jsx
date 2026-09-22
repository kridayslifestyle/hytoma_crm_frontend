import { useState, useEffect } from "react";

const API = "https://hytomacrmbackend.up.railway.app";

export default function TravelExpenses() {
  const [form, setForm] = useState({
    personName: "",
    extraNote: "",
    date: "",
    km: "",
    purpose: "",
    customPurpose: "",
  });

  const [expenses, setExpenses] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  // ✅ LOAD DATA
  useEffect(() => {
    fetchExpenses();
    fetchMonthly();
  }, []);

  // ✅ GET EXPENSES
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API}/travel-expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.log("Fetch expenses error", err);
    }
  };

  // ✅ GET MONTHLY REPORT
  const fetchMonthly = async () => {
    try {
      const res = await fetch(`${API}/travel-expenses/monthly`);
      const data = await res.json();
      setMonthly(data);
    } catch (err) {
      console.log("Monthly fetch error", err);
    }
  };

  // ✅ ADD / UPDATE EXPENSE
  const handleAdd = async () => {
    if (!form.personName || !form.date || !form.km || !form.purpose) {
      alert("Please fill all fields");
      return;
    }

    try {
      // ✅ STEP 5: CREATE PAYLOAD (THIS IS THE IMPORTANT PART)
      const payload = {
        ...form,
        purpose: form.purpose === "Other" ? form.customPurpose : form.purpose,
      };

      if (editId) {
        // PUT (UPDATE)
        await fetch(`${API}/travel-expenses/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setEditId(null);
      } else {
        // POST (CREATE)
        await fetch(`${API}/travel-expenses/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchExpenses();
      fetchMonthly();

      setForm({
        personName: "",
        extraNote: "",
        date: "",
        km: "",
        purpose: "",
        customPurpose: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ EDIT
  const handleEdit = (item) => {
    setForm({
      personName: item.personName || "",
      date: item.date || "",
      km: item.km || "",
      purpose: item.purpose || "",
    });

    setEditId(item._id);
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/travel-expenses/${id}`, {
        method: "DELETE",
      });
      fetchExpenses();
      fetchMonthly();
    } catch (err) {
      console.log(err);
    }
  };

  const getAmount = (km) => Number(km || 0) * 3;

  const filteredExpenses = selectedMonth
    ? expenses.filter((e) => e.date?.startsWith(selectedMonth))
    : expenses;

  const monthlyTotal = filteredExpenses.reduce(
    (sum, e) => sum + getAmount(e.km),
    0,
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Travel Expenses</h1>

      {/* MONTH FILTER */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow">
        <label className="text-sm font-medium">Select Month</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded w-full mt-2"
        />
      </div>

      {/* MONTHLY TOTAL */}
      <div className="bg-green-50 p-4 rounded-xl shadow mb-4">
        <p className="text-sm text-gray-600">Monthly Travel Expense</p>
        <p className="text-2xl font-bold text-green-600">₹{monthlyTotal}</p>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-xl space-y-4">
        <input
          placeholder="Person Name"
          value={form.personName}
          onChange={(e) => setForm({ ...form, personName: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Extra Note"
          value={form.extraNote}
          onChange={(e) => setForm({ ...form, extraNote: e.target.value })}
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
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="">Select Purpose</option>
          <option value="Installation">Installation</option>
          <option value="Site Checking">Site Checking</option>
          <option value="Customer Visit">Customer Visit</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Other">Other</option>
        </select>

        {form.purpose === "Other" && (
          <input
            placeholder="Enter Custom Purpose"
            value={form.customPurpose}
            onChange={(e) =>
              setForm({ ...form, customPurpose: e.target.value })
            }
            className="border p-2 w-full rounded"
          />
        )}

        <button
          onClick={handleAdd}
          className="bg-orange-500 text-white px-4 py-2 rounded w-full"
        >
          {editId ? "Update Expense" : "+ Add Expense"}
        </button>
      </div>

      {/* LIST */}
      <div className="mt-6 space-y-3">
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-400 text-center mt-6">No expenses found</p>
        ) : (
          filteredExpenses.map((e) => (
            <div
              key={e._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{e.personName}</p>
                <p className="text-sm text-gray-500">
                  {e.date} • {e.km} KM • {e.purpose}
                </p>
                <p className="text-sm font-bold text-green-600 mt-1">
                  ₹{getAmount(e.km)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(e)}
                  className="text-blue-500 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(e._id)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MONTHLY REPORT */}
      <div className="mt-10 bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-4">📊 Monthly Travel Report</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Person</th>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">KM</th>
              <th className="p-2 text-left">Amount</th>
            </tr>
          </thead>

          <tbody>
            {monthly.map((m, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{m.person}</td>
                <td className="p-2">{m.month}</td>
                <td className="p-2">{m.km}</td>
                <td className="p-2 font-bold text-orange-500">₹{m.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
