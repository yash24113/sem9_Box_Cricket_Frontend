import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
// Custom component for handling external assets like CSS links
const Helmet = ({ children }) => children;

// Use one base, then append the path used by the backend router mounting:
// server should mount like: app.use("/api/userapi", require("./routes/userApi"));
const API_ROOT = process.env.REACT_APP_API_ROOT || "https://sem9-box-cricket-backend.onrender.com/api/userapi";

const steps = ["Contact", "Location", "Investment", "Review"];

// --- Main Component ---
const ContactUs = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // New state to manage the read-only status of the email field
  const [isEmailReadonly, setIsEmailReadonly] = useState(false);

  const [data, setData] = useState({
    // Step 1
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    // Step 2
    haveVenue: false,
    venueType: "NA",
    areaSqFt: "",
    address: "",
    // Step 3
    investmentBudget: "",
    timeline: "0-3 months",
    experienceSports: false,
    yearsExperience: "",
    currentBusiness: "",
    // Step 4
    message: "",
    howHeard: "",
    agree: false,
  });

  // Use useEffect to safely access localStorage after the component mounts
  useEffect(() => {
    const loginDataString = localStorage.getItem('loggedInUser');
    if (loginDataString) {
      try {
        const loginObject = JSON.parse(loginDataString);
        if (loginObject && loginObject.email) {
          // 1. Update the email in the state
          setData((d) => ({ ...d, email: loginObject.email }));
          // 2. Set the email field to read-only
          setIsEmailReadonly(true);
        }
      } catch (error) {
        console.error('Error parsing login data from local storage:', error);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((d) => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (step === 0) {
      if (!data.name.trim()) return "Name is required";
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      if (!emailOk) return "Valid email is required";
      if (!data.phone.trim() || data.phone.trim().length < 8) return "Valid phone is required";
      if (!data.city.trim()) return "City is required";
      if (!data.state.trim()) return "State is required";
    }
    if (step === 1) {
      if (data.haveVenue) {
        if (!data.venueType || data.venueType === "NA") return "Select a venue type";
        if (!String(data.areaSqFt).trim()) return "Area (sqft) is required";
      }
    }
    if (step === 2) {
      if (!String(data.investmentBudget).trim()) return "Investment budget is required";
      if (!data.timeline) return "Timeline is required";
      if (data.experienceSports && !String(data.yearsExperience).trim())
        return "Enter years of experience";
    }
    if (step === 3) {
      if (!data.agree) return "Please accept the terms";
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) return toast.error(err, { position: "top-center" });
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err, { position: "top-center" });

    setLoading(true);
    try {
      const payload = {
        ...data,
        areaSqFt: data.areaSqFt ? Number(data.areaSqFt) : 0,
        investmentBudget: data.investmentBudget ? Number(data.investmentBudget) : 0,
        yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : 0,
      };
      // For this example, we assume the backend URL is valid for submission
      const res = await axios.post(`${API_ROOT}/franchise/apply`, payload);
      if (res.status === 201) {
        toast.success("Thanks! We’ll contact you soon.", { position: "top-center" });
        setData({
          name: "", email: isEmailReadonly ? data.email : "", phone: "", city: "", state: "", // Keep pre-filled email on reset
          haveVenue: false, venueType: "NA", areaSqFt: "", address: "",
          investmentBudget: "", timeline: "0-3 months", experienceSports: false, yearsExperience: "", currentBusiness: "",
          message: "", howHeard: "", agree: false,
        });
        setStep(0);
      } else {
        toast.error("Failed to submit. Try again.", { position: "top-center" });
      }
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.error || "Something went wrong. Try again later.";
      toast.error(msg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        {/* Fix: Load react-toastify CSS from CDN */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css" xintegrity="sha512-uGz9YJzQ3B6wM1H7P7K0i6gD6D6Q6F6F6J6W6G6H6K6K6L6M6N6P6Q6R6S6T6U6V6W6X6Y6Z6A==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Helmet>
      <div style={styles.shell}>
        <div style={styles.card}>
          <h2 style={styles.title}>Get Franchise Details</h2>

          {/* Progress */}
          <div style={styles.progressWrap}>
            {steps.map((label, i) => (
              <div key={label} style={styles.progressItem}>
                <div style={{
                  ...styles.dot,
                  background: i <= step ? "#2c4c97" : "#d1d5db"
                }} />
                <span style={{ fontSize: 12, color: i === step ? "#111827" : "#6b7280" }}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div style={{
                    ...styles.bar,
                    background: i < step ? "#2c4c97" : "#e5e7eb"
                  }} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={submit} style={styles.form}>
            {/* Step 1 */}
            {step === 0 && (
              <div style={styles.grid}>
                <Input label="Full Name" name="name" value={data.name} onChange={onChange} required />
                {/* UPDATED: Email field is now read-only if pre-filled */}
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={data.email}
                  // Use a no-op function if readonly to prevent warnings, otherwise use onChange
                  onChange={isEmailReadonly ? () => {} : onChange}
                  required
                  readOnly={isEmailReadonly}
                  // Apply the readonly style conditionally
                  style={isEmailReadonly ? styles.readOnlyInput : {}}
                />
                <Input label="Phone" name="phone" value={data.phone} onChange={onChange} required />
                <Input label="City" name="city" value={data.city} onChange={onChange} required />
                <Input label="State" name="state" value={data.state} onChange={onChange} required />
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div style={{ display: "grid", gap: 12 }}>
                <label style={styles.checkboxRow}>
                  <input type="checkbox" name="haveVenue" checked={data.haveVenue} onChange={onChange} />
                  <span>I already have a venue</span>
                </label>

                {data.haveVenue && (
                  <div style={styles.grid}>
                    <Select
                      label="Venue Type"
                      name="venueType"
                      value={data.venueType}
                      onChange={onChange}
                      options={["Indoor", "Outdoor", "Both"]}
                    />
                    <Input label="Area (sqft)" type="number" name="areaSqFt" value={data.areaSqFt} onChange={onChange} />
                    <Input label="Address" name="address" value={data.address} onChange={onChange} />
                  </div>
                )}
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div style={styles.grid}>
                <Input label="Investment Budget (₹)" type="number" name="investmentBudget" value={data.investmentBudget} onChange={onChange} required />
                <Select
                  label="Timeline to Start"
                  name="timeline"
                  value={data.timeline}
                  onChange={onChange}
                  options={["0-3 months", "3-6 months", "6-12 months", "12+ months"]}
                />
                <label style={styles.checkboxRow}>
                  <input type="checkbox" name="experienceSports" checked={data.experienceSports} onChange={onChange} />
                  <span>Experience in sports/fitness business</span>
                </label>
                {data.experienceSports && (
                  <>
                    <Input label="Years of Experience" type="number" name="yearsExperience" value={data.yearsExperience} onChange={onChange} />
                    <Input label="Current Business" name="currentBusiness" value={data.currentBusiness} onChange={onChange} />
                  </>
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 3 && (
              <div style={{ display: "grid", gap: 12 }}>
                <TextArea label="Anything else we should know?" name="message" value={data.message} onChange={onChange} />
                <Input label="How did you hear about us?" name="howHeard" value={data.howHeard}  onChange={onChange} />
                <label style={styles.checkboxRow}>
                  <input type="checkbox" name="agree" checked={data.agree} onChange={onChange} />
                  <span>I agree to be contacted about the franchise</span>
                </label>

                <div style={styles.summary}>
                  <b>Summary</b>
                  <p><b>Name:</b> {data.name} • <b>Phone:</b> {data.phone}</p>
                  <p><b>City/State:</b> {data.city}, {data.state}</p>
                  <p><b>Venue:</b> {data.haveVenue ? data.venueType : "No venue yet"} {data.haveVenue && data.areaSqFt ? `• ${data.areaSqFt} sqft` : ""}</p>
                  <p><b>Budget:</b> ₹{data.investmentBudget || "-"} • <b>Timeline:</b> {data.timeline}</p>
                </div>
              </div>
            )}

            <div style={styles.actions}>
              {step > 0 && (
                <button type="button" onClick={prev} style={styles.btnSoft}>
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button type="button" onClick={next} style={styles.btnPrimary}>
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading} style={styles.btnGold}>
                  {loading ? "Submitting…" : "Submit Enquiry"}
                </button>
              )}
            </div>
          </form>
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

// --- Helper Components ---

// Updated to accept and merge custom styles
const Input = ({ label, style: customStyle, ...props }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <input {...props} style={{...styles.input, ...customStyle}} />
  </label>
);

const Select = ({ label, options = [], ...props }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <select {...props} style={styles.input}>
      <option value="NA" disabled={props.name === "venueType"}>
        {props.name === "venueType" ? "Select type" : "Select"}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </label>
);

const TextArea = ({ label, ...props }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <textarea {...props} style={{ ...styles.input, height: 110, resize: "vertical" }} />
  </label>
);

// --- Styles ---
const styles = {
  shell: { maxWidth: 960, margin: "30px auto", padding: "0 16px", fontFamily: "Inter, sans-serif" },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 10px 28px rgba(17,35,56,.08)",
    padding: 24,
  },
  title: { margin: "4px 0 16px", fontSize: 26, fontWeight: 900, color: "#0f172a" },

  progressWrap: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20, alignItems: "center" },
  progressItem: { position: "relative", display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: "50%", transition: "background 0.3s" },
  bar: { height: 4, width: "100%", borderRadius: 4, position: "absolute", top: "50%", left: "calc(50% + 5px)", transform: "translateY(-50%)", zIndex: -1 },

  form: { display: "grid", gap: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { display: "grid", gap: 6 },
  labelText: { fontSize: 13, color: "#374151", fontWeight: 700 },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 15,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  // Visual cue for read-only fields
  readOnlyInput: {
    background: "#eef2ff", /* Light blue/gray background */
    cursor: "not-allowed",
    border: "1px solid #c7d2fe",
    color: "#4f46e5",
  },
  checkboxRow: { display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "#111827" },
  summary: {
    border: "1px solid #e0e7ff",
    borderRadius: 12,
    padding: 16,
    background: "#f9fafb",
    color: "#111827",
    fontSize: 14,
    boxShadow: "0 4px 6px rgba(0,0,0,0.03)"
  },

  actions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  btnPrimary: {
    background: "#2c4c97", color: "#fff", border: "none", padding: "10px 20px",
    borderRadius: 8, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(44,76,151,.25)",
  },
  btnSoft: {
    background: "transparent", color: "#0f172a", border: "1px solid #d1d5db",
    padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
  },
  btnGold: {
    background: "#d6a74b", color: "#0f172a", border: "none", padding: "10px 20px",
    borderRadius: 8, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(214,167,75,.25)",
  }
};

export default ContactUs;