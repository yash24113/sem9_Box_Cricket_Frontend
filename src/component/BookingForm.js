// src/pages/BookingForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaRupeeSign,
  FaArrowLeft,
  FaMoneyBillWave,
  FaWallet,
  FaHourglassHalf,
  FaCalendarAlt,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

/* Stripe publishable key (used when provider = "stripe") */
const stripePromise = loadStripe(
  "pk_test_51QyZGWFEFmRRpSNlxfSNSZJWMhn24giINhmlTl31UWc80B4xd1QIMhPtW6GgLpVZ0ZFZXi7UzhLnueEOLejbQyE700EsZSEEkL"
);

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://sem9-box-cricket-backend.onrender.com/api/userapi";

/** Dynamically load Razorpay SDK once */
async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const BookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // read logged in user
  let loggedInUser = null;
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      loggedInUser = parsed?.data || parsed?.user || parsed || null;
    }
  } catch {
    loggedInUser = null;
  }

  // -------- Resolve booking context --------
  const getInitialContext = () => {
    const state = location.state || {};
    const search = new URLSearchParams(location.search || "");
    let stored = {};
    try {
      stored =
        JSON.parse(localStorage.getItem("pendingBookingContext") || "null") ||
        {};
    } catch {
      stored = {};
    }

    const pick = (key, altKeys = []) => {
      if (state[key] !== undefined && state[key] !== null && state[key] !== "")
        return state[key];

      for (const k of altKeys) {
        if (state[k]) return state[k];
      }

      const fromQuery =
        search.get(key) || altKeys.map((k) => search.get(k)).find((v) => v);
      if (fromQuery) return fromQuery;

      if (stored[key]) return stored[key];
      for (const k of altKeys) {
        if (stored[k]) return stored[k];
      }
      return "";
    };

    const priceRaw = pick("price", ["slotPrice", "amount"]);

    return {
      areaName: pick("areaName", ["area"]),
      startTime: pick("startTime", ["slotStartTime", "from"]),
      endTime: pick("endTime", ["slotEndTime", "to"]),
      price: priceRaw ? Number(priceRaw) : "",
      slotId: pick("slotId", ["slot_id"]),
      areaId: pick("areaId", ["area_id"]),
      selectedDate: pick("selectedDate", ["date"]),
    };
  };

  const [context] = useState(getInitialContext);
  const { areaName, startTime, endTime, price, slotId, areaId, selectedDate } =
    context;

  const [formData, setFormData] = useState({ advancePayment: "" });
  const [step, setStep] = useState(1);
  const [duePayment, setDuePayment] = useState(0);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [isProcessing, setIsProcessing] = useState(false);

  // persist context
  useEffect(() => {
    localStorage.setItem("pendingBookingContext", JSON.stringify(context));
  }, [context]);

  // validate context
  useEffect(() => {
    const total = Number(price) || 0;
    if (!slotId || !areaId || !selectedDate || total <= 0) {
      setServerError(
        "Missing booking context. Please go back to the slot list and select a slot again."
      );
    } else {
      setServerError("");
    }
  }, [slotId, areaId, selectedDate, price]);

  // recalc due payment
  useEffect(() => {
    const adv = parseFloat(formData.advancePayment) || 0;
    const total = Number(price) || 0;
    const due = total - adv;
    setDuePayment(due > 0 ? due : 0);
  }, [formData.advancePayment, price]);

  // timer
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error("Booking session expired!");
      navigate("/arealist");
      return;
    }
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTimeLeft = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // validation
  const validate = () => {
    const newErrors = {};
    const total = Number(price) || 0;
    const adv = parseFloat(formData.advancePayment);

    if (!slotId || !areaId || !selectedDate || total <= 0) {
      newErrors.global =
        "Missing booking context. Please go back and select a slot again.";
    }
    if (formData.advancePayment === "") {
      newErrors.advancePayment = "Advance payment is required";
    } else if (isNaN(adv) || adv <= 0) {
      newErrors.advancePayment = "Advance payment must be a positive number";
    } else if (adv > total) {
      newErrors.advancePayment = "Advance cannot be more than total price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  // main payment flow (Stripe or Razorpay depending on backend response)
  const handlePayment = async () => {
    if (!loggedInUser?._id || !loggedInUser?.email) {
      setServerError("You must be logged in to book a slot.");
      toast.error("Please log in and try again.");
      return;
    }
    if (!validate()) return;

    try {
      setIsProcessing(true);
      setServerError("");

      const token = localStorage.getItem("token") || "";

      // 1) Create booking in DB
      const bookingPayload = {
        user_id: String(loggedInUser._id),
        slot_id: String(slotId),
        area_id: String(areaId),

        email: String(loggedInUser.email),
        mobile: String(loggedInUser.mobile || ""),

        date: selectedDate,
        price: Number(price),
        advance_payment: Number(formData.advancePayment),
        due_payment: Number(duePayment),

        start_time: startTime || null,
        end_time: endTime || null,
        area_name: areaName || null,

        payment_status: "pending",
        booking_status: "pending",
      };

      const bookingRes = await axios.post(
        `${API_BASE}/addBooking`,
        bookingPayload,
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined
      );

      const booking =
        bookingRes.data?.data || bookingRes.data?.booking || bookingRes.data;
      if (!booking || !booking._id) {
        throw new Error(
          "Booking creation failed: missing booking ID from server."
        );
      }

      // 2) Ask backend to create session/order (provider-agnostic)
      const checkoutPayload = {
        booking_id: booking._id,
        userEmail: String(loggedInUser.email),
        user_id: String(loggedInUser._id),
        slot_id: String(slotId),
        area_id: String(areaId),
        date: new Date(selectedDate).toISOString(),
        price: Number(price),
        advance_payment: Number(formData.advancePayment),
        due_payment: Number(duePayment),
      };

      const res = await fetch(`${API_BASE}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutPayload),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        const txt = await res.text();
        result = { error: txt || "Unknown server error" };
      }

      if (!res.ok || !result?.id) {
        const msg = result?.error || "Payment session creation failed";
        const received = result?.received;
        if (received) {
          const missing = Object.entries(received)
            .filter(([, ok]) => !ok)
            .map(([k]) => k)
            .join(", ");
          setServerError(
            `${msg}${missing ? ` (Server missing/invalid: ${missing})` : ""}`
          );
        } else {
          setServerError(msg);
        }
        toast.error(msg);
        return;
      }

      const provider = result.provider || "stripe";

      // ---------- STRIPE FLOW ----------
      if (provider === "stripe") {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: result.id, // Stripe checkout session id
        });
        if (error) {
          setServerError(error.message || "Stripe redirect failed");
          toast.error(error.message || "Stripe redirect failed");
        }
        return;
      }

      // ---------- RAZORPAY FLOW ----------
      if (provider === "razorpay") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load Razorpay SDK");
          return;
        }

        const options = {
          key: result.razorpayKeyId, // backend sends RAZORPAY_KEY_ID
          amount: result.amount, // in paise
          currency: result.currency || "INR",
          name: "Box Cricket – Advance Payment",
          description: "Booking payment",
          order_id: result.id, // Razorpay order_id
          prefill: {
            name: `${loggedInUser?.fname || ""} ${
              loggedInUser?.lname || ""
            }`.trim(),
            email: loggedInUser?.email || "",
            contact: loggedInUser?.mobile || "",
          },
          notes: {
            booking_id: booking._id,
          },
          theme: {
            color: "#0ea5e9",
          },
          handler: function (response) {
            // On successful payment -> redirect to common success page.
            // PaymentSuccess will verify with /checkout/session/:id and send to /feedback.
            toast.success("Payment successful!");
            navigate(
              `/payment-success?session_id=${response.razorpay_order_id}`,
              { replace: true }
            );
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment popup closed");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // Fallback if some unsupported provider
      toast.error(`Unsupported payment provider: ${provider}`);
    } catch (error) {
      console.error("Payment/booking error:", error);
      setServerError(error?.message || "Payment or booking failed");
      toast.error(error?.message || "Payment or booking failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasCriticalContextError =
    !slotId || !areaId || !selectedDate || !Number(price);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/arealist")} style={styles.backButton}>
        <FaArrowLeft /> Back to Slots
      </button>

      <h2 style={styles.heading}>🎟️ Confirm Your Booking</h2>

      <div style={styles.timerBox}>
        <FaHourglassHalf /> Time left to complete booking:{" "}
        <strong>{formatTimeLeft(timeLeft)}</strong>
      </div>

      {serverError && <div style={styles.errorBanner}>{serverError}</div>}
      {errors.global && <div style={styles.errorBanner}>{errors.global}</div>}

      <div style={styles.form}>
        {step === 1 && (
          <>
            <h3>👤 Your Details</h3>
            <label style={styles.label}>
              <FaUser /> Name:
            </label>
            <input
              type="text"
              value={`${loggedInUser?.fname || ""} ${
                loggedInUser?.lname || ""
              }`.trim()}
              disabled
              style={styles.disabledInput}
            />
            <label style={styles.label}>
              <FaEnvelope /> Email:
            </label>
            <input
              type="email"
              value={loggedInUser?.email || ""}
              disabled
              style={styles.disabledInput}
            />
            <label style={styles.label}>
              <FaPhone /> Mobile:
            </label>
            <input
              type="text"
              value={loggedInUser?.mobile || ""}
              disabled
              style={styles.disabledInput}
            />
          </>
        )}

        {step === 2 && (
          <>
            <h3>📍 Slot Information</h3>
            <label style={styles.label}>
              <FaMapMarkerAlt /> Area:
            </label>
            <div style={styles.infoBox}>{areaName || "Not specified"}</div>

            <label style={styles.label}>
              <FaCalendarAlt /> Date:
            </label>
            <div style={styles.infoBox}>
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not specified"}
            </div>

            <label style={styles.label}>
              <FaClock /> Slot Time:
            </label>
            <div style={styles.infoBox}>
              {startTime && endTime ? `${startTime} - ${endTime}` : "Not specified"}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3>💸 Payment Details</h3>
            <label style={styles.label}>
              <FaRupeeSign /> Price:
            </label>
            <input
              type="text"
              value={price ? `₹${Number(price).toFixed(2)}` : ""}
              disabled
              style={styles.disabledInput}
            />
            <label style={styles.label}>
              <FaMoneyBillWave /> Advance Payment:
            </label>
            <input
              type="number"
              name="advancePayment"
              value={formData.advancePayment}
              onChange={handleChange}
              style={styles.input}
              min="1"
            />
            {errors.advancePayment && (
              <p style={styles.error}>{errors.advancePayment}</p>
            )}
            <label style={styles.label}>
              <FaWallet /> Due Payment:
            </label>
            <input
              type="text"
              value={`₹${duePayment}`}
              disabled
              style={styles.disabledInput}
            />
          </>
        )}

        <div style={styles.buttonRow}>
          {step > 1 && (
            <button
              style={styles.navButton}
              onClick={() => setStep(step - 1)}
            >
              ⬅️ Previous
            </button>
          )}
          {step < 3 ? (
            <button
              style={styles.navButton}
              onClick={() => setStep(step + 1)}
            >
              Next ➡️
            </button>
          ) : (
            <button
              style={{
                ...styles.confirmButton,
                opacity: isProcessing || hasCriticalContextError ? 0.6 : 1,
              }}
              onClick={handlePayment}
              disabled={isProcessing || hasCriticalContextError}
            >
              {isProcessing ? "Processing..." : "💳 Pay & Confirm"}
            </button>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  backButton: {
    marginBottom: "20px",
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  heading: {
    fontSize: "24px",
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  label: {
    marginTop: "10px",
    display: "block",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid white",
  },
  disabledInput: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    border: "1px solid white",
  },
  infoBox: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
    textAlign: "left",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    color: "#495057",
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },
  navButton: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
  },
  confirmButton: {
    padding: "12px 24px",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
  },
  timerBox: {
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#ff4d4d",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  errorBanner: {
    background: "#fff2f2",
    border: "1px solid #ffcccc",
    color: "#b80000",
    padding: "10px 12px",
    borderRadius: "6px",
    marginBottom: "12px",
    fontWeight: 600,
  },
};

export default BookingForm;
