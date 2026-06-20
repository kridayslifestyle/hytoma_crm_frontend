import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRequirements, deleteRequirement } from "../services/requirementApi";

function ClientRequirements() {
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const data = await getRequirements();

      setRequirements(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this requirement?",
    );

    if (!confirmDelete) return;

    try {
      await deleteRequirement(id);

      fetchRequirements();
    } catch (error) {
      console.log(error);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    finalized: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Client Requirements
          </h1>

          <p className="text-gray-500 mt-1">
            Manage customer project requirements
          </p>
        </div>

        <Link
          to="/add-requirement"
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-medium"
        >
          + Add Requirement
        </Link>
      </div>

      {/* Table Card */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Requirements List</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Customer</th>

                <th className="text-left py-3">Phone</th>

                <th className="text-left py-3">Project Type</th>

                <th className="text-left py-3">Created Date</th>

                <th className="text-left py-3">Quotation</th>

                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requirements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No requirements found
                  </td>
                </tr>
              ) : (
                requirements.map((req) => {
                  const status = req.quotation_status || "pending";

                  return (
                    <tr key={req._id} className="border-b">
                      <td className="py-4">{req.customer_name}</td>

                      <td className="py-4">{req.phone}</td>

                      <td className="py-4">{req.project_type}</td>

                      <td className="py-4">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              req.quotation_sent
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {req.quotation_sent ? "Sent" : "Not Sent"}
                          </span>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              statusColors[status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 flex gap-3">
                        <Link
                          to={`/requirements/${req._id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          View
                        </Link>

                        <Link
                          to={`/requirements/edit/${req._id}`}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(req._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClientRequirements;
