import { useEffect, useState } from "react";
import {
  getComplaints, addComplaint, updateComplaint, deleteComplaint,
  getSocialEnquiries, addSocialEnquiry, updateSocialEnquiry, deleteSocialEnquiry
} from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const COMPLAINT_TYPES = ["App issues", "Product issues", "Other"];

const PLATFORMS = ["Facebook", "Instagram", "WhatsApp", "Google Reviews", "Direct Call"];
const SALES_PERSONS = ["Revathi", "Manoj", "Suresh", "Naveen"];

// ✅ Outside main component
const MediaCell = ({ item, onView }) => {
  if (!item.mediaFile) return <span className="text-gray-400 text-xs">No media</span>;
  if (item.mediaFileType?.startsWith("image/")) {
    return (
      <img
        src={item.mediaFile}
        alt="complaint"
        className="w-14 h-14 object-cover rounded-lg border cursor-pointer hover:opacity-80"
        onClick={() => onView(item)}
      />
    );
  }
  return (
    <a
      href={item.mediaFile}
      download={item.mediaFileName || "video"}
      className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs block"
    >
      🎥 Download Video
    </a>
  );
};

// ✅ Outside main component
const LocationCell = ({ location }) => {
  if (!location) return <span className="text-gray-400 text-xs">—</span>;
  if (location.startsWith("http")) {
    return (
      <a href={location} target="_blank" rel="noreferrer" className="text-blue-500 text-xs underline">
        📍 View Map
      </a>
    );
  }
  return <span className="text-xs text-gray-600">{location}</span>;
};

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [socialEnquiries, setSocialEnquiries] = useState([]);
  const [activeTab, setActiveTab] = useState("complaints");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [toast, setToast] = useState("");
  const [viewMedia, setViewMedia] = useState(null);
  const role = localStorage.getItem("role");

  const [complaintForm, setComplaintForm] = useState({
    customerName: "",
    phone: "",
    salesPerson: "",
    complaintType: "",
    description: "",
    status: "Open",
  });

  const [socialForm, setSocialForm] = useState({
    customerName: "",
    phone: "",
    platform: "",
    message: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [c, s] = await Promise.all([getComplaints(), getSocialEnquiries()]);
    setComplaints(Array.isArray(c) ? c : []);
    setSocialEnquiries(Array.isArray(s) ? s : []);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    if (activeTab === "complaints") {
      setComplaintForm({ customerName: "", phone: "", salesPerson: "", complaintType: "", description: "", status: "Open" });
    } else {
      setSocialForm({ customerName: "", phone: "", platform: "", message: "", status: "Pending" });
    }
    setShowForm(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    if (activeTab === "complaints") {
      setComplaintForm({
        customerName: item.customerName,
        phone: item.phone || "",
        salesPerson: item.salesPerson,
        complaintType: item.complaintType,
        description: item.description || "",
        status: item.status,
      });
    } else {
      setSocialForm({
        customerName: item.customerName,
        phone: item.phone || "",
        platform: item.platform,
        message: item.message || "",
        status: item.status,
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "complaints") {
        if (editItem) {
          await updateComplaint(editItem._id, complaintForm);
          showToast("✅ Complaint updated");
        } else {
          await addComplaint(complaintForm);
          showToast("✅ Complaint added");
        }
      } else {
        if (editItem) {
          await updateSocialEnquiry(editItem._id, socialForm);
          showToast("✅ Enquiry updated");
        } else {
          await addSocialEnquiry(socialForm);
          showToast("✅ Enquiry added");
        }
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showToast("❌ Error saving");
    }
  };

  const handleDelete = async () => {
    if (deleteType === "complaint") {
      await deleteComplaint(deleteId);
    } else {
      await deleteSocialEnquiry(deleteId);
    }
    setDeleteId(null);
    setDeleteType("");
    fetchAll();
    showToast("✅ Deleted");
  };

  const openComplaints = complaints.filter((c) => c.status === "Open").length;
  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved").length;

  const salesComplaintData = SALES_PERSONS.map((person) => ({
    name: person,
    complaints: complaints.filter((c) => c.salesPerson?.toLowerCase() === person.toLowerCase()).length,
  })).filter((s) => s.complaints > 0);

  const complaintTypeData = COMPLAINT_TYPES.map((type) => ({
    name: type.length > 20 ? type.substring(0, 20) + "..." : type,
    fullName: type,
    count: complaints.filter((c) => c.complaintType === type).length,
  })).filter((t) => t.count > 0);

  const platformData = PLATFORMS.map((p) => ({
    name: p,
    count: socialEnquiries.filter((s) => s.platform === p).length,
  })).filter((p) => p.count > 0);

  const pendingSocial = socialEnquiries.filter((s) => s.status === "Pending").length;
  const resolvedSocial = socialEnquiries.filter((s) => s.status === "Resolved").length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaints & Social Media</h1>
          <p className="text-gray-500 text-sm">Track complaints and social media enquiries</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add {activeTab === "complaints" ? "Complaint" : "Enquiry"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("complaints")}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === "complaints" ? "bg-orange-500 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          🚨 Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === "social" ? "bg-orange-500 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          📱 Social Media ({socialEnquiries.length})
        </button>
      </div>

      {/* ── COMPLAINTS TAB ── */}
      {activeTab === "complaints" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs">Total</p>
              <p className="text-2xl font-bold text-gray-800">{complaints.length}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-red-500 text-xs">Open</p>
              <p className="text-2xl font-bold text-red-600">{openComplaints}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-green-600 text-xs">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedComplaints}</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-orange-600 text-xs">Resolution Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {complaints.length > 0 ? ((resolvedComplaints / complaints.length) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>

          {/* Charts */}
          {complaints.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Complaints by Salesperson</h3>
                {salesComplaintData.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={salesComplaintData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="complaints" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Complaints by Type</h3>
                {complaintTypeData.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={complaintTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip formatter={(val, name, props) => [val, props.payload.fullName]} />
                      <Bar dataKey="count" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Sales Person</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Invoice/Date</th>
                  <th className="p-4 text-left">Complaint Type</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Media</th>
                  <th className="p-4 text-left">Location</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-400">No complaints yet</td>
                  </tr>
                ) : (
                  complaints.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.customerName}</td>
                      <td className="p-4">{item.phone || "—"}</td>
                      <td className="p-4 capitalize">{item.salesPerson}</td>
                      <td className="p-4">{item.productName || "—"}</td>
                      <td className="p-4 text-xs text-gray-500">{item.purchaseDateOrInvoice || "—"}</td>
                      <td className="p-4">
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                          {item.complaintType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs truncate">{item.description || "—"}</td>
                      <td className="p-4">
                        <MediaCell item={item} onView={setViewMedia} />
                      </td>
                      <td className="p-4">
                        <LocationCell location={item.location} />
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Resolved" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1 border rounded mr-2 text-sm"
                        >
                          Edit
                        </button>
                        {role === "admin" && (
                          <button
                            onClick={() => { setDeleteId(item._id); setDeleteType("complaint"); }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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
          <div className="md:hidden flex flex-col gap-3">
            {complaints.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No complaints yet</p>
            ) : (
              complaints.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{item.customerName}</p>
                      <p className="text-xs text-gray-500">{item.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Resolved" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><span className="font-medium">Sales Person:</span> {item.salesPerson}</p>
                    {item.productName && <p><span className="font-medium">Product:</span> {item.productName}</p>}
                    {item.purchaseDateOrInvoice && (
                      <p><span className="font-medium">Invoice/Date:</span> {item.purchaseDateOrInvoice}</p>
                    )}
                    <p><span className="font-medium">Type:</span> {item.complaintType}</p>
                    {item.description && <p className="text-gray-500">{item.description}</p>}
                    {item.location && (
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {item.location.startsWith("http") ? (
                          <a href={item.location} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                            📍 View Map
                          </a>
                        ) : (
                          item.location
                        )}
                      </p>
                    )}
                  </div>
                  {item.mediaFile && (
                    <div className="mt-3">
                      {item.mediaFileType?.startsWith("image/") ? (
                        <img
                          src={item.mediaFile}
                          alt="complaint"
                          className="w-full h-40 object-cover rounded-lg cursor-pointer"
                          onClick={() => setViewMedia(item)}
                        />
                      ) : (
                        <a
                          href={item.mediaFile}
                          download={item.mediaFileName}
                          className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm block text-center"
                        >
                          🎥 Download Video
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => { setDeleteId(item._id); setDeleteType("complaint"); }}
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
        </>
      )}

      {/* ── SOCIAL MEDIA TAB ── */}
      {activeTab === "social" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-800">{socialEnquiries.length}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p className="text-yellow-600 text-xs">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingSocial}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-green-600 text-xs">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedSocial}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-600 text-xs">Top Platform</p>
              <p className="text-lg font-bold text-blue-600">
                {platformData.length > 0 ? platformData.sort((a, b) => b.count - a.count)[0].name : "—"}
              </p>
            </div>
          </div>

          {socialEnquiries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Enquiries by Platform</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Platform</th>
                  <th className="p-4 text-left">Message</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {socialEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No enquiries yet</td>
                  </tr>
                ) : (
                  socialEnquiries.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.customerName}</td>
                      <td className="p-4">{item.phone || "—"}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                          {item.platform}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{item.message || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Resolved" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleOpenEdit(item)} className="px-3 py-1 border rounded mr-2 text-sm">
                          Edit
                        </button>
                        {role === "admin" && (
                          <button
                            onClick={() => { setDeleteId(item._id); setDeleteType("social"); }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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

          <div className="md:hidden flex flex-col gap-3">
            {socialEnquiries.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No enquiries yet</p>
            ) : (
              socialEnquiries.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{item.customerName}</p>
                      <p className="text-xs text-gray-500">{item.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Resolved" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">Platform:</span>{" "}
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {item.platform}
                      </span>
                    </p>
                    {item.message && <p className="text-gray-500">{item.message}</p>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleOpenEdit(item)} className="flex-1 px-3 py-2 border rounded-lg text-sm">
                      Edit
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => { setDeleteId(item._id); setDeleteType("social"); }}
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
        </>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editItem ? "Edit" : "Add"} {activeTab === "complaints" ? "Complaint" : "Enquiry"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {activeTab === "complaints" ? (
                <>
                  <input placeholder="Customer Name" value={complaintForm.customerName} required
                    onChange={(e) => setComplaintForm({ ...complaintForm, customerName: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full" />
                  <input placeholder="Phone Number" value={complaintForm.phone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full" />
                  <select value={complaintForm.salesPerson} required
                    onChange={(e) => setComplaintForm({ ...complaintForm, salesPerson: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full">
                    <option value="" disabled>Select Sales Person</option>
                    {SALES_PERSONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={complaintForm.complaintType} required
                    onChange={(e) => setComplaintForm({ ...complaintForm, complaintType: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full">
                    <option value="" disabled>Select Complaint Type</option>
                    {COMPLAINT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <textarea placeholder="Description (optional)" value={complaintForm.description}
                    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full h-20 resize-none" />
                  <select value={complaintForm.status}
                    onChange={(e) => setComplaintForm({ ...complaintForm, status: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full">
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </>
              ) : (
                <>
                  <input placeholder="Customer Name" value={socialForm.customerName} required
                    onChange={(e) => setSocialForm({ ...socialForm, customerName: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full" />
                  <input placeholder="Phone Number" value={socialForm.phone}
                    onChange={(e) => setSocialForm({ ...socialForm, phone: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full" />
                  <select value={socialForm.platform} required
                    onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full">
                    <option value="" disabled>Select Platform</option>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <textarea placeholder="Message / Enquiry details" value={socialForm.message}
                    onChange={(e) => setSocialForm({ ...socialForm, message: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full h-20 resize-none" />
                  <select value={socialForm.status}
                    onChange={(e) => setSocialForm({ ...socialForm, status: e.target.value })}
                    className="border px-3 py-2 rounded-lg w-full">
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
                  {editItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Image Preview Modal */}
      {viewMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setViewMedia(null)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setViewMedia(null)}
              className="absolute -top-10 right-0 text-white text-xl font-bold"
            >
              ✕ Close
            </button>
            <img
              src={viewMedia.mediaFile}
              alt="complaint"
              className="w-full rounded-xl object-contain max-h-[80vh]"
            />
            <p className="text-white text-center text-sm mt-2">
              {viewMedia.customerName} — {viewMedia.complaintType}
            </p>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteId(null); setDeleteType(""); }}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

    </div>
  );
}