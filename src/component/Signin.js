import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const images = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMq6U5EUHZr6Dy_4nmpIWBknpRzvf42EslWw&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbHstjLyNrHN-V5p0Y4cBd1ZJ2IL8ZFROqg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt2EK25rS3OBiiOSU6mVx1pop8rPjdzhCp8Q&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcJkoEZ4a4N0ama1MOP00LTq8LoX6HOS-a8FxmBZcqfANKYUhVhpD-5asjH_uaF_X_33s&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxiLr7LWyZTLleBP8PuCkLFyJQTNPiYkKR4A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqUPdsd7iqcrGl2QBwTiauJT2zJlgsS9dTmQ&s",
];

// Must match how you mount in backend: app.use('/api/userapi', route)
const API_BASE = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/userapi"
).replace(/\/+$/, "");

const Signin = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [mathChallenge, setMathChallenge] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [mathVerified, setMathVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mathLoading, setMathLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [showMathModal, setShowMathModal] = useState(false);


  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(
      () => setBgIndex((i) => (i + 1) % images.length),
      3000
    );
    return () => clearInterval(interval);
  }, []);

  // Generate simple math challenge
  const generateMathChallenge = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let answer;
    const expression = `${num1} ${op} ${num2}`;

    switch (op) {
      case "+":
        answer = (num1 + num2).toString();
        break;
      case "-":
        answer = (num1 - num2).toString();
        break;
      case "*":
        answer = (num1 * num2).toString();
        break;
      default:
        answer = "0";
    }

    setMathChallenge(expression);
    setCorrectAnswer(answer);
  };

  // Call backend login
  const proceedLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || data.message || "Invalid email or password!");
        setLoading(false);
        return;
      }

      const { token, user, role, redirectTo } = data;

      if (!token || !user) {
        toast.error("Invalid response from server.");
        setLoading(false);
        return;
      }

      // Save auth
      localStorage.setItem("token", token);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (role && role !== "user") {
        localStorage.setItem("adminUser", JSON.stringify(user));
      }

      toast.success("Login successful!");

      // Backend decides; fallback via role
      const nextPath =
        redirectTo ||
        (role === "superadmin" || role === "admin" ? "/admin" : "/profile");

      setTimeout(() => {
        setLoading(false);
        navigate(nextPath);
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

  // Math modal submit
  const handleMathSubmit = () => {
    setMathLoading(true);
    setTimeout(() => {
      if (userAnswer.trim() === correctAnswer) {
        setMathVerified(true);
        toast.success("Math answer correct!");
        setShowMathModal(false);
        proceedLogin();
      } else {
        toast.error("Incorrect answer! Try again.");
        generateMathChallenge();
        setUserAnswer("");
      }
      setMathLoading(false);
    }, 800);
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("All fields are required!");
      return;
    }

    if (!mathVerified) {
      generateMathChallenge();
      setShowMathModal(true);
      return;
    }

    proceedLogin();

  };

  // Forgot Password Submit
  const handleForgotSubmit = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your email!");
      return;
    }
    setForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || data.message || "Failed to send reset link.");
      } else {
        toast.success("Reset link sent! Check your email.");
        setShowForgotModal(false);
        setForgotEmail("");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${images[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background 1s ease-in-out",
      }}
    >
      <div style={loginBoxStyle}>
        <h1 style={{ marginBottom: 20, color: "#333" }}>Login</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <input
            type="email"
            placeholder="Email"
            style={inputStyle}
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            autoFocus
          />
          <div style={{ position: "relative", width: "100%", margin: "10px 0" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={{ ...inputStyle, margin: 0 }} // Remove wrapper margin from input
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#777",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div style={{ textAlign: "center", marginTop: "-5px", marginBottom: "5px" }}>
            <span
              onClick={() => setShowForgotModal(true)}
              style={{
                color: "#007bff",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              Forgot Password?
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle(loading ? "#6c757d" : "#28a745"),
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p style={{ marginTop: 10 }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/Login"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Signup here
            </Link>
          </p>
        </form>
      </div>

      {showMathModal && (
        <div style={modalBackdrop}>
          <div style={modalContent}>
            <h3>Math Verification</h3>
            <p>
              <strong>Solve:</strong> {mathChallenge}
            </p>
            <input
              type="text"
              placeholder="Your answer"
              style={inputStyle}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              autoFocus
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleMathSubmit}
                disabled={mathLoading}
                style={buttonStyle("#007bff")}
              >
                {mathLoading ? "Verifying..." : "Submit"}
              </button>
              <button
                onClick={() => {
                  generateMathChallenge();
                  setUserAnswer("");
                }}
                style={buttonStyle("#ffc107")}
              >
                Regenerate
              </button>
              <button
                onClick={() => setShowMathModal(false)}
                style={buttonStyle("#dc3545")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div style={modalBackdrop}>
          <div style={modalContent}>
            <h3>Forgot Password</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Enter your email to receive a reset link.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              style={inputStyle}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={handleForgotSubmit}
                disabled={forgotLoading}
                style={buttonStyle("#007bff")}
              >
                {forgotLoading ? "Sending..." : "Send Link"}
              </button>
              <button
                onClick={() => setShowForgotModal(false)}
                style={buttonStyle("#dc3545")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

const loginBoxStyle = {
  width: 400,
  padding: 20,
  background: "rgba(255, 255, 255, 0.85)",
  borderRadius: 10,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
};

const inputStyle = {
  padding: 10,
  margin: "10px 0",
  borderRadius: 5,
  border: "1px solid #ccc",
  width: "100%",
};

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  padding: "10px 15px",
  border: "none",
  borderRadius: 5,
  marginTop: 10,
});

const modalBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 10,
  width: 300,
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

export default Signin;
