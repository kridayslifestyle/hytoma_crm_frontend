// Place at: CRM_FRONTEND/src/pages/CustomerWorkForm.jsx
//
// Single unified "Customer Work" module (replaces separate Site Visit /
// Installation forms). Admin creates/edits customer records, picks a calendar
// slot (booked slots auto-disable), assigns installers (Venkatesh / Sai),
// tracks status, and reschedules until the work is Completed.

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  RotateCcw,
  X,
} from "lucide-react";
import {
  createCustomerWork,
  listCustomerWork,
  updateCustomerWork,
  deleteCustomerWork,
  updateCustomerWorkStatus,
  rescheduleCustomerWork,
  getAvailability,
} from "../services/customerWorkApi";

const STATUSES = [
  "Pending",
  "Scheduled",
  "In Progress",
  "Completed",
  "Re-Scheduled",
  "Cancelled",
];
const INSTALLERS = ["Venkatesh", "Sai"];
const STATUS_COLORS = {
  Pending: "bg-gray-100 text-gray-700",
  Scheduled: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Completed: "bg-green-100 text-green-700",
  "Re-Scheduled": "bg-purple-100 text-purple-700",
  Cancelled: "bg-red-100 text-red-700",
};

const toISO = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const todayISO = () => toISO(new Date());

const emptyForm = {
  customer_name: "",
  phone: "",
  address: "",
  status: "Scheduled",
  remarks: "",
  assigned_installers: [],
  scheduled_date: todayISO(),
  slot: "",
  is_custom_slot: false,
  required_products: "",
  quotation_url: "",
};

