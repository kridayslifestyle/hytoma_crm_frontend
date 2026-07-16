import { useEffect, useState } from "react";
import { getLeads, deleteLead } from "../services/api";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async () => {
    await deleteLead(deleteId);
    setDeleteId(null);
    fetchLeads();
  };

  const salesPersons = [...new Set(leads.map((l) => l.salesPerson))];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (lead.phone || "").includes(search);
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesPerson =
      personFilter === "all" || lead.salesPerson === personFilter;

    const now = new Date();
    let matchesDate = true;

    if (dateFilter !== "all" && lead.createdAt) {
      const date = new Date(lead.createdAt);
      if (dateFilter === "today") {
        matchesDate = date.toDateString() === now.toDateString();
      }
      if (dateFilter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        matchesDate = date.toDateString() === yesterday.toDateString();
      }
      if (dateFilter === "thisWeek") {
        const firstDay = new Date();
        firstDay.setDate(now.getDate() - now.getDay());
        firstDay.setHours(0, 0, 0, 0);
        matchesDate = date >= firstDay && date <= now;
      }
      if (dateFilter === "thisMonth") {
        matchesDate =
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear();
      }
      if (dateFilter === "lastMonth") {
        const last = new Date(now.getFullYear(), now.getMonth() - 1);
        matchesDate =
          date.getMonth() === last.getMonth() &&
          date.getFullYear() === last.getFullYear();
      }
    } else if (dateFilter !== "all" && !lead.createdAt) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesPerson && matchesDate;
  });

  const exportToExcel = () => {
    const data = filteredLeads.map((l) => ({
      Name: l.name,
      Phone: l.phone,
      Status: l.status,
      SalesPerson: l.salesPerson,
      Quotation: l.quotationSent ? "Sent" : "Not Sent",
      AdvancePaid: l.advancePaid || 0,
      TotalAmount: l.totalAmount || 0,
      Pending: (l.totalAmount || 0) - (l.advancePaid || 0),
      PendingAmountReason: l.pendingAmountReason || "",
      AcceptanceReason: l.acceptanceReason || "",
      RejectionReason: l.rejectionReason || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "Leads_Report.xlsx");
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Leads</h1>
        <div className="flex gap-2">
          {role === "admin" && (
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 md:px-4 rounded-lg text-sm"
            >
              Export
            </button>
          )}
          <button
            onClick={() => navigate("/quick-lead")}
            className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 md:px-4 rounded-lg text-sm"
          >
            ⚡ Quick Lead
          </button>
          <button
            onClick={() => navigate("/add-lead")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 rounded-lg text-sm"
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-5 flex flex-col md:flex-row flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-auto"
        >
          <option value="all">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Quotation Sent">Quotation Sent</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
        <select
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-auto"
        >
          <option value="all">All Sales Persons</option>
          {salesPersons.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-auto"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filteredLeads.length} lead
        {filteredLeads.length !== 1 ? "s" : ""}
      </p>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Sales Person</th>
              <th className="p-4 text-left">Dates</th>
              <th className="p-4 text-left">Quotation</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Remarks</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  No leads found
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{lead.name}</td>
                  <td className="p-4">{lead.phone}</td>
                  <td className="p-4">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">{lead.salesPerson}</td>
                  <td className="p-4 text-sm space-y-1">
                    {lead.leadEntryDate && (
                      <div>📅 Entry: {lead.leadEntryDate}</div>
                    )}

                    {lead.followUpDate && (
                      <div>🔔 Follow-up: {lead.followUpDate}</div>
                    )}

                    {lead.closeDate && <div>✅ Closed: {lead.closeDate}</div>}

                    {lead.rejectionDate && (
                      <div>❌ Rejected: {lead.rejectionDate}</div>
                    )}

                    {!lead.leadEntryDate &&
                      !lead.followUpDate &&
                      !lead.closeDate &&
                      !lead.rejectionDate && (
                        <span className="text-gray-400">—</span>
                      )}
                  </td>
                  <td className="p-4">
                    {lead.quotationSent ? (
                      <span className="text-green-600">✔ Sent</span>
                    ) : (
                      <span className="text-gray-400">Not Sent</span>
                    )}
                  </td>
                  <td className="p-4">
                    {lead.paymentHistory?.length > 0 ? (
                      <>
                        {lead.paymentHistory.map((p, i) => (
                          <div key={i} className="text-sm">
                            ₹{p.amount} ({p.date})
                          </div>
                        ))}
                        <div className="mt-1 text-xs text-gray-500">
                          Total Paid: ₹
                          {lead.paymentHistory.reduce(
                            (sum, p) => sum + Number(p.amount),
                            0,
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        ₹{lead.advancePaid || 0} / ₹{lead.totalAmount || 0}
                        <br />
                        {(lead.advancePaid || 0) >= (lead.totalAmount || 0) ? (
                          <span className="text-green-600 text-sm">Paid</span>
                        ) : (
                          <span className="text-orange-500 text-sm">
                            Pending ₹
                            {(lead.totalAmount || 0) - (lead.advancePaid || 0)}
                          </span>
                        )}
                      </>
                    )}
                  </td>
                  {/* ✅ Remarks — now includes pendingAmountReason */}
                  <td className="p-4 space-y-1">
                    {lead.pendingAmountReason && (
                      <div className="text-yellow-600 text-sm">
                        💰 {lead.pendingAmountReason}
                      </div>
                    )}
                    {lead.acceptanceReason && (
                      <div className="text-green-600 text-sm">
                        ✅ {lead.acceptanceReason}
                      </div>
                    )}
                    {lead.rejectionReason && (
                      <div className="text-red-500 text-sm">
                        ❌ {lead.rejectionReason}
                      </div>
                    )}
                    {!lead.pendingAmountReason &&
                      !lead.acceptanceReason &&
                      !lead.rejectionReason && (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/edit/${lead._id}`)}
                      className="px-3 py-1 border rounded mr-2"
                    >
                      Edit
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => setDeleteId(lead._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredLeads.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No leads found</p>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-800">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                </div>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                  {lead.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Sales Person:</span>{" "}
                  {lead.salesPerson}
                </p>
                <p>
                  <span className="font-medium">Quotation:</span>{" "}
                  {lead.quotationSent ? (
                    <span className="text-green-600">✔ Sent</span>
                  ) : (
                    <span className="text-gray-400">Not Sent</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Payment:</span> ₹
                  {lead.advancePaid || 0} / ₹{lead.totalAmount || 0}{" "}
                  {(lead.advancePaid || 0) >= (lead.totalAmount || 0) ? (
                    <span className="text-green-600">✅ Paid</span>
                  ) : (
                    <span className="text-orange-500">
                      Pending ₹
                      {(lead.totalAmount || 0) - (lead.advancePaid || 0)}
                    </span>
                  )}
                </p>
                {/* ✅ Pending Amount Reason in mobile card */}
                {lead.pendingAmountReason && (
                  <p className="text-yellow-600">
                    💰 {lead.pendingAmountReason}
                  </p>
                )}
                {lead.acceptanceReason && (
                  <p className="text-green-600">✅ {lead.acceptanceReason}</p>
                )}
                {lead.rejectionReason && (
                  <p className="text-red-500">❌ {lead.rejectionReason}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/edit/${lead._id}`)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-600"
                >
                  Edit
                </button>
                {role === "admin" && (
                  <button
                    onClick={() => setDeleteId(lead._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Delete Lead
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this lead? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
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
    </div>
  );
}