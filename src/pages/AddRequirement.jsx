import { useState } from "react";

import { createRequirement } from "../services/requirementApi";

function AddRequirement() {
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    address: "",
    project_type: "",
  });

  const [switchBoards, setSwitchBoards] = useState([
    {
      location: "",
      size: "",
      quantity: 1,
    },
  ]);

  const [curtains, setCurtains] = useState([
    {
      room: "",
      width: 0,
      height: 0,
      curtain_type: "",
    },
  ]);

  const [sensors, setSensors] = useState([
    {
      sensor_type: "",
      quantity: 1,
    },
  ]);

  const [controlPoints, setControlPoints] = useState({
    light_controls: 0,
    fan_controls: 0,
    ac_controls: 0,
    curtain_controls: 0,
    geyser_controls: 0,
    exhaust_controls: 0,
  });

  const [locks, setLocks] = useState({
    face_lock_qty: 0,
    handle_lock_qty: 0,
    motorized_lock_qty: 0,
  });

  const [gateDetails, setGateDetails] = useState({
    gate_type: "",
    gate_weight: 0,
    gate_width: 0,
    no_of_gates: 1,
    motor_capacity: "",
  });

  const [voiceAssistant, setVoiceAssistant] = useState({
    alexa_required: false,
    google_home_required: false,
  });

  const [quotation, setQuotation] = useState({
    switch_boards_cost: 0,

    locks_cost: 0,

    sensor_cost: 0,

    curtain_motor_cost: 0,

    gate_motor_cost: 0,

    other_cost: 0,

    installation_charges: 0,

    gst_percentage: 18,

    discount: 0,

    advance_amount: 0,

    grand_total: 0,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addBoard = () => {
    setSwitchBoards([
      ...switchBoards,
      {
        location: "",
        size: "",
        quantity: 1,
      },
    ]);
  };

  const addCurtain = () => {
    setCurtains([
      ...curtains,
      {
        room: "",
        width: "",
        height: "",
        curtain_type: "",
      },
    ]);
  };

  const addSensor = () => {
    setSensors([
      ...sensors,
      {
        sensor_type: "",
        quantity: 1,
      },
    ]);
  };

  const handleSensorChange = (index, field, value) => {
    const updated = [...sensors];

    updated[index][field] = value;

    setSensors(updated);
  };

  const removeSensor = (index) => {
    if (sensors.length === 1) return;

    setSensors(sensors.filter((_, i) => i !== index));
  };

  const handleCurtainChange = (index, field, value) => {
    const updated = [...curtains];

    updated[index][field] = value;

    setCurtains(updated);
  };

  const removeCurtain = (index) => {
    if (curtains.length === 1) return;

    setCurtains(curtains.filter((_, i) => i !== index));
  };

  const handleBoardChange = (index, field, value) => {
    const updatedBoards = [...switchBoards];

    updatedBoards[index][field] = value;

    setSwitchBoards(updatedBoards);
  };

  const removeBoard = (index) => {
    if (switchBoards.length === 1) return;

    setSwitchBoards(switchBoards.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,

        switch_boards: switchBoards,

        curtains,

        sensors,

        ...controlPoints,

        ...locks,

        ...gateDetails,

        ...voiceAssistant,

        ...quotation,
      };

      const response = await createRequirement(data);

      console.log(response);

      alert("Requirement added successfully");
    } catch (error) {
      console.error(error);

      alert("Failed to save requirement");
    }
  };

  const handleControlChange = (e) => {
    setControlPoints({
      ...controlPoints,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleLockChange = (e) => {
    setLocks({
      ...locks,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleGateChange = (e) => {
    setGateDetails({
      ...gateDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleVoiceChange = (e) => {
    setVoiceAssistant({
      ...voiceAssistant,
      [e.target.name]: e.target.checked,
    });
  };

  const handleQuotationChange = (e) => {
    setQuotation({
      ...quotation,
      [e.target.name]: Number(e.target.value),
    });
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Add Client Requirement
        </h1>

        <p className="text-gray-500 mt-1">Fill customer project requirements</p>
      </div>

      {/* Customer Details Card */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Customer Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Name */}

          <div>
            <label className="block mb-2 text-gray-700">Customer Name</label>

            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* Phone */}

          <div>
            <label className="block mb-2 text-gray-700">Phone Number</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* Address */}

          <div>
            <label className="block mb-2 text-gray-700">Address</label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          {/* Project Type */}

          <div>
            <label className="block mb-2 text-gray-700">Project Type</label>

            <select
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select</option>

              <option value="Villa">Villa</option>

              <option value="Apartment">Apartment</option>

              <option value="Office">Office</option>

              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Switch Boards</h2>

          <button
            type="button"
            onClick={addBoard}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            + Add Board
          </button>
        </div>

        {switchBoards.map((board, index) => (
          <div key={index} className="grid md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Location"
              value={board.location}
              onChange={(e) =>
                handleBoardChange(index, "location", e.target.value)
              }
              className="border p-3 rounded-lg"
            />

            <select
              value={board.size}
              onChange={(e) => handleBoardChange(index, "size", e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="">Select Size</option>

              <option value="2M">2M</option>
              <option value="4M">4M</option>
              <option value="6M">6M</option>
              <option value="8M">8M</option>
              <option value="10M">10M</option>
              <option value="12M">12M</option>
              <option value="16M">16M</option>
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={board.quantity}
              onChange={(e) =>
                handleBoardChange(index, "quantity", e.target.value)
              }
              className="border p-3 rounded-lg"
            />

            <button
              type="button"
              onClick={() => removeBoard(index)}
              className="bg-red-500 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Control Points</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2">Light Controls</label>

            <input
              type="number"
              name="light_controls"
              value={controlPoints.light_controls}
              onChange={handleControlChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Fan Controls</label>

            <input
              type="number"
              name="fan_controls"
              value={controlPoints.fan_controls}
              onChange={handleControlChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">AC Controls</label>

            <input
              type="number"
              name="ac_controls"
              value={controlPoints.ac_controls}
              onChange={handleControlChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Curtain Controls</label>

            <input
              type="number"
              name="curtain_controls"
              value={controlPoints.curtain_controls}
              onChange={handleControlChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Geyser Controls</label>

            <input
              type="number"
              name="geyser_controls"
              value={controlPoints.geyser_controls}
              onChange={handleControlChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Exhaust Controls</label>

            <input
              type="number"
              name="exhaust_controls"
              value={controlPoints.exhaust_controls}
              onChange={handleControlChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Smart Locks</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2">Face Lock Qty</label>

            <input
              type="number"
              name="face_lock_qty"
              value={locks.face_lock_qty}
              onChange={handleLockChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Handle Fingerprint Lock Qty</label>

            <input
              type="number"
              name="handle_lock_qty"
              value={locks.handle_lock_qty}
              onChange={handleLockChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Motorized Fingerprint Lock Qty</label>

            <input
              type="number"
              name="motorized_lock_qty"
              value={locks.motorized_lock_qty}
              onChange={handleLockChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Curtains</h2>

          <button
            type="button"
            onClick={addCurtain}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            + Add Curtain
          </button>
        </div>

        {curtains.map((curtain, index) => (
          <div key={index} className="grid md:grid-cols-5 gap-4 mb-4">
            <input
              type="text"
              placeholder="Room"
              value={curtain.room}
              onChange={(e) =>
                handleCurtainChange(index, "room", e.target.value)
              }
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Width"
              value={curtain.width}
              onChange={(e) =>
                handleCurtainChange(index, "width", Number(e.target.value))
              }
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Height"
              value={curtain.height}
              onChange={(e) =>
                handleCurtainChange(index, "height", Number(e.target.value))
              }
              className="border p-3 rounded-lg"
            />

            <select
              value={curtain.curtain_type}
              onChange={(e) =>
                handleCurtainChange(index, "curtain_type", e.target.value)
              }
              className="border p-3 rounded-lg"
            >
              <option value="">Type</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Center Opening">Center Opening</option>
            </select>

            <button
              type="button"
              onClick={() => removeCurtain(index)}
              className="bg-red-500 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Sensors</h2>

          <button
            type="button"
            onClick={addSensor}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            + Add Sensor
          </button>
        </div>

        {sensors.map((sensor, index) => (
          <div key={index} className="grid md:grid-cols-3 gap-4 mb-4">
            <select
              value={sensor.sensor_type}
              onChange={(e) =>
                handleSensorChange(index, "sensor_type", e.target.value)
              }
              className="border p-3 rounded-lg"
            >
              <option value="">Select Sensor</option>

              <option value="Motion Sensor">Motion Sensor</option>

              <option value="Door Sensor">Door Sensor</option>

              <option value="Smoke Sensor">Smoke Sensor</option>

              <option value="Gas Sensor">Gas Sensor</option>

              <option value="Water Leakage Sensor">Water Leakage Sensor</option>

              <option value="PIR Sensor">PIR Sensor</option>
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={sensor.quantity}
              onChange={(e) =>
                handleSensorChange(index, "quantity", Number(e.target.value))
              }
              className="border p-3 rounded-lg"
            />

            <button
              type="button"
              onClick={() => removeSensor(index)}
              className="bg-red-500 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Gate Automation</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Gate Type</label>

            <select
              name="gate_type"
              value={gateDetails.gate_type}
              onChange={handleGateChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select</option>
              <option value="Sliding">Sliding</option>
              <option value="Swing">Swing</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Gate Weight (Kg)</label>

            <input
              type="number"
              name="gate_weight"
              value={gateDetails.gate_weight}
              onChange={handleGateChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Gate Width</label>

            <input
              type="number"
              name="gate_width"
              value={gateDetails.gate_width}
              onChange={handleGateChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">No Of Gates</label>

            <input
              type="number"
              name="no_of_gates"
              value={gateDetails.no_of_gates}
              onChange={handleGateChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2">Motor Capacity</label>

            <input
              type="text"
              name="motor_capacity"
              value={gateDetails.motor_capacity}
              onChange={handleGateChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Voice Assistants</h2>

        <div className="flex gap-10">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="alexa_required"
              checked={voiceAssistant.alexa_required}
              onChange={handleVoiceChange}
            />
            Alexa
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="google_home_required"
              checked={voiceAssistant.google_home_required}
              onChange={handleVoiceChange}
            />
            Google Home
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Quotation Details</h2>

        <div className="grid md:grid-cols-3 gap-6"></div>
        <div>
          <label className="block mb-2">Switch Boards Cost</label>

          <input
            type="number"
            name="switch_boards_cost"
            value={quotation.switch_boards_cost}
            onChange={handleQuotationChange}
            className="w-full border rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block mb-2">Locks Cost</label>

          <input
            type="number"
            name="locks_cost"
            value={quotation.locks_cost}
            onChange={handleQuotationChange}
            className="w-full border rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block mb-2">Sensor Cost</label>

          <input
            type="number"
            name="sensor_cost"
            value={quotation.sensor_cost}
            onChange={handleQuotationChange}
            className="w-full border rounded-lg p-3"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium"
        >
          Save Requirement
        </button>
      </div>
    </div>
  );
}

export default AddRequirement;
