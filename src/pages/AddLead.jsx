import { useState,useEffect } from "react";
import { addLead } from "../services/api";
import { useNavigate } from "react-router-dom";
import { getInventory } from "../services/api";

export default function AddLead() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  // const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    status: "",
    isNew: false,
    leadType: "",
    leadSource: "",
    salesPerson: "",
    totalAmount: "",
    advancePaid: "",
    quotationSent: false,
    acceptanceReason: "",
    rejectionReason: "",
    paymentHistory: [],
    // ✅ IMPORTANT FIELDS
    leadEntryDate: "",
    followUpDate: "",
  });

  const [paymentInput, setPaymentInput] = useState({
    amount: "",
    date: "",
    note: "",
  });

  const [products, setProducts] = useState([]);

  const [productInput, setProductInput] = useState({
    productId: "",
    name: "",
    price: 0,
    quantity: 1,
  });

  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await getInventory();
    setInventory(res);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      products: products,

      paymentHistory: form.paymentHistory.map((p) => ({
        amount: Number(p.amount),
        date: p.date,
        note: p.note || "",
      })),
    };

    if (!/^\d{10}$/.test(form.phone)) {
      setToast("❌ Please enter a valid 10-digit phone number");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    if (!form.status) {
      setToast("❌ Please select a status");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    if (!form.leadEntryDate) {
      alert("Lead Entry Date is required");
      return;
    }

    try {
      await addLead(payload);
      setToast("✅ Lead Added Successfully");
      setTimeout(() => {
        setToast("");
        navigate("/leads");
      }, 1500); // ✅ auto navigate after 1.5s
    } catch (err) {
      console.error(err);
      setToast("❌ Error adding lead");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const addPayment = () => {
    if (!paymentInput.amount || !paymentInput.date) return;

    setForm({
      ...form,
      paymentHistory: [...form.paymentHistory, paymentInput],
    });

    setPaymentInput({ amount: "", date: "", note: "" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Lead</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Customer Name"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-3 py-2 rounded-lg w-full"
            />

            {/* ✅ Phone — numbers only, max 10 digits */}
            <div>
              <input
                placeholder="Phone Number (10 digits)"
                value={form.phone}
                required
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // only numbers
                  if (val.length <= 10) {
                    setForm({ ...form, phone: val });
                  }
                }}
                className={`border px-3 py-2 rounded-lg w-full ${
                  form.phone && form.phone.length !== 10
                    ? "border-red-400 focus:ring-red-300"
                    : "focus:ring-orange-300"
                }`}
              />
              {/* ✅ Live feedback */}
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

          {/* Is New Lead Checkbox */}
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-orange-50 transition">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-gray-700 font-medium">
              Is this a New Lead?
            </span>
            {form.isNew && (
              <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                New
              </span>
            )}
          </label>

          <div>
            <label className="font-medium">Lead Entry Date *</label>
            <input
              type="date"
              value={form.leadEntryDate}
              onChange={(e) =>
                setForm({ ...form, leadEntryDate: e.target.value })
              }
              className="w-full border rounded-lg p-3 mt-2"
              required
            />
          </div>

          {/* Status dropdown */}
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          >
            <option value="" disabled>
              Select Status
            </option>

            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Quotation Sent">Quotation Sent</option>

            {/* ✅ NEW OPTIONS ADDED */}
            <option value="Not Answering">Not Answering</option>
            <option value="Not Interested">Not Interested</option>

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

          <div className="border p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-3">🧾 Product Mapping</h3>

            {/* Product Select */}
            <select
              className="border p-2 rounded w-full mb-2"
              value={productInput.productId}
              onChange={(e) => {
                const selected = inventory.find(
                  (p) => p._id === e.target.value,
                );

                setProductInput({
                  productId: selected._id,
                  name: selected.name,
                  price: selected.price,
                  quantity: 1,
                });
              }}
            >
              <option value="">Select Product</option>
              {inventory.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.stock})
                </option>
              ))}
            </select>

            {/* Quantity */}
            <input
              type="number"
              placeholder="Quantity"
              value={productInput.quantity}
              onChange={(e) =>
                setProductInput({
                  ...productInput,
                  quantity: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full mb-2"
            />

            {/* Add Button */}
            <button
              type="button"
              onClick={() => {
                if (!productInput.productId) return;

                const newProduct = {
                  ...productInput,
                  total: productInput.price * productInput.quantity,
                };

                setProducts([...products, newProduct]);

                setProductInput({
                  productId: "",
                  name: "",
                  price: 0,
                  quantity: 1,
                });
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              + Add Product
            </button>
          </div>

          <div className="mt-4">
            {products.map((p, index) => (
              <div
                key={index}
                className="flex justify-between items-center border p-2 rounded mb-2"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    ₹{p.price} × {p.quantity}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <p className="font-semibold">₹{p.total}</p>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = products.filter((_, i) => i !== index);
                      setProducts(updated);
                    }}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Amounts */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Amount"
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded-lg w-full"
            />
            <input
              type="number"
              placeholder="Advance Paid"
              value={form.advancePaid}
              onChange={(e) =>
                setForm({ ...form, advancePaid: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded-lg w-full"
            />
          </div>

          {/* Payment History */}
          <div className="border p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-3">Payment History</h3>

            {form.paymentHistory?.map((p, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={p.amount}
                  onChange={(e) => {
                    const updated = [...form.paymentHistory];
                    updated[index].amount = e.target.value;
                    setForm({ ...form, paymentHistory: updated });
                  }}
                  className="border p-2 rounded"
                />

                <input
                  type="date"
                  value={p.date}
                  onChange={(e) => {
                    const updated = [...form.paymentHistory];
                    updated[index].date = e.target.value;
                    setForm({ ...form, paymentHistory: updated });
                  }}
                  className="border p-2 rounded"
                />

                <button
                  type="button"
                  onClick={() => {
                    const updated = form.paymentHistory.filter(
                      (_, i) => i !== index,
                    );
                    setForm({ ...form, paymentHistory: updated });
                  }}
                  className="bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  paymentHistory: [
                    ...form.paymentHistory,
                    { amount: "", date: "", note: "" },
                  ],
                })
              }
              className="bg-orange-500 text-white px-3 py-2 rounded mt-2"
            >
              + Add Payment
            </button>
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

          <input
            placeholder="Pending Amount Reason"
            value={form.pendingAmountReason || ""}
            onChange={(e) =>
              setForm({ ...form, pendingAmountReason: e.target.value })
            }
            className="border px-3 py-2 rounded-lg w-full"
          />

          {/* Acceptance / Rejection */}
          <input
            placeholder="Acceptance Reason"
            value={form.acceptanceReason}
            onChange={(e) =>
              setForm({ ...form, acceptanceReason: e.target.value })
            }
            className="border px-3 py-2 rounded-lg w-full"
          />
          <input
            placeholder="Rejection Reason"
            value={form.rejectionReason}
            onChange={(e) =>
              setForm({ ...form, rejectionReason: e.target.value })
            }
            className="border px-3 py-2 rounded-lg w-full"
          />

          {/* Follow-up Date */}
          <input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          />

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
              Save Lead
            </button>
          </div>
        </form>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