export default function CustomerWorkForm() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [quotationFile, setQuotationFile] = useState(null);
  const SALES_PERSONS = ["Revathi", "Suresh", "Manoj", "Naveen"];
  // Calendar state
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [availability, setAvailability] = useState({}); // dateISO -> [{slot, available}]
  const [customMode, setCustomMode] = useState(false);

  // Reschedule modal
  const [reschedTarget, setReschedTarget] = useState(null);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadRecords = async () => {
    try {
      const r = await listCustomerWork(filter ? { status: filter } : {});
      setRecords(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      flash("error", e?.response?.data?.detail || "Failed to load records");
    }
  };

  const loadAvailability = async () => {
    const first = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
    );
    const last = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    );
    try {
      const r = await getAvailability(toISO(first), toISO(last));
      const map = {};
      (r.data?.availability || []).forEach((d) => (map[d.date] = d.slots));
      setAvailability(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [filter]);
  useEffect(() => {
    loadAvailability();
  }, [monthCursor, records]);

  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const toggleInstaller = (name) =>
    setForm((f) => ({
      ...f,
      assigned_installers: f.assigned_installers.includes(name)
        ? f.assigned_installers.filter((n) => n !== name)
        : [...f.assigned_installers, name],
    }));

  // ----- Calendar helpers -----
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

  const daySummary = (iso) => {
    const slots = availability[iso];
    if (!slots) return { free: 0, total: 0 };
    return {
      free: slots.filter((s) => s.available).length,
      total: slots.length,
    };
  };

  const pickDate = (iso) => {
    setForm((f) => ({
      ...f,
      scheduled_date: iso,
      slot: "",
      is_custom_slot: customMode,
    }));
  };

  const slotsForSelectedDate = availability[form.scheduled_date] || [];

  const uploadQuotation = async () => {
    if (!quotationFile) return;

    const formData = new FormData();
    formData.append("file", quotationFile);

    try {
      const res = await axios.post("/api/upload-quotation", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((f) => ({
        ...f,
        quotation_url: res.data.url,
      }));

      flash("success", "Quotation uploaded");
    } catch (err) {
      flash("error", "Upload failed");
    }
  };

  // ----- Submit -----
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.slot)
      return flash("error", "Please select a slot (or enter a custom slot).");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        required_products: form.required_products,
        quotation_url: form.quotation_url,
      };
      if (editingId) {
        await updateCustomerWork(editingId, payload);
        flash("success", "Record updated.");
      } else {
        await createCustomerWork(payload);
        flash(
          "success",
          "Customer work created. WhatsApp confirmation queued.",
        );
      }
      setForm(emptyForm);
      setEditingId(null);
      setCustomMode(false);
      await loadRecords();
    } catch (err) {
      flash("error", err?.response?.data?.detail || "Save failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setCustomMode(!!r.is_custom_slot);
    setForm({
      customer_name: r.customer_name || "",
      phone: r.phone || "",
      address: r.address || "",
      status: r.status || "Scheduled",
      remarks: r.remarks || "",
      assigned_installers: r.assigned_installers || [],
      scheduled_date: r.scheduled_date || todayISO(),
      slot: r.slot || "",
      is_custom_slot: !!r.is_custom_slot,
    });
    setMonthCursor(new Date(r.scheduled_date || Date.now()));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await deleteCustomerWork(id);
      flash("success", "Deleted.");
      loadRecords();
    } catch (e) {
      flash("error", e?.response?.data?.detail || "Delete failed.");
    }
  };

  const onStatusChange = async (id, status) => {
    try {
      await updateCustomerWorkStatus(id, status);
      loadRecords();
    } catch (e) {
      flash("error", e?.response?.data?.detail || "Status update failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="text-orange-500" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">
          Customer Work — Calendar
        </h1>
      </div>
      <p className="text-gray-500 mb-5">
        Create a customer job, pick an available slot, assign installers, and
        track status.
      </p>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            msg.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------------- FORM ---------------- */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow p-5 space-y-4"
        >
          <h3 className="font-semibold text-gray-800">
            {editingId ? "Edit Customer Work" : "New Customer Work"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Labeled label="Customer Name *">
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
            <Labeled label="Status">
              <select
                className={inp}
                value={form.status}
                onChange={setField("status")}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Labeled>
            <select
              value={form.salesPerson}
              onChange={(e) =>
                setForm({ ...form, salesPerson: e.target.value })
              }
              className="border px-3 py-2 rounded-lg w-full"
            >
              <option value="">Select Sales Person</option>

              {SALES_PERSONS.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
            <Labeled label="Assigned Installer(s)">
              <div className="flex gap-4 pt-2">
                {INSTALLERS.map((n) => (
                  <label
                    key={n}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.assigned_installers.includes(n)}
                      onChange={() => toggleInstaller(n)}
                    />
                    {n}
                  </label>
                ))}
              </div>
            </Labeled>
          </div>

          <Labeled label="Remarks">
            <textarea
              className={inp}
              rows={2}
              value={form.remarks}
              onChange={setField("remarks")}
            />
          </Labeled>

          {/* REQUIRED PRODUCTS TEXTAREA */}
          <Labeled label="Client Required Products">
            <textarea
              className={inp}
              rows={3}
              placeholder="Example: 2 Switch Boards, 1 Door Lock, 2 Video Door Bells..."
              value={form.required_products}
              onChange={setField("required_products")}
            />
          </Labeled>

          {/* QUOTATION UPLOAD */}
          <Labeled label="Quotation (Upload / Attach)">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className={inp}
              onChange={(e) => setQuotationFile(e.target.files[0])}
            />

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={uploadQuotation}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
              >
                Upload Quotation
              </button>

              {form.quotation_url && (
                <a
                  href={form.quotation_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Download
                </a>
              )}
            </div>
          </Labeled>

          {/* Calendar slot picker */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Slot Selection</span>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={customMode}
                  onChange={(e) => {
                    setCustomMode(e.target.checked);
                    setForm((f) => ({
                      ...f,
                      is_custom_slot: e.target.checked,
                      slot: "",
                    }));
                  }}
                />
                Custom date / slot
              </label>
            </div>

            <MonthNav cursor={monthCursor} setCursor={setMonthCursor} />

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
                const { free, total } = daySummary(iso);
                const selected = form.scheduled_date === iso;
                return (
                  <button
                    type="button"
                    key={iso}
                    disabled={past && !customMode}
                    onClick={() => pickDate(iso)}
                    className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center border transition
                      ${selected ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 hover:border-orange-300"}
                      ${past && !customMode ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <span>{d.getDate()}</span>
                    {total > 0 && !selected && (
                      <span
                        className={`text-[9px] ${free === 0 ? "text-red-500" : "text-green-600"}`}
                      >
                        {free}/{total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slot buttons or custom input */}
            <div className="mt-3">
              {customMode ? (
                <Labeled label="Custom slot label *">
                  <input
                    className={inp}
                    placeholder="e.g. 6:30 PM site visit"
                    value={form.slot}
                    onChange={setField("slot")}
                  />
                </Labeled>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slotsForSelectedDate.length === 0 && (
                    <span className="text-xs text-gray-400">
                      Select a date to see slots.
                    </span>
                  )}
                  {slotsForSelectedDate.map((s) => {
                    const isSelf = editingId && s.slot === form.slot;
                    const disabled = !s.available && !isSelf;
                    return (
                      <button
                        type="button"
                        key={s.slot}
                        disabled={disabled}
                        onClick={() => setForm((f) => ({ ...f, slot: s.slot }))}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition
                          ${form.slot === s.slot ? "bg-orange-500 text-white border-orange-500" : "border-gray-300 text-gray-700 hover:border-orange-400"}
                          ${disabled ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      >
                        {s.slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Selected: <b>{form.scheduled_date}</b>{" "}
              {form.slot && `· ${form.slot}`}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setCustomMode(false);
                }}
                className="px-4 py-2 rounded-lg border text-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ---------------- LIST ---------------- */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Scheduled Work</h3>
            <select
              className="border rounded-lg px-2 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-auto pr-1">
            {records.length === 0 && (
              <p className="text-sm text-gray-400">No records yet.</p>
            )}
            {records.map((r) => (
              <div key={r.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-gray-800">
                      {r.customer_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.phone} · {r.address}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || "bg-gray-100"}`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mt-2">
                  📅 {r.scheduled_date} · {r.slot}
                  {r.is_custom_slot ? " (custom)" : ""}
                  {r.assigned_installers?.length > 0 && (
                    <> · 👷 {r.assigned_installers.join(", ")}</>
                  )}
                </div>
                {r.schedule_history?.length > 0 && (
                  <div className="text-[11px] text-gray-400 mt-1">
                    Rescheduled {r.schedule_history.length}× (was{" "}
                    {
                      r.schedule_history[r.schedule_history.length - 1]
                        .scheduled_date
                    }
                    )
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={r.status}
                    onChange={(e) => onStatusChange(r.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <IconBtn onClick={() => startEdit(r)} title="Edit">
                    <Pencil size={14} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => setReschedTarget(r)}
                    title="Reschedule"
                    disabled={r.status === "Completed"}
                  >
                    <RotateCcw size={14} />
                  </IconBtn>
                  <IconBtn onClick={() => onDelete(r.id)} title="Delete" danger>
                    <Trash2 size={14} />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reschedTarget && (
        <RescheduleModal
          record={reschedTarget}
          onClose={() => setReschedTarget(null)}
          onDone={() => {
            setReschedTarget(null);
            loadRecords();
            flash("success", "Rescheduled. Customer notified.");
          }}
          onError={(t) => flash("error", t)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------
const inp =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function IconBtn({ children, onClick, title, danger, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded border transition ${
        danger
          ? "text-red-500 hover:bg-red-50 border-red-200"
          : "text-gray-600 hover:bg-gray-50 border-gray-200"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function MonthNav({ cursor, setCursor }) {
  const label = cursor.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="flex items-center justify-between mb-2">
      <button
        type="button"
        onClick={() =>
          setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
        }
        className="p-1 rounded hover:bg-gray-100"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() =>
          setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
        }
        className="p-1 rounded hover:bg-gray-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function RescheduleModal({ record, onClose, onDone, onError }) {
  const [date, setDate] = useState(record.scheduled_date || todayISO());
  const [slot, setSlot] = useState("");
  const [custom, setCustom] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [slots, setSlots] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (custom) return;
    (async () => {
      try {
        const r = await getAvailability(date, date);
        setSlots(r.data?.availability?.[0]?.slots || []);
      } catch {
        setSlots([]);
      }
    })();
  }, [date, custom]);

  const submit = async () => {
    if (!slot) return onError("Pick a slot or enter a custom one.");
    setBusy(true);
    try {
      await rescheduleCustomerWork(record.id, {
        scheduled_date: date,
        slot,
        is_custom_slot: custom,
        remarks,
      });
      onDone();
    } catch (e) {
      onError(e?.response?.data?.detail || "Reschedule failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">
            Reschedule — {record.customer_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <Labeled label="New date *">
          <input
            type="date"
            className={inp}
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </Labeled>

        <label className="flex items-center gap-2 text-xs text-gray-600 my-3">
          <input
            type="checkbox"
            checked={custom}
            onChange={(e) => {
              setCustom(e.target.checked);
              setSlot("");
            }}
          />
          Custom slot
        </label>

        {custom ? (
          <Labeled label="Custom slot label *">
            <input
              className={inp}
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              placeholder="e.g. 5 PM"
            />
          </Labeled>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s.slot}
                type="button"
                disabled={!s.available}
                onClick={() => setSlot(s.slot)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  slot === s.slot
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-300 text-gray-700"
                } ${!s.available ? "opacity-40 line-through cursor-not-allowed" : ""}`}
              >
                {s.slot}
              </button>
            ))}
          </div>
        )}

        <Labeled label="Remarks">
          <textarea
            className={`${inp} mt-3`}
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Labeled>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
