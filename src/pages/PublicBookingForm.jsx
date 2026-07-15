// Place at: CRM_FRONTEND/src/pages/PublicBookingForm.jsx
//
// Public, no-login page covering THREE client-facing flows, chosen via the
// "What do you need?" dropdown:
//
//   New installation / Existing problem / service
//     -> unchanged from before. Calendar restricted to specific weekdays,
//        Slot 1 / Slot 2, optional Express Service (any day, +Rs.1500).
//        On submit: client gets a WhatsApp confirmation, installer "Sai" is
//        auto-notified as a heads-up; an admin formally assigns an installer
//        later from the CRM.
//
//   Site Visit
//     -> client picks a sales person (Suresh / Naveen / Manoj / Rahul), and
//        the calendar shows every day (fully-booked days grey out), with
//        Morning / Afternoon slots. On submit: client + the chosen sales
//        person both get a WhatsApp confirmation naming each other.
//
//   Report a Complaint
//     -> no calendar. Reuses the same fields as the standalone Customer
//        Complaint Form, and submits to the same /complaints/public
//        endpoint so it lands in the CRM's Complaints page.

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { getPublicAvailability, createPublicBooking } from "../services/customerWorkApi";

const API = import.meta.env.VITE_API_URL;

const toISO = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const todayISO = () => toISO(new Date());

const inp =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";

