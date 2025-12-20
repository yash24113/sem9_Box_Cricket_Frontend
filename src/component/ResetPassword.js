
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = (
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/userapi"
).replace(/\/+$/, "");

/* ================= SVG ICONS ================= */
const EyeIcon = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.17-6.11" />
        <path d="M1 1l22 22" />
        <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-.97" />
        <path d="M14.47 14.47 9.53 9.53" />
        <path d="M6.11 6.11A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.87 5.68" />
    </svg>
);

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.error || data.message || "Failed to reset password.");
                setLoading(false);
                return;
            }

            toast.success("Password reset successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/signin");
            }, 3000);

        } catch (err) {
            console.error("Reset password error:", err);
            toast.error("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f4f4f4",
            }}
        >
            <div
                style={{
                    width: 400,
                    padding: 30,
                    backgroundColor: "white",
                    borderRadius: 10,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    textAlign: "center",
                }}
            >
                <h2 style={{ marginBottom: 20, color: "#333" }}>Reset Password</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            style={inputStyle}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            style={eyeStyle}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                    </div>

                    <div style={passwordWrapper}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            style={inputStyle}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span
                            style={eyeStyle}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
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
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
};

const inputStyle = {
    padding: 12,
    margin: "10px 0",
    borderRadius: 5,
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box", // Fixes padding expanding width
};

const buttonStyle = (bg) => ({
    backgroundColor: bg,
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: 5,
    marginTop: 15,
    fontSize: "16px",
    fontWeight: "bold",
});

const passwordWrapper = {
    position: "relative",
    width: "100%",
    marginBottom: 10,
};

const eyeStyle = {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#666",
    display: "flex",
    alignItems: "center",
};

export default ResetPassword;
