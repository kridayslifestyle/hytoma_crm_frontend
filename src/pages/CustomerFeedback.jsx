import React, { useState } from "react";

const GOOGLE_REVIEW =
  "https://search.google.com/local/writereview?placeid=ChIJOXwriN-RyzsRNJka-YFq4Hs";

export default function CustomerFeedback() {
  const [rating, setRating] = useState(0);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const workId = params.get("workId");

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
        }
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
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Rate Our Service</h2>

      {/* ⭐ STAR RATING */}
      <div className="flex gap-2 text-3xl mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            onClick={() => setRating(s)}
            className={`cursor-pointer ${
              rating >= s ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>

      {/* ❌ LOW RATING → COMPLAINT */}
      {rating > 0 && rating <= 3 && (
        <>
          <textarea
            className="border p-2 w-full"
            placeholder="Tell us what went wrong..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button
            onClick={submitFeedback}
            className="bg-red-500 text-white px-4 py-2 mt-3"
          >
            Submit Feedback
          </button>
        </>
      )}

      {/* ⭐ HIGH RATING */}
      {rating >= 4 && (
        <button
          onClick={submitFeedback}
          className="bg-green-500 text-white px-4 py-2 mt-3"
        >
          Continue to Google Review
        </button>
      )}
    </div>
  );
}