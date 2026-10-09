import { useEffect, useState } from "react";
import {
  getInstallationTickets,
  addInstallationTicket,
  updateInstallationTicket,
  deleteInstallationTicket,
} from "../services/api";

const SALES_PERSONS = ["Revathi", "Manoj", "Suresh"];
const SERVICE_TYPES = ["Installation", "Complaint"];
const STATUSES = ["Ticket Accepted", "In Progress", "Ticket Closed"];

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(`${d}T00:00:00`);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const statusBadge = (status) =>
  status === "Ticket Closed"
    ? "bg-green-100 text-green-700"
    : status === "In Progress"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-blue-100 text-blue-700";

const dateLabel = (status) =>
  status === "Ticket Closed"
    ? "Ticket closed date"
    : status === "In Progress"
    ? "Progress date"
    : "Ticket accepted date";

const emptyForm = () => ({
  customerName: "",
  phone: "",
  salesPerson: "",
  serviceType: "",
  description: "",
  status: "Ticket Accepted",
  statusDate: todayStr(),
  progressNote: "",
  siteVisitDate: "",
});

export default function InstallationTracking({ role, showToast }) {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  // Update modal state
  const [updateItem, setUpdateItem] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    statusDate: todayStr(),
    progressNote: "",
    siteVisitDate: "",
    siteVisitNote: "",
  });
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const data = await getInstallationTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTickets([]);
      showToast(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      // Only send the in-progress extras when that status is selected
      if (form.status !== "In Progress") {
        payload.progressNote = "";
        payload.siteVisitDate = "";
      }
      await addInstallationTicket(payload);
      showToast("✅ Ticket created");
      setForm(emptyForm());
      load();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openUpdate = (t) => {
    setUpdateItem(t);
    setUpdateForm({
      status: t.status,
      statusDate: todayStr(),
      progressNote: "",
      siteVisitDate: "",
      siteVisitNote: "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const statusChanged = updateForm.status !== updateItem.status;
    const hasVisit = Boolean(updateForm.siteVisitDate);
    if (!statusChanged && !hasVisit) {
      showToast("Change the status or add a site visit date");
      return;
    }
    const payload = {};
    if (statusChanged) {
      payload.status = updateForm.status;
      payload.statusDate = updateForm.statusDate;
      payload.progressNote = updateForm.progressNote;
    }
    if (hasVisit) {
      payload.siteVisitDate = updateForm.siteVisitDate;
      payload.siteVisitNote = updateForm.siteVisitNote;
    }
    try {
      await updateInstallationTicket(updateItem._id, payload);
      showToast("✅ Ticket updated");
      setUpdateItem(null);
      load();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstallationTicket(deleteId);
      showToast("✅ Deleted");
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
    setDeleteId(null);
    load();
  };

  const inputCls = "border px-3 py-2 rounded-lg w-full text-sm";

  return (
    <>
      {/* ── Create form ── */}
      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">New Installation / Service Ticket</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            placeholder="Customer Name"
            required
            value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            className={inputCls}
          />
          <input
            placeholder="Phone Number"
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />

          <select
            required
            value={form.salesPerson}
            onChange={(e) => set("salesPerson", e.target.value)}
            className={inputCls}
          >
            <option value="" disabled>Select Sales Person</option>
            {SALES_PERSONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            required
            value={form.serviceType}
            onChange={(e) => set("serviceType", e.target.value)}
            className={inputCls}
          >
            <option value="" disabled>Select Service</option>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${inputCls} h-20 resize-none mt-3`}
        />

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputCls}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <div>
            <label className="text-xs text-gray-500">{dateLabel(form.status)}</label>
            <input
              type="date"
              required
              value={form.statusDate}
              onChange={(e) => set("statusDate", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Shown only when "In Progress" is selected */}
        {form.status === "In Progress" && (
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <textarea
              placeholder="Progress description (what is being done)"
              value={form.progressNote}
              onChange={(e) => set("progressNote", e.target.value)}
              className={`${inputCls} h-20 resize-none`}
            />
            <div>
              <label className="text-xs text-gray-500">Site visit date</label>
              <input
                type="date"
                value={form.siteVisitDate}
                onChange={(e) => set("siteVisitDate", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      {/* ── Tickets table ── */}
      {tickets.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          No tickets yet — create one above and it will appear here.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Client Name</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Sales Person</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Ticket Status</th>
                <th className="p-4 text-left">Status Dates</th>
                <th className="p-4 text-left">Site Visits</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id} className="border-b align-top hover:bg-gray-50">
                  <td className="p-4 font-medium">{t.customerName}</td>
                  <td className="p-4">{t.phone || "—"}</td>
                  <td className="p-4">{t.salesPerson || "—"}</td>
                  <td className="p-4">
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                      {t.serviceType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 max-w-xs">{t.description || "—"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>

                  {/* Date column for ticket status: accepted / in progress / closed */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      {(t.statusHistory || []).map((h, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-medium text-gray-700">{h.status}:</span>{" "}
                          <span className="text-gray-600">{fmtDate(h.date)}</span>
                          {h.note && <p className="text-gray-400 italic">{h.note}</p>}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Date column for site visits: count + each date */}
                  <td className="p-4">
                    {(t.siteVisits || []).length === 0 ? (
                      <span className="text-gray-400 text-xs">No visits yet</span>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-700">
                          {t.siteVisits.length} visit{t.siteVisits.length > 1 ? "s" : ""}
                        </p>
                        {t.siteVisits.map((v, i) => (
                          <div key={i} className="text-xs text-gray-600">
                            #{i + 1} · {fmtDate(v.date)}
                            {v.note && <p className="text-gray-400 italic">{v.note}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <button
                      onClick={() => openUpdate(t)}
                      className="px-3 py-1 border rounded mr-2 text-sm"
                    >
                      Update
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => setDeleteId(t._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Update modal: change status and/or log a site visit ── */}
      {updateItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Update Ticket</h3>
            <p className="text-xs text-gray-500 mb-4">
              {updateItem.customerName} · {updateItem.serviceType}
            </p>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className={inputCls}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {updateForm.status !== updateItem.status && (
                <>
                  <div>
                    <label className="text-xs text-gray-500">{dateLabel(updateForm.status)}</label>
                    <input
                      type="date"
                      value={updateForm.statusDate}
                      onChange={(e) => setUpdateForm({ ...updateForm, statusDate: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  {updateForm.status === "In Progress" && (
                    <textarea
                      placeholder="Progress description"
                      value={updateForm.progressNote}
                      onChange={(e) => setUpdateForm({ ...updateForm, progressNote: e.target.value })}
                      className={`${inputCls} h-20 resize-none`}
                    />
                  )}
                </>
              )}

              <div className="border-t pt-3">
                <label className="text-xs text-gray-500">Add site visit date (optional)</label>
                <input
                  type="date"
                  value={updateForm.siteVisitDate}
                  onChange={(e) => setUpdateForm({ ...updateForm, siteVisitDate: e.target.value })}
                  className={inputCls}
                />
                {updateForm.siteVisitDate && (
                  <input
                    placeholder="Visit note (optional)"
                    value={updateForm.siteVisitNote}
                    onChange={(e) => setUpdateForm({ ...updateForm, siteVisitNote: e.target.value })}
                    className={`${inputCls} mt-2`}
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateItem(null)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}