import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { quickAddLead } from "../services/api";

// Real Leads sales roster (separate from the Site Visit roster on the
// public booking form — some names/numbers differ between the two).
const SALES_PERSONS = ["Revathi", "Suresh", "Manoj", "TS Naveen", "Rahul"];

export default function QuickLead() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", salesPerson: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [sentCount, setSentCount] = useState(0);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      flash("❌ Please enter a valid 10-digit phone number");
      return;
    }
    if (!form.salesPerson) {
      flash("❌ Please select a sales person");
      return;
    }
    setSending(true);
    try {
      await quickAddLead(form);
      flash(`✅ Lead sent to ${form.salesPerson} on WhatsApp`);
      setSentCount((c) => c + 1);
      // Keep sales person selected (usually she sends several leads to the
      // same person in a row), just clear name/phone for the next one.
      setForm((f) => ({ name: "", phone: "", salesPerson: f.salesPerson }));
    } catch (err) {
      flash(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quick Lead Entry</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter a lead and send it straight to a sales person on WhatsApp.
          </p>
        </div>
        <button
          onClick={() => navigate("/leads")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View Leads →
        </button>
      </div>

      {toast && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-gray-800 text-white">
          {toast}
        </div>
      )}

      {sentCount > 0 && (
        <div className="mb-4 text-xs text-gray-400">
          {sentCount} lead{sentCount > 1 ? "s" : ""} sent this session
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white rounded-xl shadow p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Name <span className="text-gray-400 font-normal">(if available)</span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Phone Number *
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={form.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((f) => ({ ...f, phone: val }));
            }}
            placeholder="10-digit number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Select Sales Person *
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={form.salesPerson}
            onChange={(e) => setForm((f) => ({ ...f, salesPerson: e.target.value }))}
            required
          >
            <option value="">Select</option>
            {SALES_PERSONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send to Sales Person"}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-4 text-center">
        The sales person will get this on WhatsApp right away. Once they've
        made contact, the rest of the lead's details can be filled in from
        the main Leads page (Edit Lead).
      </p>
    </div>
  );
}