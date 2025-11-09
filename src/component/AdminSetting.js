import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminSetting = () => {
  const navigate = useNavigate();

  const [headerBgColor, setHeaderBgColor] = useState(localStorage.getItem("adminHeaderBgColor") || "#2980b9");
  const [sidebarBgColor, setSidebarBgColor] = useState(localStorage.getItem("adminSidebarBgColor") || "#2c3e50");
  const [footerBgColor, setFooterBgColor] = useState(localStorage.getItem("adminFooterBgColor") || "#2c3e50");
  const [textColor, setTextColor] = useState(localStorage.getItem("adminTextColor") || "#ffffff");
  const [fontSize, setFontSize] = useState(localStorage.getItem("adminFontSize") || "16");
  const [cardBgColor, setCardBgColor] = useState(localStorage.getItem("adminCardBgColor") || "#2980b9");

  const [showToast, setShowToast] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "save" or "reset"

  const handleSave = () => {
    localStorage.setItem("adminHeaderBgColor", headerBgColor);
    localStorage.setItem("adminSidebarBgColor", sidebarBgColor);
    localStorage.setItem("adminFooterBgColor", footerBgColor);
    localStorage.setItem("adminTextColor", textColor);
    localStorage.setItem("adminFontSize", fontSize);
    localStorage.setItem("adminCardBgColor", cardBgColor);

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/admin");
    }, 1500);
  };

  const handleReset = () => {
    setHeaderBgColor("#2980b9");
    setSidebarBgColor("#2c3e50");
    setFooterBgColor("#2c3e50");
    setTextColor("#ffffff");
    setFontSize("16");
    setCardBgColor("#2980b9");

    localStorage.removeItem("adminHeaderBgColor");
    localStorage.removeItem("adminSidebarBgColor");
    localStorage.removeItem("adminFooterBgColor");
    localStorage.removeItem("adminTextColor");
    localStorage.removeItem("adminFontSize");
    localStorage.removeItem("adminCardBgColor");

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/admin");
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  const handleConfirmAction = () => {
    if (actionType === "save") {
      handleSave();
    } else if (actionType === "reset") {
      handleReset();
    }
    setShowConfirmationModal(false);
  };

  const showConfirmation = (action) => {
    setActionType(action);
    setShowConfirmationModal(true);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "30px", color: "#2c3e50" }}>Admin Panel Settings</h2>

      <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <h3 style={{ marginBottom: "20px", color: "#2980b9" }}>Layout Customization</h3>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Header Background Color:</label>
          <input
            type="color"
            value={headerBgColor}
            onChange={(e) => setHeaderBgColor(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "5px", width: "100px", cursor: "pointer" }}
          />
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>Current: {headerBgColor}</div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Sidebar Background Color:</label>
          <input
            type="color"
            value={sidebarBgColor}
            onChange={(e) => setSidebarBgColor(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "5px", width: "100px", cursor: "pointer" }}
          />
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>Current: {sidebarBgColor}</div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Footer Background Color:</label>
          <input
            type="color"
            value={footerBgColor}
            onChange={(e) => setFooterBgColor(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "5px", width: "100px", cursor: "pointer" }}
          />
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>Current: {footerBgColor}</div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Text Color:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "5px", width: "100px", cursor: "pointer" }}
          />
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>Current: {textColor}</div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Font Size:</label>
          <input
            type="number"
            min="10"
            max="40"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              width: "100px",
              cursor: "pointer",
              textAlign: "center",
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Card Background Color:</label>
          <input
            type="color"
            value={cardBgColor}
            onChange={(e) => setCardBgColor(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "5px", width: "100px", cursor: "pointer" }}
          />
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>Current: {cardBgColor}</div>
        </div>
      </div>

      {/* Buttons Section */}
      <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
        <button
          onClick={() => showConfirmation("save")}
          style={{
            padding: "12px 25px",
            backgroundColor: "#2980b9",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#21618c")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#2980b9")}
        >
          Save Settings
        </button>
        <button
          onClick={() => showConfirmation("reset")}
          style={{
            padding: "12px 25px",
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#c0392b")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#e74c3c")}
        >
          Reset Settings
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: "12px 25px",
            backgroundColor: "#f39c12",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#e67e22")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#f39c12")}
        >
          Cancel
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={toastStyles}>
          Settings saved successfully!
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div style={modalStyles}>
          <div style={modalContentStyles}>
            <h3>Are you sure you want to {actionType} the settings?</h3>
            <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
              <button
                onClick={handleConfirmAction}
                style={{
                  padding: "12px 25px",
                  backgroundColor: "#2980b9",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                style={{
                  padding: "12px 25px",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const toastStyles = {
  position: "fixed",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#2ecc71",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "5px",
  fontSize: "16px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
};

const modalStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContentStyles = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "8px",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

export default AdminSetting;
