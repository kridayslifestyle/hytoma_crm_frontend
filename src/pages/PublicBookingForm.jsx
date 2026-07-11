// Place at: CRM_FRONTEND/src/pages/PublicBookingForm.jsx
//
// Public, no-login booking page for clients. They enter their own details,
// pick "New installation" or "Existing problem", and the calendar only
// offers the days/slots that work type is allowed on:
//   New       -> Monday, Wednesday, Friday   (1 slot/day)
//   Existing  -> Tuesday, Thursday, Saturday (2 slots/day)
// Express Service unlocks a same-day slot on an otherwise-closed day for a
// flat ₹1500 surcharge. On submit, the backend sends a WhatsApp confirmation
// to the client; the installer is notified once an admin assigns one.

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { getPublicAvailability, createPublicBooking } from "../services/customerWorkApi";

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

export default function PublicBookingForm() {
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    work_type: "New",
    km: "",
    express_service: false,
    scheduled_date: "",
    slot: "",
  });
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [availability, setAvailability] = useState({}); // dateISO -> {enabled, express_only, slots}
  const [meta, setMeta] = useState({ allowed_days: "", express_fee: 1500 });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {id, express_fee, message} on success
  const [error, setError] = useState("");

  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const loadAvailability = async () => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const last = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    try {
      const r = await getPublicAvailability(
        form.work_type,
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
    loadAvailability();
    // clear a previously chosen date/slot whenever the rules change
    setForm((f) => ({ ...f, scheduled_date: "", slot: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor, form.work_type, form.express_service]);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.scheduled_date || !form.slot) {
      setError("Please pick a date and a time slot.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await createPublicBooking({
        customer_name: form.customer_name,
        phone: form.phone,
        address: form.address,
        work_type: form.work_type,
        km: form.km || 0,
        express_service: form.express_service,
        scheduled_date: form.scheduled_date,
        slot: form.slot,
      });
      setResult(r.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Booking received!</h1>
          <p className="text-gray-600 text-sm">{result.message}</p>
          {result.express_fee > 0 && (
            <p className="text-orange-600 text-sm font-medium mt-2">
              Express Service fee: ₹{result.express_fee}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-4">You'll get a WhatsApp confirmation shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="text-orange-500" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Book a Service Visit</h1>
        </div>
        <p className="text-gray-500 mb-5 text-sm">
          Tell us about your job and pick a slot that works for you.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
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

          <Labeled label="Address *">
            <textarea
              className={inp}
              required
              rows={2}
              value={form.address}
              onChange={setField("address")}
            />
          </Labeled>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Labeled label="What do you need? *">
              <select className={inp} value={form.work_type} onChange={setField("work_type")}>
                <option value="New">New installation</option>
                <option value="Existing">Existing problem / service</option>
              </select>
            </Labeled>
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
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-700 border rounded-lg p-3 bg-orange-50 border-orange-200">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.express_service}
              onChange={(e) => setField("express_service")(e.target.checked)}
            />
            <span>
              <span className="flex items-center gap-1 font-medium">
                <Zap size={14} className="text-orange-500" /> Express Service — visit today
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Skip the wait — we'll try to fit you in today. Extra charge: ₹{meta.express_fee}.
              </span>
            </span>
          </label>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Pick a date</span>
              <span className="text-[11px] text-gray-400">
                {form.work_type === "New" ? "New installs: " : "Existing/service: "}
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
                const enabled = !past && info?.enabled;
                const selected = form.scheduled_date === iso;
                return (
                  <button
                    type="button"
                    key={iso}
                    disabled={!enabled}
                    onClick={() => pickDate(iso, info)}
                    className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center border transition
                      ${selected ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 hover:border-orange-300"}
                      ${!enabled ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <span>{d.getDate()}</span>
                    {info?.express_only && !selected && (
                      <span className="text-[8px] text-orange-500">⚡</span>
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
                ⚡ This is an Express same-day slot — ₹{meta.express_fee} extra will apply.
              </p>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Selected: <b>{form.scheduled_date || "—"}</b> {form.slot && `· ${form.slot}`}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {submitting ? "Booking…" : "Book my visit"}
          </button>
        </form>
      </div>
    </div>
  );
}