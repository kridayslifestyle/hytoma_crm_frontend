import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

const COMPLAINT_TYPES = ["App issues", "Product issues", "Other"];

const SALES_PERSONS = ["Revathi", "Manoj", "Suresh", "Naveen"];

export default function ComplaintForm() {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    purchaseDateOrInvoice: "",
    productName: "",
    salesPerson: "",
    complaintType: "",
    otherComplaintText: "",
    description: "",
    location: "",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    if (file.type.startsWith("image/")) {
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mediaFile) {
      setToast("❌ Please upload an image or video of the product");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    if (form.complaintType === "Other" && !form.otherComplaintText.trim()) {
      setToast("❌ Please type your issue in the box below");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    setLoading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(mediaFile);
      });

      const payload = {
        ...form,
        description:
          form.complaintType === "Other"
            ? `Other issue: ${form.otherComplaintText.trim()}${form.description ? " — " + form.description : ""}`
            : form.description,
        mediaFile: base64,
        mediaFileName: mediaFile.name,
        mediaFileType: mediaFile.type,
        source: "Customer Form",
        status: "Open",
      };

      const res = await fetch(`${API}/complaints/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setToast("❌ Something went wrong. Please try again.");
        setTimeout(() => setToast(""), 3000);
      }
    } catch (err) {
      setToast("❌ Error submitting. Please try again.");
      setTimeout(() => setToast(""), 3000);
    }

    setLoading(false);
  };

  // ✅ Thank you screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <img
            src="/hytoma-logo.png"
            alt="Hytoma"
            className="h-16 mx-auto mb-4"
            onError={(e) => e.target.style.display = "none"}
          />
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Complaint Submitted!
          </h2>
          <p className="text-gray-500 mb-2">
            Thank you for reaching out. Our team will review your complaint and get back to you shortly.
          </p>
          <p className="text-orange-500 font-medium text-sm">
            Hytoma Automation LLP — The Future of Smart Living
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/hytoma-logo.png"
            alt="Hytoma Automation LLP"
            className="h-20 mx-auto mb-3"
            onError={(e) => e.target.style.display = "none"}
          />
          <h1 className="text-2xl font-bold text-orange-500">
            Hytoma Automation LLP
          </h1>
          <p className="text-gray-500 text-sm">The Future of Smart Living</p>
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3">
            <p className="text-orange-600 font-medium text-sm">📋 Customer Complaint Form</p>
            <p className="text-gray-500 text-xs mt-1">
              Please fill all required fields so we can resolve your issue quickly.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Customer Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter your full name"
                value={form.customerName}
                required
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter your phone number"
                value={form.phone}
                required
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) setForm({ ...form, phone: val });
                }}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
              />
              {form.phone && form.phone.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">{form.phone.length}/10 digits</p>
              )}
            </div>

            {/* Date of Purchase / Invoice Number */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Date of Purchase or Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="e.g. 01/04/2026 or INV-12345"
                value={form.purchaseDateOrInvoice}
                required
                onChange={(e) => setForm({ ...form, purchaseDateOrInvoice: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="e.g. Smart Door Lock, Video Door Bell"
                value={form.productName}
                required
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>

            {/* Image / Video Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Image or Video of Product <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-orange-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="mediaUpload"
                />
                <label htmlFor="mediaUpload" className="cursor-pointer">
                  {mediaPreview ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="h-32 mx-auto rounded-lg object-cover"
                    />
                  ) : mediaFile ? (
                    <div className="text-green-600">
                      <p className="text-2xl">🎥</p>
                      <p className="text-sm font-medium">{mediaFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <p className="text-3xl mb-2">📷</p>
                      <p className="text-sm">Tap to upload image or video</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 supported</p>
                    </div>
                  )}
                </label>
              </div>
              {mediaFile && (
                <button
                  type="button"
                  onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                  className="text-red-500 text-xs mt-1"
                >
                  Remove file
                </button>
              )}
            </div>

            {/* Sales Person */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Sales Person <span className="text-red-500">*</span>
              </label>
              <select
                value={form.salesPerson}
                onChange={(e) => setForm({ ...form, salesPerson: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
                required
              >
                <option value="" disabled>Select Sales Person</option>
                {SALES_PERSONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Complaint Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Complaint Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.complaintType}
                onChange={(e) => setForm({ ...form, complaintType: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
                required
              >
                <option value="" disabled>Select Complaint Type</option>
                {COMPLAINT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {form.complaintType === "Other" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Please describe your issue <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Type your other issue here…"
                  value={form.otherComplaintText}
                  required
                  onChange={(e) => setForm({ ...form, otherComplaintText: e.target.value })}
                  className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Description
              </label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full h-24 resize-none focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Location / Address
              </label>
              <input
                placeholder="Enter your address or paste Google Maps link"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Your complaint will be reviewed by our team within 24 hours
            </p>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Hytoma Automation LLP — The Future of Smart Living
        </p>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

    </div>
  );
}