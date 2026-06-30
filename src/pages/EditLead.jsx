import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateLead, getLeads } from "../services/api";

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    status: "",
    leadType: "",
    leadSource: "",
    salesPerson: "",
    totalAmount: "",
    advancePaid: "",
    quotationSent: false,
    followUpDate: "",
    pendingAmountReason: "",
    acceptanceReason: "",
    rejectionReason: "",
  });

  useEffect(() => {
    fetchLead();
  }, []);

  const fetchLead = async () => {
    const leads = await getLeads();
    const lead = leads.find((l) => l._id === id);

    if (lead) {
      setForm({
        name: lead.name || "",
        phone: lead.phone || "",
        status: lead.status || "",
        leadType: lead.leadType || "",
        leadSource: lead.leadSource || "",
        salesPerson: lead.salesPerson || "",
        totalAmount: lead.totalAmount || "",
        advancePaid: lead.advancePaid || "",
        quotationSent: lead.quotationSent || false,
        followUpDate: lead.followUpDate || "",
        pendingAmountReason: lead.pendingAmountReason || "",
        acceptanceReason: lead.acceptanceReason || "",
        rejectionReason: lead.rejectionReason || "",
      });
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.phone)) {
      showToast("❌ Please enter a valid 10-digit phone number");
      return;
    }

    if (!form.status) {
      showToast("❌ Please select a status");
      return;
    }

    try {
      const data = { ...form };
      delete data._id;
      await updateLead(id, data);
      setToast("✅ Lead Updated Successfully");
      setTimeout(() => {
        setToast("");
        navigate("/leads");
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast("❌ Error updating lead");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Lead</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Customer Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-3 py-2 rounded-lg w-full"
            />
            <div>
              <input
                placeholder="Phone Number (10 digits)"
                value={form.phone}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) setForm({ ...form, phone: val });
                }}
                className={`border px-3 py-2 rounded-lg w-full ${
                  form.phone && form.phone.length !== 10 ? "border-red-400" : ""
                }`}
              />
              {form.phone && form.phone.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">
                  {form.phone.length}/10 digits entered
                </p>
              )}
              {form.phone && form.phone.length === 10 && (
                <p className="text-green-500 text-xs mt-1">✔ Valid number</p>
              )}
            </div>
          </div>

          {/* Status */}
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          >
            <option value="" disabled>
              Select Status
            </option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>

          {/* Lead Type */}
          <select
            value={form.leadType}
            onChange={(e) => setForm({ ...form, leadType: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          >
            <option value="" disabled>
              Select Lead Type
            </option>
            <option value="B2C">B2C — Individual Customer</option>
            <option value="B2B">B2B — Business / Interior</option>
          </select>

          {/* Lead Source */}
          <select
            value={form.leadSource}
            onChange={(e) => setForm({ ...form, leadSource: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          >
            <option value="" disabled>
              Select Lead Source
            </option>
            <option value="Social Media">Social Media</option>
            <option value="Referral">Referral</option>
            <option value="Phone Call">Phone Call</option>
            <option value="Walk-in">Walk-in</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Ads">Ads</option>
            <option value="Other">Other</option>
          </select>

          {/* Sales Person */}
          <input
            placeholder="Sales Person"
            value={form.salesPerson}
            onChange={(e) => setForm({ ...form, salesPerson: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          />

          {/* Amounts */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Amount"
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: e.target.value })
              }
              className="border px-3 py-2 rounded-lg w-full"
            />
            <input
              type="number"
              placeholder="Advance Paid"
              value={form.advancePaid}
              onChange={(e) =>
                setForm({ ...form, advancePaid: e.target.value })
              }
              className="border px-3 py-2 rounded-lg w-full"
            />
          </div>

          {/* Remaining */}
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            Remaining: ₹
            {(Number(form.totalAmount) || 0) - (Number(form.advancePaid) || 0)}
          </div>

          {/* Quotation */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.quotationSent}
              onChange={(e) =>
                setForm({ ...form, quotationSent: e.target.checked })
              }
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-gray-700">Quotation Sent</span>
          </label>

          {/* ✅ Pending Amount Reason — NEW FIELD */}
          <input
            placeholder="Pending Amount Reason"
            value={form.pendingAmountReason || ""}
            onChange={(e) =>
              setForm({ ...form, pendingAmountReason: e.target.value })
            }
            className="border px-3 py-2 rounded-lg w-full"
          />

          {/* Acceptance Reason */}
          <input
            placeholder="Acceptance Reason"
            value={form.acceptanceReason || ""}
            onChange={(e) =>
              setForm({ ...form, acceptanceReason: e.target.value })
            }
            className="border px-3 py-2 rounded-lg w-full"
          />

          {/* Rejection Reason */}
          <input
            placeholder="Rejection Reason"
            value={form.rejectionReason || ""}
            onChange={(e) =>
              setForm({ ...form, rejectionReason: e.target.value })
            }
            className="border px-3 py-2 rounded-lg w-full"
          />

          {/* ✅ Follow-up Date — mobile fixed */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Follow-up Date
            </label>
            <input
              type="date"
              value={form.followUpDate ? form.followUpDate.split("T")[0] : ""}
              onChange={(e) =>
                setForm({ ...form, followUpDate: e.target.value })
              }
              className="border px-3 py-2 rounded-lg w-full bg-white"
              style={{ WebkitAppearance: "none", minHeight: "42px" }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Update Lead
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
