// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const navigate = useNavigate();

  // rotating background
  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage((prev) => {
        const idx = imageList.indexOf(prev);
        return imageList[(idx + 1) % imageList.length];
      });
    }, 2000);
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

  return (
    <div
      className="background"
      style={{
        backgroundImage: `url(${bgImage})`,
        transition: "background-image 1s ease-in-out",
      }}
    >
      <div className="container">
        <h1 className="heading">Registration Form</h1>
        <div className="header1">
          <form
            onSubmit={handleSubmit}
            className="form"
            encType="multipart/form-data"
          >
            <input type="hidden" value={data.user_id} />

            <input
              type="text"
              placeholder="First Name"
              className="input"
              value={data.fname}
              onChange={(e) => setData({ ...data, fname: e.target.value })}
              autoFocus
            />
            {error.fname && (
              <span className="error-message">First name is required</span>
            )}

            <input
              type="text"
              placeholder="Last Name"
              className="input"
              value={data.lname}
              onChange={(e) => setData({ ...data, lname: e.target.value })}
            />
            {error.lname && (
              <span className="error-message">Last name is required</span>
            )}

            <input
              type="text"
              placeholder="Email"
              className="input"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
            {error.email && (
              <span className="error-message">Enter a valid email</span>
            )}

            <input
              type="text"
              placeholder="Mobile"
              className="input"
              value={data.mobile}
              onChange={(e) => setData({ ...data, mobile: e.target.value })}
            />
            {error.mobile && (
              <span className="error-message">
                Enter a valid 10-digit mobile number
              </span>
            )}

            <div className="gender-container">
              <label className="label">Gender:</label>
              <label>
                <input
                  type="radio"
                  value="Male"
                  checked={data.gender === "Male"}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                />{" "}
                Male
              </label>
              <label>
                <input
                  type="radio"
                  value="Female"
                  checked={data.gender === "Female"}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                />{" "}
                Female
              </label>
            </div>
            {error.gender && (
              <span className="error-message">Gender is required</span>
            )}

            <div className="city-container">
              <label className="label">City:</label>
              <select
                className="select"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              >
                <option value="">--- Select City ---</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Rajkot">Rajkot</option>
              </select>
            </div>
            {error.city && (
              <span className="error-message">City is required</span>
            )}

            <input
              type="password"
              placeholder="Password"
              className="input"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
            {error.password && (
              <span className="error-message">Password is required</span>
            )}

            <input
              type="password"
              placeholder="Confirm Password"
              className="input"
              value={data.cpassword}
              onChange={(e) => setData({ ...data, cpassword: e.target.value })}
            />
            {error.cpassword && (
              <span className="error-message">Passwords must match</span>
            )}

            <div className="file-upload">
              <label className="label">Upload Profile Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {error.profile_image && (
                <span className="error-message">Profile image is required</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success full-width-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="btn btn-danger full-width-button"
            >
              Reset
            </button>

            <p className="login-link">
              If you have an account, <Link to="/Signin">Login here</Link>
            </p>
          </form>
        </div>
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
