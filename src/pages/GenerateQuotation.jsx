import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getRequirementById,
  saveQuotation,
} from "../services/requirementApi";

function GenerateQuotation() {
  const { id } = useParams();

  const [requirement, setRequirement] = useState(null);

  const [quotation, setQuotation] = useState({
    installation_charges: 0,
    discount: 0,
    advance_amount: 0,
  });

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      rate: 0,
      gst: 18,
    },
  ]);

  useEffect(() => {
    loadRequirement();
  }, []);

  const loadRequirement = async () => {
    const data = await getRequirementById(id);

    setRequirement(data);

    setItems(
      data.quotation_items && data.quotation_items.length > 0
        ? data.quotation_items
        : [
            {
              description: "",
              quantity: 1,
              rate: 0,
              gst: 18,
            },
          ],
    );

    setQuotation({
      installation_charges: data.installation_charges || 0,
      discount: data.discount || 0,
      advance_amount: data.advance_amount || 0,
    });
  };

  const handleQuotationChange = (e) => {
    setQuotation({
      ...quotation,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        rate: 0,
        gst: 18,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.rate),
    0,
  );

  const gstAmount = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.quantity) * Number(item.rate) * Number(item.gst)) / 100,
    0,
  );

  const cgst = gstAmount / 2;

  const sgst = gstAmount / 2;

  const grandTotal =
    subtotal +
    gstAmount +
    Number(quotation.installation_charges) -
    Number(quotation.discount);

  const pendingAmount = grandTotal - Number(quotation.advance_amount);

  const handleSave = async () => {
    const payload = {
      quotation_items: items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        gst: Number(item.gst || 18),
      })),

      installation_charges: Number(quotation.installation_charges || 0),
      discount: Number(quotation.discount || 0),
      advance_amount: Number(quotation.advance_amount || 0),

      amount: subtotal,
      cgst,
      sgst,
      grand_total: grandTotal,
    };

    try {
      await saveQuotation(id, payload);
      await loadRequirement();
      alert("Quotation saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save quotation");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Generate Quotation</h1>

      {/* Products */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Products</h2>

          <button
            onClick={addItem}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            + Add Product
          </button>
        </div>

        {items.map((item, index) => {
          const taxable = Number(item.quantity || 0) * Number(item.rate || 0);
          const gstRate = Number(item.gst || 18);
          const lineCgst = (taxable * (gstRate / 2)) / 100;
          const lineSgst = (taxable * (gstRate / 2)) / 100;
          const lineTotal = taxable + lineCgst + lineSgst;

          return (
            <div key={index} className="mb-4 border rounded-lg p-4">
              <div className="grid md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="border p-3 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="border p-3 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                  className="border p-3 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="GST %"
                  value={item.gst}
                  onChange={(e) => handleItemChange(index, "gst", e.target.value)}
                  className="border p-3 rounded-lg"
                />

                <button
                  onClick={() => removeItem(index)}
                  className="bg-red-500 text-white rounded-lg"
                >
                  Remove
                </button>
              </div>

              {/* Read-only computed breakdown for this line, CGST/SGST split 50/50 */}
              <div className="grid md:grid-cols-4 gap-4 mt-3 text-sm text-gray-600">
                <div>
                  Taxable Value:{" "}
                  <span className="font-medium text-gray-800">
                    ₹ {taxable.toFixed(2)}
                  </span>
                </div>
                <div>
                  CGST ({(gstRate / 2).toFixed(1)}%):{" "}
                  <span className="font-medium text-gray-800">
                    ₹ {lineCgst.toFixed(2)}
                  </span>
                </div>
                <div>
                  SGST ({(gstRate / 2).toFixed(1)}%):{" "}
                  <span className="font-medium text-gray-800">
                    ₹ {lineSgst.toFixed(2)}
                  </span>
                </div>
                <div>
                  Amount:{" "}
                  <span className="font-semibold text-orange-600">
                    ₹ {lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra Details */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-6">Additional Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label>Installation Charges</label>

            <input
              type="number"
              name="installation_charges"
              value={quotation.installation_charges}
              onChange={handleQuotationChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label>Discount</label>

            <input
              type="number"
              name="discount"
              value={quotation.discount}
              onChange={handleQuotationChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label>Advance Amount</label>

            <input
              type="number"
              name="advance_amount"
              value={quotation.advance_amount}
              onChange={handleQuotationChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-6">Summary</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3>Amount</h3>
            <p className="text-2xl text-orange-500">₹ {subtotal.toFixed(2)}</p>
          </div>

          <div>
            <h3>CGST</h3>
            <p className="text-2xl text-orange-500">₹ {cgst.toFixed(2)}</p>
          </div>

          <div>
            <h3>SGST</h3>
            <p className="text-2xl text-orange-500">₹ {sgst.toFixed(2)}</p>
          </div>

          <div>
            <h3>Grand Total</h3>
            <p className="text-3xl font-bold text-green-600">
              ₹ {grandTotal.toFixed(2)}
            </p>
          </div>

          <div>
            <h3>Pending Amount</h3>
            <p className="text-3xl font-bold text-red-500">
              ₹ {pendingAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg"
        >
          Save Quotation
        </button>
      </div>
    </div>
  );
}

export default GenerateQuotation;