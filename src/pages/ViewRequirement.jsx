import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  getRequirementById,
  sendQuotationWhatsApp,
  updateQuotationStatus,
  sendReminderWhatsApp,
} from "../services/requirementApi";

function ViewRequirement() {
  const { id } = useParams();

  const [requirement, setRequirement] = useState(null);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadRequirement();
  }, [id]);

  const loadRequirement = async () => {
    const data = await getRequirementById(id);

    setRequirement(data);

    setItems(data.quotation_items || []);
  };

  const handleSendQuotation = async () => {
    setBusy("send");
    setFeedback("");
    try {
      const res = await sendQuotationWhatsApp(id);
      setFeedback(res.message || "Done");
      await loadRequirement();
    } catch (error) {
      console.log(error);
      setFeedback("Failed to send quotation on WhatsApp");
    } finally {
      setBusy("");
    }
  };

  const handleStatusChange = async (status) => {
    setBusy("status");
    setFeedback("");
    try {
      const res = await updateQuotationStatus(id, status);
      setFeedback(res.message || "Status updated");
      await loadRequirement();
    } catch (error) {
      console.log(error);
      setFeedback("Failed to update status");
    } finally {
      setBusy("");
    }
  };

  const handleSendReminder = async () => {
    setBusy("reminder");
    setFeedback("");
    try {
      const res = await sendReminderWhatsApp(id);
      setFeedback(res.message || "Reminder sent");
      await loadRequirement();
    } catch (error) {
      console.log(error);
      setFeedback("Failed to send reminder");
    } finally {
      setBusy("");
    }
  };

  if (!requirement) {
    return <div className="text-center mt-10 text-xl">Loading...</div>;
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    finalized: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const brandLabels = { HSH: "Hytoma (HSH)", HS: "Varni (HS)" };
  const status = requirement.quotation_status || "pending";
  const hasQuotation = items.length > 0;
  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Requirement Details
        </h1>

        <p className="text-gray-500 mt-1">Customer requirement information</p>
      </div>

      <div className="flex gap-4 mt-8">
        <Link
          to={`/generate-quotation/${requirement._id}`}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg"
        >
          Generate Quotation
        </Link>

        <a
          href={`${import.meta.env.VITE_API_URL}/quotation/pdf/${requirement._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Download PDF
        </a>
      </div>

      {/* WhatsApp / Quotation Workflow */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold">Quotation Workflow</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sent badge */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                requirement.quotation_sent
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {requirement.quotation_sent ? "Sent ✓" : "Not Sent"}
            </span>

            {/* Status badge */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                statusColors[status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Meta line */}
        <div className="text-sm text-gray-500 mb-5 space-y-1">
          {requirement.quotation_sent_at && (
            <p>Last sent: {fmtDate(requirement.quotation_sent_at)}</p>
          )}
          {requirement.reminders_sent > 0 && (
            <p>
              Reminders sent: {requirement.reminders_sent}
              {requirement.last_reminder_at &&
                ` (last: ${fmtDate(requirement.last_reminder_at)})`}
            </p>
          )}
          {!hasQuotation && (
            <p className="text-orange-600">
              Generate a quotation before sending it on WhatsApp.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSendQuotation}
            disabled={!hasQuotation || busy === "send"}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg"
          >
            {busy === "send"
              ? "Sending..."
              : requirement.quotation_sent
                ? "Resend Quotation on WhatsApp"
                : "Send Quotation on WhatsApp"}
          </button>

          <button
            onClick={handleSendReminder}
            disabled={!requirement.quotation_sent || busy === "reminder"}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg"
          >
            {busy === "reminder" ? "Sending..." : "Send Reminder"}
          </button>

          <button
            onClick={() => handleStatusChange("finalized")}
            disabled={status === "finalized" || busy === "status"}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg"
          >
            Mark Finalized
          </button>

          <button
            onClick={() => handleStatusChange("rejected")}
            disabled={status === "rejected" || busy === "status"}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg"
          >
            Mark Rejected
          </button>

          {status !== "pending" && (
            <button
              onClick={() => handleStatusChange("pending")}
              disabled={busy === "status"}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 px-5 py-2.5 rounded-lg"
            >
              Reset to Pending
            </button>
          )}
        </div>

        {feedback && (
          <p className="mt-4 text-sm text-gray-700 bg-gray-50 border rounded-lg px-4 py-2">
            {feedback}
          </p>
        )}
      </div>

      {/* QUOTATION PREVIEW (line items - single source of truth for pricing) */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Quotation Preview
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-400">
            No quotation items yet. Use "Generate Quotation" to add products
            and pricing.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Description</th>
                <th className="text-left py-3">Qty</th>
                <th className="text-left py-3">Rate</th>
                <th className="text-left py-3">Taxable Value</th>
                <th className="text-left py-3">CGST (9%)</th>
                <th className="text-left py-3">SGST (9%)</th>
                <th className="text-left py-3">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const taxable = Number(item.quantity) * Number(item.rate);
                const gstRate = Number(item.gst || 18);
                const cgst = (taxable * (gstRate / 2)) / 100;
                const sgst = (taxable * (gstRate / 2)) / 100;
                const total = taxable + cgst + sgst;

                return (
                  <tr key={index} className="border-b">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3">{item.quantity}</td>
                    <td className="py-3">₹ {Number(item.rate).toFixed(2)}</td>
                    <td className="py-3">₹ {taxable.toFixed(2)}</td>
                    <td className="py-3">₹ {cgst.toFixed(2)}</td>
                    <td className="py-3">₹ {sgst.toFixed(2)}</td>
                    <td className="py-3 font-medium">₹ {total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Information */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Customer Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <strong>Name</strong>
            <p>{requirement.customer_name}</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p>{requirement.phone}</p>
          </div>

          <div>
            <strong>Address</strong>
            <p>{requirement.address}</p>
          </div>

          <div>
            <strong>Project Type</strong>
            <p>{requirement.project_type}</p>
          </div>
        </div>
      </div>

      {/* Switch Boards */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Switch Boards</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Brand</th>
              <th className="text-left py-3">Location</th>
              <th className="text-left py-3">Size</th>
              <th className="text-left py-3">Description</th>
              <th className="text-left py-3">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {requirement.switch_boards?.map((board, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">
                  {brandLabels[board.brand_code] || "-"}
                </td>
                <td className="py-3">{board.location}</td>
                <td className="py-3">{board.size}</td>
                <td className="py-3">{board.description}</td>
                <td className="py-3">{board.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Smart Locks */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Smart Locks</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <strong>Face Lock Qty</strong>
            <p>{requirement.face_lock_qty}</p>
          </div>

          <div>
            <strong>Handle Lock Qty</strong>
            <p>{requirement.handle_lock_qty}</p>
          </div>

          <div>
            <strong>Motorized Lock Qty</strong>
            <p>{requirement.motorized_lock_qty}</p>
          </div>
        </div>
      </div>

      {/* Curtains */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Curtains</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Room</th>
              <th className="text-left py-3">Width</th>
              <th className="text-left py-3">Height</th>
              <th className="text-left py-3">Type</th>
            </tr>
          </thead>

          <tbody>
            {requirement.curtains?.map((curtain, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{curtain.room}</td>
                <td className="py-3">{curtain.width}</td>
                <td className="py-3">{curtain.height}</td>
                <td className="py-3">{curtain.curtain_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sensors */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Sensors</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Sensor Type</th>
              <th className="text-left py-3">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {requirement.sensors?.map((sensor, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{sensor.sensor_type}</td>
                <td className="py-3">{sensor.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gate Automation */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Gate Automation</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <strong>Gate Type</strong>
            <p>{requirement.gate_type}</p>
          </div>

          <div>
            <strong>Gate Weight</strong>
            <p>{requirement.gate_weight}</p>
          </div>

          <div>
            <strong>Gate Width</strong>
            <p>{requirement.gate_width}</p>
          </div>

          <div>
            <strong>Motor Capacity</strong>
            <p>{requirement.motor_capacity}</p>
          </div>
        </div>
      </div>

      {/* Voice Assistants */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Voice Assistants</h2>

        <p>Alexa Required : {requirement.alexa_required ? "Yes" : "No"}</p>

        <p className="mt-3">
          Google Home Required :{" "}
          {requirement.google_home_required ? "Yes" : "No"}
        </p>
      </div>

      {/* Quotation Summary (derived from line items + Generate Quotation page) */}

      <div className="bg-white rounded-xl shadow p-6 mt-8 mb-10">
        <h2 className="text-xl font-semibold mb-6">Quotation Summary</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <strong>Amount</strong>
            <p>₹ {Number(requirement.amount || 0).toFixed(2)}</p>
          </div>

          <div>
            <strong>CGST</strong>
            <p>₹ {Number(requirement.cgst || 0).toFixed(2)}</p>
          </div>

          <div>
            <strong>SGST</strong>
            <p>₹ {Number(requirement.sgst || 0).toFixed(2)}</p>
          </div>

          <div>
            <strong>Installation Charges</strong>
            <p>₹ {Number(requirement.installation_charges || 0).toFixed(2)}</p>
          </div>

          <div>
            <strong>Discount</strong>
            <p>₹ {Number(requirement.discount || 0).toFixed(2)}</p>
          </div>

          <div>
            <strong>Advance Amount</strong>
            <p>₹ {Number(requirement.advance_amount || 0).toFixed(2)}</p>
          </div>

          <div>
            <strong>Pending Amount</strong>
            <p>
              ₹{" "}
              {(
                Number(requirement.grand_total || 0) -
                Number(requirement.advance_amount || 0)
              ).toFixed(2)}
            </p>
          </div>

          <div>
            <strong>Grand Total</strong>
            <p className="font-bold text-orange-600 text-lg">
              ₹ {Number(requirement.grand_total || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewRequirement;