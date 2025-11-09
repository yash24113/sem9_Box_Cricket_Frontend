import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setBgIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const generateMathChallenge = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const expression = `${num1} ${op} ${num2}`;
    const answer = eval(expression).toString();
    setMathChallenge(expression);
    setCorrectAnswer(answer);
  };

  const proceedLogin = async () => {
    setLoading(true);
    try {
      const base = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/userapi";
      const response = await fetch(`${base}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (response.ok) {
        const user = data?.data;
        const role = (user?.role) || (user?.email === 'superadmin@gmail.com' ? 'superadmin' : 'user');

        localStorage.setItem("token", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data));
        if (role !== 'user') localStorage.setItem("adminUser", JSON.stringify(user)); // header initials

        toast.success("Login successful!");

        setTimeout(() => {
          if (role === 'superadmin') navigate("/admin"); // same panel; menu differs
          else if (role === 'admin') navigate("/admin");
          else navigate("/");
        }, 800);
      } else {
        toast.error(data.error || data.message || "Invalid email or password!");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) { toast.error("All fields are required!"); return; }
    if (!mathVerified) { generateMathChallenge(); setShowMathModal(true); return; }
    proceedLogin();
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", backgroundImage: `url(${images[bgIndex]})`,
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", justifyContent: "center", alignItems: "center",
      transition: "background 1s ease-in-out",
    }}>
      <div style={loginBoxStyle}>
        <h1 style={{ marginBottom: 20, color: "#333" }}>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <input type="email" placeholder="Email" style={inputStyle}
                 onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} value={loginData.email} autoFocus />
          <input type="password" placeholder="Password" style={inputStyle}
                 onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} value={loginData.password} />
          <button type="submit" disabled={loading}
                  style={{ ...buttonStyle(loading ? "#6c757d" : "#28a745"), cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p style={{ marginTop: 10 }}>
            Don't have an account? <Link to="/Login" style={{ color: "#007bff", textDecoration: "none" }}>Signup here</Link>
          </p>
        </form>
      </div>

      {showMathModal && (
        <div style={modalBackdrop}>
          <div style={modalContent}>
            <h3>Math Verification</h3>
            <p><strong>Solve:</strong> {mathChallenge}</p>
            <input type="text" placeholder="Your answer" style={inputStyle}
                   onChange={(e) => setUserAnswer(e.target.value)} value={userAnswer} autoFocus />
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={handleMathSubmit} disabled={mathLoading} style={buttonStyle("#007bff")}>
                {mathLoading ? "Verifying..." : "Submit"}
              </button>
              <button onClick={() => { generateMathChallenge(); setUserAnswer(""); }} style={buttonStyle("#ffc107")}>Regenerate</button>
              <button onClick={() => setShowMathModal(false)} style={buttonStyle("#dc3545")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

const loginBoxStyle = {
  width: 400, padding: 20, background: "rgba(255, 255, 255, 0.85)",
  borderRadius: 10, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", textAlign: "center",
};
const inputStyle = { padding: 10, margin: "10px 0", borderRadius: 5, border: "1px solid #ccc", width: "100%" };
const buttonStyle = (bg) => ({ backgroundColor: bg, color: "white", padding: "10px 15px", border: "none", borderRadius: 5, marginTop: 10 });
const modalBackdrop = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContent = { backgroundColor: "white", padding: 20, borderRadius: 10, width: 300, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };

export default Signin;
