import React, { useEffect, useState } from "react";

const [feedbacks, setFeedbacks] = useState([]);

const GOOGLE_REVIEW =
  "https://search.google.com/local/writereview?placeid=ChIJOXwriN-RyzsRNJka-YFq4Hs";

export default function CustomerFeedback() {
  const [rating, setRating] = useState(0);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const workId = params.get("workId");

  const API_URL = import.meta.env.VITE_API_URL;

  const loadFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customer-work/feedback`);
      const data = await res.json();

      setFeedbacks(data || []);
    } catch (err) {
      console.error("Failed to load feedbacks", err);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const submitFeedback = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customer-work/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workId,
            rating,
            reason,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitted(true);

      // ⭐ CASE 4–5 → Google Review Redirect
      if (rating >= 4) {
        window.location.href = GOOGLE_REVIEW;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  if (submitted && rating < 4) {
    return (
      <div className="p-6">
        <h2>Thank you for your feedback 🙏</h2>
        <p>We will improve our service.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Feedbacks
        </h1>
        <p className="text-sm text-gray-500">
          Monitor customer ratings and complaints
        </p>
      </div>

      {/* TABLE CARD */}
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
            {feedbacks?.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-400">
                  No feedback found
                </td>
              </tr>
            )}

            {feedbacks?.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3">{item.customer_name}</td>

                <td>
                  <span
                    className={`font-semibold ${
                      item.rating >= 4 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.rating} ⭐
                  </span>
                </td>

                <td className="max-w-xs text-gray-600">{item.reason || "-"}</td>

                <td>{item.workId}</td>

                <td className="text-gray-500">{item.date}</td>

                <td>
                  {item.rating >= 4 ? (
                    <a
                      href="https://search.google.com/local/writereview?placeid=ChIJOXwriN-RyzsRNJka-YFq4Hs"
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
