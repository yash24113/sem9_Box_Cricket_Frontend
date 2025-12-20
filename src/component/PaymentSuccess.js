// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://sem9-box-cricket-backend.onrender.com/api/userapi";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // Handle both Stripe and Razorpay:
    //  - Stripe:   ?session_id=cs_test_...
    //  - Razorpay: ?session_id=order_XXXX (we pass order_id as session_id)
    //  - Fallbacks: ?order_id=..., ?razorpay_order_id=...
    const sessionId =
      searchParams.get("session_id") ||
      searchParams.get("order_id") ||
      searchParams.get("razorpay_order_id");

    const verify = async () => {
      if (!sessionId) {
        setError("Missing session/order id. Payment status unknown.");
        setStatus("");
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/checkout/session/${sessionId}`
        );
        const data = res.data || {};

        const paidFlag =
          data.paid ||
          data.payment_status === "paid" ||
          data.data?.payment_status === "paid";

        if (data.success && paidFlag) {
          setStatus(
            "Payment verified successfully. Redirecting to feedback..."
          );

          // clear any pending booking context
          localStorage.removeItem("pendingBookingContext");

          // short delay so user can read status
          setTimeout(() => {
            navigate("/feedback", {
              replace: true,
            });
          }, 1200);
        } else {
          setError("Payment not completed or could not be verified.");
          setStatus("");
        }
      } catch (err) {
        console.error("Verify session error:", err);
        setError(
          "Failed to verify payment. Please contact support with your payment details."
        );
        setStatus("");
      }
    };

    verify();
  }, [location.search, navigate]);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 24,
        borderRadius: 16,
        background: "#f9fafb",
        border: "1px solid rgba(148,163,253,.35)",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(15,23,42,.12)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 12,
        }}
      >
        Payment Status
      </h2>
      {status && (
        <p
          style={{
            color: "#111827",
            marginBottom: 8,
          }}
        >
          {status}
        </p>
      )}
      {error && (
        <p
          style={{
            color: "#b91c1c",
            marginTop: 4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default PaymentSuccess;
