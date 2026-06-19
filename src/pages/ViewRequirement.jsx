import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getRequirementById } from "../services/requirementApi";

function ViewRequirement() {
  const { id } = useParams();

  const [requirement, setRequirement] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadRequirement();
  }, [id]);

  const loadRequirement = async () => {
    const data = await getRequirementById(id);

    setRequirement(data);

    setItems(data.quotation_items || []);
  };

  if (!requirement) {
    return <div className="text-center mt-10 text-xl">Loading...</div>;
  }

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
                <th className="text-left py-3">GST %</th>
                <th className="text-left py-3">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">₹ {Number(item.rate).toFixed(2)}</td>
                  <td className="py-3">{item.gst}%</td>
                  <td className="py-3">
                    ₹ {(Number(item.quantity) * Number(item.rate)).toFixed(2)}
                  </td>
                </tr>
              ))}
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
              <th className="text-left py-3">Location</th>
              <th className="text-left py-3">Size</th>
              <th className="text-left py-3">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {requirement.switch_boards?.map((board, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{board.location}</td>
                <td className="py-3">{board.size}</td>
                <td className="py-3">{board.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controls */}

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Control Points</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <strong>Light Controls</strong>
            <p>{requirement.light_controls}</p>
          </div>

          <div>
            <strong>Fan Controls</strong>
            <p>{requirement.fan_controls}</p>
          </div>

          <div>
            <strong>AC Controls</strong>
            <p>{requirement.ac_controls}</p>
          </div>

          <div>
            <strong>Curtain Controls</strong>
            <p>{requirement.curtain_controls}</p>
          </div>

          <div>
            <strong>Geyser Controls</strong>
            <p>{requirement.geyser_controls}</p>
          </div>

          <div>
            <strong>Exhaust Controls</strong>
            <p>{requirement.exhaust_controls}</p>
          </div>
        </div>
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