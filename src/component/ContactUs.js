import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Use one base, then append the path used by the backend router mounting:
// server should mount like: app.use("/api/userapi", require("./routes/userApi"));
const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:5000/api/userapi";

const steps = ["Contact", "Location", "Investment", "Review"];

const ContactUs = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

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
      // ✅ This endpoint exists in the updated backend below
      const res = await axios.post(`${API_ROOT}/franchise/apply`, payload);
      if (res.status === 201) {
        toast.success("Thanks! We’ll contact you soon.", { position: "top-center" });
        setData({
          name: "", email: "", phone: "", city: "", state: "",
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
              <Input label="Email" type="email" name="email" value={data.email} onChange={onChange} required />
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
              <Input label="How did you hear about us?" name="howHeard" value={data.howHeard} onChange={onChange} />
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
  );
};

const Input = ({ label, ...props }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <input {...props} style={styles.input} />
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

const styles = {
  shell: { maxWidth: 960, margin: "30px auto", padding: "0 16px" },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 10px 28px rgba(17,35,56,.08)",
    padding: 20,
  },
  title: { margin: "4px 0 14px", fontSize: 26, fontWeight: 900, color: "#0f172a" },

  progressWrap: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16, alignItems: "center" },
  progressItem: { position: "relative", display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 10 },
  bar: { height: 4, width: "100%", borderRadius: 4 },

  form: { display: "grid", gap: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "grid", gap: 6 },
  labelText: { fontSize: 13, color: "#374151", fontWeight: 700 },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 15,
  },
  checkboxRow: { display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "#111827" },
  summary: {
    border: "1px dashed #d1d5db",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
    color: "#111827",
    fontSize: 14
  },

  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  btnPrimary: {
    background: "#2c4c97", color: "#fff", border: "none", padding: "10px 16px",
    borderRadius: 12, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 22px rgba(44,76,151,.25)"
  },
  btnSoft: {
    background: "rgba(44,76,151,.1)", color: "#0f172a", border: "1px solid rgba(44,76,151,.3)",
    padding: "10px 16px", borderRadius: 12, fontWeight: 900, cursor: "pointer"
  },
  btnGold: {
    background: "#d6a74b", color: "#0f172a", border: "none", padding: "10px 16px",
    borderRadius: 12, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 22px rgba(214,167,75,.25)"
  }
};

export default ContactUs;
