// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Login.css";

const imageList = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMq6U5EUHZr6Dy_4nmpIWBknpRzvf42EslWw&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbHstjLyNrHN-V5p0Y4cBd1ZJ2IL8ZFROqg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt2EK25rS3OBiiOSU6mVx1pop8rPjdzhCp8Q&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcJkoEZ4a4N0ama1MOP00LTq8LoX6HOS-a8FxmBZcqfANKYUhVhpD-5asjH_uaF_X_33s&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxiLr7LWyZTLleBP8PuCkLFyJQTNPiYkKR4A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqUPdsd7iqcrGl2QBwTiauJT2zJlgsS9dTmQ&s",
];

const API_BASE =
  process.env.REACT_APP_API_BASE_URL_REG?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

const generateUserId = () => "user_" + Date.now();

const Login = () => {
  const [data, setData] = useState({
    user_id: generateUserId(),
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    gender: "",
    city: "",
    state: "",
    address: "",
    password: "",
    cpassword: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState({});
  const [bgImage, setBgImage] = useState(imageList[0]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Toggles for password visibility
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);

  const navigate = useNavigate();

  // rotating background
  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage((prev) => {
        const idx = imageList.indexOf(prev);
        return imageList[(idx + 1) % imageList.length];
      });
    }, 4000); // slower rotation
    return () => clearInterval(interval);
  }, []);

  // OTP countdown
  useEffect(() => {
    if (!showOtpModal || timer <= 0) return;
    const t = setTimeout(() => {
      setTimer((prev) => prev - 1);
      if (timer <= 1) setResendDisabled(false);
    }, 1000);
    return () => clearTimeout(t);
  }, [showOtpModal, timer]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (value) => /^[0-9]{10}$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newError = {
      fname: !data.fname,
      lname: !data.lname,
      email: !validateEmail(data.email),
      mobile: !validateMobile(data.mobile),
      gender: !data.gender,
      city: !data.city,
      password: !data.password,
      cpassword: !data.cpassword || data.password !== data.cpassword,
      profile_image: !imageFile,
    };
    setError(newError);
    if (Object.values(newError).some(Boolean)) {
      toast.error("Please fill all fields correctly!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    formData.append("profile_image", imageFile);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        body: formData, // let browser set multipart boundary
      });
      const result = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success("OTP sent to your email!", {
          position: "top-center",
          autoClose: 2000,
        });
        setShowOtpModal(true);
        setTimer(30);
        setResendDisabled(true);
      } else {
        toast.error(result.error || result.message || "Registration failed!", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch {
      setLoading(false);
      toast.error("Server error. Please try again!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const resetForm = () => {
    setData({
      user_id: generateUserId(),
      fname: "",
      lname: "",
      email: "",
      mobile: "",
      gender: "",
      city: "",
      state: "",
      address: "",
      password: "",
      cpassword: "",
    });
    setImageFile(null);
    setError({});
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value !== "" && index < 5) {
      const el = document.getElementById(`otp-${index + 1}`);
      if (el) el.focus();
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Enter full 6-digit OTP", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, otp: enteredOtp }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("OTP Verified! Registration complete.", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/Signin"), 2000);
        resetForm();
        setShowOtpModal(false);
      } else {
        toast.error(result.error || result.message || "Invalid OTP", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch {
      toast.error("OTP verification failed", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const resendOTP = async () => {
    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("OTP resent successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimer(30);
        setResendDisabled(true);
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(result.error || result.message || "Failed to resend OTP", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch {
      toast.error("Error resending OTP", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp(["", "", "", "", "", ""]);
  };

  // --- STYLES ---
  // Using React inline styles for layout to avoid messy CSS overwrites,
  // while keeping existing classes for basic look & theme.


  const singleColStyle = {
    width: "100%",
    marginBottom: "8px",
  };

  const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    position: "relative",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "4px",
    marginLeft: "2px",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  };

  const errorStyle = {
    color: "red",
    fontSize: "11px",
    marginTop: "2px",
    marginLeft: "2px",
  };

  const bgStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-image 1s ease-in-out",
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "20px 30px",
    width: "90%",
    maxWidth: "480px", // slightly wider for 2-col
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    maxHeight: "95vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div style={bgStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: "15px", color: "#333", fontSize: "24px" }}>
          Registration
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%" }}
          encType="multipart/form-data"
        >
          {/* Row 1: First Name & Last Name */}
          <div className="form-row">
            <div style={inputGroupStyle}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: error.fname ? "red" : "#ccc" }}
                value={data.fname}
                onChange={(e) => setData({ ...data, fname: e.target.value })}
                placeholder="Ex. John"
              />
              {error.fname && <span style={errorStyle}>Required</span>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: error.lname ? "red" : "#ccc" }}
                value={data.lname}
                onChange={(e) => setData({ ...data, lname: e.target.value })}
                placeholder="Ex. Doe"
              />
              {error.lname && <span style={errorStyle}>Required</span>}
            </div>
          </div>

          {/* Row 2: Email & Mobile */}
          <div className="form-row">
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                style={{ ...inputStyle, borderColor: error.email ? "red" : "#ccc" }}
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="john@example.com"
              />
              {error.email && <span style={errorStyle}>Invalid Email</span>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Mobile Number</label>
              <input
                type="text"
                maxLength={10}
                style={{ ...inputStyle, borderColor: error.mobile ? "red" : "#ccc" }}
                value={data.mobile}
                onChange={(e) => setData({ ...data, mobile: e.target.value })}
                placeholder="9876543210"
              />
              {error.mobile && <span style={errorStyle}>Invalid Mobile</span>}
            </div>
          </div>

          {/* Row 3: Gender & City */}
          <div className="form-row">
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Gender</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                <label style={{ fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    value="Male"
                    checked={data.gender === "Male"}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                  />{" "}
                  Male
                </label>
                <label style={{ fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    value="Female"
                    checked={data.gender === "Female"}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                  />{" "}
                  Female
                </label>
              </div>
              {error.gender && <span style={errorStyle}>Required</span>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>City</label>
              <select
                style={{ ...inputStyle, cursor: "pointer", borderColor: error.city ? "red" : "#ccc" }}
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              >
                <option value="">Select City</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Rajkot">Rajkot</option>
              </select>
              {error.city && <span style={errorStyle}>Required</span>}
            </div>
          </div>

          {/* Row 4: Passwords */}
          <div className="form-row">
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPass ? "text" : "password"}
                  style={{ ...inputStyle, borderColor: error.password ? "red" : "#ccc" }}
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  placeholder="******"
                />
                <span
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {error.password && <span style={errorStyle}>Required</span>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showCPass ? "text" : "password"}
                  style={{ ...inputStyle, borderColor: error.cpassword ? "red" : "#ccc" }}
                  value={data.cpassword}
                  onChange={(e) => setData({ ...data, cpassword: e.target.value })}
                  placeholder="******"
                />
                <span
                  onClick={() => setShowCPass(!showCPass)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  {showCPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {error.cpassword && <span style={errorStyle}>Must match</span>}
            </div>
          </div>

          {/* Row 5: Profile Image */}
          <div style={singleColStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ fontSize: "13px" }}
              />
              {error.profile_image && <span style={errorStyle}>Required</span>}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? "#6c757d" : "#28a745",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Submitting..." : "Register"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                flex: 1,
                backgroundColor: "#dc3545",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Reset
            </button>
          </div>

          <p style={{ marginTop: "15px", fontSize: "14px", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/Signin" style={{ color: "#007bff", textDecoration: "none", fontWeight: "600" }}>
              Login here
            </Link>
          </p>
        </form>
      </div>

      {showOtpModal && (
        <div className="otp-modal">
          <div className="otp-content">
            <button className="close-btn" onClick={closeOtpModal}>
              ×
            </button>
            <h2>Enter OTP</h2>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <p className="otp-timer">Expires in: {timer}s</p>
            <div className="otp-actions-grid">
              <button onClick={verifyOtp} className="btn btn-primary">
                Verify OTP
              </button>
              {resendDisabled ? (
                <span className="resend-timer">Resend OTP in {timer}s</span>
              ) : (
                <button onClick={resendOTP} className="resend-btn">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Login;