function Labeled({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

const SITE_VISIT_SALES_PERSONS = ["Suresh", "Naveen", "Manoj", "Rahul"];

// Kept independent from the site-visit list on purpose -- matches the
// standalone Customer Complaint Form's existing roster.
const COMPLAINT_SALES_PERSONS = ["Revathi", "Manoj", "Suresh", "Naveen"];
const COMPLAINT_TYPES = [
  "Customer not happy with installation",
  "Product not working",
  "Sales person behaviour",
  "Price dispute",
  "Other",
];

export default function PublicBookingForm() {
  // "New" | "Existing" | "SiteVisit" | "Complaint"
  const [kind, setKind] = useState("New");

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    km: "",
    express_service: false,
    scheduled_date: "",
    slot: "",
    sales_person: "",
  });

  const [monthCursor, setMonthCursor] = useState(new Date());
  const [availability, setAvailability] = useState({}); // dateISO -> {enabled, express_only, slots}
  const [meta, setMeta] = useState({ allowed_days: "", express_fee: 1500 });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {message, express_fee?} on success
  const [error, setError] = useState("");

  // Complaint-only fields
  const [complaint, setComplaint] = useState({
    purchaseDateOrInvoice: "",
    productName: "",
    salesPerson: "",
    complaintType: "",
    description: "",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const isCalendarFlow = kind !== "Complaint";
  const workType = kind === "SiteVisit" ? "SiteVisit" : kind; // "New" | "Existing" | "SiteVisit"

  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const loadAvailability = async () => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const last = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    try {
      const r = await getPublicAvailability(
        workType,
        toISO(first),
        toISO(last),
        form.express_service,
      );
      const map = {};
      (r?.data?.availability || []).forEach((d) => (map[d.date] = d));
      setAvailability(map);
      setMeta({
        allowed_days: r?.data?.allowed_days || "",
        express_fee: r?.data?.express_fee ?? 1500,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isCalendarFlow) return;
    loadAvailability();
    // clear a previously chosen date/slot whenever the rules change
    setForm((f) => ({ ...f, scheduled_date: "", slot: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor, kind, form.express_service]);

  const monthDays = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [monthCursor]);

  const pickDate = (iso, dayInfo) => {
    if (!dayInfo?.enabled) return;
    setForm((f) => ({ ...f, scheduled_date: iso, slot: "" }));
  };

  const slotsForSelectedDate = availability[form.scheduled_date]?.slots || [];
  const selectedIsExpressDay = !!availability[form.scheduled_date]?.express_only;

  const handleKindChange = (e) => {
    const next = e.target.value;
    setKind(next);
    setError("");
    setForm((f) => ({ ...f, scheduled_date: "", slot: "", sales_person: "" }));
  };

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

  const onSubmitBooking = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.scheduled_date || !form.slot) {
      setError("Please pick a date and a time slot.");
      return;
    }
    if (kind === "SiteVisit" && !form.sales_person) {
      setError("Please select a sales person.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await createPublicBooking({
        customer_name: form.customer_name,
        phone: form.phone,
        address: form.address,
        work_type: workType,
        km: kind === "SiteVisit" ? 0 : form.km || 0,
        express_service: kind === "SiteVisit" ? false : form.express_service,
        scheduled_date: form.scheduled_date,
        slot: form.slot,
        ...(kind === "SiteVisit" ? { sales_person: form.sales_person } : {}),
      });
      setResult(r.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitComplaint = async (e) => {
    e.preventDefault();
    setError("");
    if (!mediaFile) {
      setError("Please upload an image or video of the product.");
      return;
    }
    setSubmitting(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(mediaFile);
      });

      const payload = {
        customerName: form.customer_name,
        phone: form.phone,
        location: form.address,
        purchaseDateOrInvoice: complaint.purchaseDateOrInvoice,
        productName: complaint.productName,
        salesPerson: complaint.salesPerson,
        complaintType: complaint.complaintType,
        description: complaint.description,
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

      if (!res.ok) throw new Error("Failed to submit complaint");
      setResult({ message: "Your complaint has been submitted. Our team will review it within 24 hours." });
    } catch (err) {
      setError("Something went wrong submitting your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {kind === "Complaint" ? "Complaint submitted!" : "Booking received!"}
          </h1>
          <p className="text-gray-600 text-sm">{result.message}</p>
          {result.express_fee > 0 && (
            <p className="text-orange-600 text-sm font-medium mt-2">
              Express Service fee: Rs.{result.express_fee}
            </p>
          )}
          {kind !== "Complaint" && (
            <p className="text-gray-400 text-xs mt-4">You'll get a WhatsApp confirmation shortly.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="text-orange-500" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">
            {kind === "Complaint" ? "Report a Complaint" : "Book a Service Visit"}
          </h1>
        </div>
        <p className="text-gray-500 mb-5 text-sm">
          {kind === "Complaint"
            ? "Tell us what happened and we'll get back to you."
            : "Tell us about your job and pick a slot that works for you."}
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={kind === "Complaint" ? onSubmitComplaint : onSubmitBooking}
          className="bg-white rounded-xl shadow p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Labeled label="Your Name *">
              <input
                className={inp}
                required
                value={form.customer_name}
                onChange={setField("customer_name")}
              />
            </Labeled>
            <Labeled label="Phone Number *">
              <input
                className={inp}
                required
                value={form.phone}
                onChange={setField("phone")}
                placeholder="10-digit or +91…"
              />
            </Labeled>
          </div>

          <Labeled label={kind === "Complaint" ? "Location / Address" : "Address *"}>
            <textarea
              className={inp}
              required={kind !== "Complaint"}
              rows={2}
              value={form.address}
              onChange={setField("address")}
            />
          </Labeled>

          <Labeled label="What do you need? *">
            <select className={inp} value={kind} onChange={handleKindChange}>
              <option value="New">New installation</option>
              <option value="Existing">Existing problem / service</option>
              <option value="SiteVisit">Site Visit</option>
              <option value="Complaint">Report a Complaint</option>
            </select>
          </Labeled>

          {/* ---- New / Existing installation extras ---- */}
          {(kind === "New" || kind === "Existing") && (
            <>
              <Labeled label="Distance (km)" hint="Approx. distance from our office">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inp}
                  value={form.km}
                  onChange={setField("km")}
                />
              </Labeled>

              <label className="flex items-start gap-2 text-sm text-gray-700 border rounded-lg p-3 bg-orange-50 border-orange-200">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.express_service}
                  onChange={(e) => setField("express_service")(e.target.checked)}
                />
                <span>
                  <span className="flex items-center gap-1 font-medium">
                    <Zap size={14} className="text-orange-500" /> Express Service — any day
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Skip our regular schedule and pick any day, including today. Extra charge: Rs.{meta.express_fee}.
                  </span>
                </span>
              </label>
            </>
          )}

          {/* ---- Site Visit: sales person picker ---- */}
          {kind === "SiteVisit" && (
            <Labeled label="Select Sales Person *">
              <select
                className={inp}
                required
                value={form.sales_person}
                onChange={setField("sales_person")}
              >
                <option value="">Select</option>
                {SITE_VISIT_SALES_PERSONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Labeled>
          )}

          {/* ---- Calendar (New / Existing / SiteVisit) ---- */}
          {isCalendarFlow && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Pick a date</span>
                <span className="text-[11px] text-gray-400">
                  {kind === "New" && "New installs: "}
                  {kind === "Existing" && "Existing/service: "}
                  {kind === "SiteVisit" && "Site visits: "}
                  {meta.allowed_days || "…"}
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
                  }
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {monthCursor.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
                  }
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const iso = toISO(d);
                  const past = iso < todayISO();
                  const info = availability[iso];
                  const fullyBooked =
                    !!info?.enabled && (info.slots?.length || 0) > 0 && info.slots.every((s) => !s.available);
                  const enabled = !past && info?.enabled && !fullyBooked;
                  const selected = form.scheduled_date === iso;
                  return (
                    <button
                      type="button"
                      key={iso}
                      disabled={!enabled}
                      onClick={() => pickDate(iso, info)}
                      title={fullyBooked ? "Fully booked" : undefined}
                      className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center border transition
                        ${selected ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 hover:border-orange-300"}
                        ${!enabled ? "opacity-30 cursor-not-allowed" : ""}
                        ${fullyBooked ? "bg-gray-100 line-through" : ""}`}
                    >
                      <span>{d.getDate()}</span>
                      {fullyBooked ? (
                        <span className="text-[8px] text-gray-400">Full</span>
                      ) : (
                        info?.express_only && !selected && (
                          <span className="text-[8px] text-orange-500">⚡</span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                {form.scheduled_date ? (
                  <div className="flex flex-wrap gap-2">
                    {slotsForSelectedDate.length === 0 && (
                      <span className="text-xs text-gray-400">No slots configured for this day.</span>
                    )}
                    {slotsForSelectedDate.map((s) => (
                      <button
                        type="button"
                        key={s.slot}
                        disabled={!s.available}
                        onClick={() => setForm((f) => ({ ...f, slot: s.slot }))}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition
                          ${form.slot === s.slot ? "bg-orange-500 text-white border-orange-500" : "border-gray-300 text-gray-700 hover:border-orange-400"}
                          ${!s.available ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      >
                        {s.slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Select a date to see available slots.</span>
                )}
              </div>

              {selectedIsExpressDay && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚡ This is an Express slot outside our regular schedule — Rs.{meta.express_fee} extra will apply.
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Selected: <b>{form.scheduled_date || "—"}</b> {form.slot && `· ${form.slot}`}
              </p>
            </div>
          )}

          {/* ---- Complaint-only fields ---- */}
          {kind === "Complaint" && (
            <>
              <Labeled label="Date of Purchase or Invoice Number">
                <input
                  className={inp}
                  placeholder="e.g. 01/04/2026 or INV-12345"
                  value={complaint.purchaseDateOrInvoice}
                  onChange={(e) =>
                    setComplaint((c) => ({ ...c, purchaseDateOrInvoice: e.target.value }))
                  }
                />
              </Labeled>

              <Labeled label="Product Name">
                <input
                  className={inp}
                  placeholder="e.g. Smart Door Lock, Video Door Bell"
                  value={complaint.productName}
                  onChange={(e) => setComplaint((c) => ({ ...c, productName: e.target.value }))}
                />
              </Labeled>

              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  Image or Video of Product *
                </span>
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
                      <img src={mediaPreview} alt="Preview" className="h-28 mx-auto rounded-lg object-cover" />
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

              <Labeled label="Sales Person *">
                <select
                  className={inp}
                  required
                  value={complaint.salesPerson}
                  onChange={(e) => setComplaint((c) => ({ ...c, salesPerson: e.target.value }))}
                >
                  <option value="" disabled>Select Sales Person</option>
                  {COMPLAINT_SALES_PERSONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Labeled>

              <Labeled label="Complaint Type *">
                <select
                  className={inp}
                  required
                  value={complaint.complaintType}
                  onChange={(e) => setComplaint((c) => ({ ...c, complaintType: e.target.value }))}
                >
                  <option value="" disabled>Select Complaint Type</option>
                  {COMPLAINT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Labeled>

              <Labeled label="Description">
                <textarea
                  className={inp}
                  rows={3}
                  placeholder="Describe your issue in detail…"
                  value={complaint.description}
                  onChange={(e) => setComplaint((c) => ({ ...c, description: e.target.value }))}
                />
              </Labeled>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {submitting
              ? kind === "Complaint" ? "Submitting…" : "Booking…"
              : kind === "Complaint" ? "Submit Complaint" : "Book my visit"}
          </button>
        </form>
      </div>
    </div>
  );
}