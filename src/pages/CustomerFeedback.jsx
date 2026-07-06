import React, { useEffect, useState } from "react";

const GOOGLE_REVIEW =
  "https://search.google.com/local/writereview?placeid=ChIJOXwriN-RyzsRNJka-YFq4Hs";

export default function CustomerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]); // ✅ FIXED POSITION

  const API_URL = import.meta.env.VITE_API_URL;

  const loadFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customer-work/feedback`, {
        credentials: "include",
      });

      const data = await res.json();

      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load feedbacks", err);
      setFeedbacks([]);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Feedbacks
        </h1>
        <p className="text-sm text-gray-500">Monitor ratings & complaints</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Customer</th>
              <th>Rating</th>
              <th>Reason</th>
              <th>Work ID</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {feedbacks.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-400">
                  No feedback found
                </td>
              </tr>
            )}

            {feedbacks.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3">{item.customer_name}</td>

                <td>
                  <span
                    className={
                      item.rating >= 4 ? "text-green-600" : "text-red-500"
                    }
                  >
                    {item.rating} ⭐
                  </span>
                </td>

                <td>{item.reason || "-"}</td>

                <td>{item.workId}</td>

                <td>{item.date}</td>

                <td>
                  {item.rating >= 4 ? (
                    <a
                      href={GOOGLE_REVIEW}
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      Google Review
                    </a>
                  ) : (
                    <span className="text-orange-500">Complaint</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
