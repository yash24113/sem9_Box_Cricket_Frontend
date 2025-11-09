import React, { useEffect, useState } from "react";

const AdminFooter = () => {
  const [footerBgColor, setFooterBgColor] = useState(localStorage.getItem("adminFooterBgColor") || "#111827");
  const [textColor, setTextColor] = useState(localStorage.getItem("adminTextColor") || "#ffffff");
  const [fontSize, setFontSize] = useState(localStorage.getItem("adminFontSize") || "16");

  useEffect(() => {
    setFooterBgColor(localStorage.getItem("adminFooterBgColor") || "#111827");
    setTextColor(localStorage.getItem("adminTextColor") || "#ffffff");
    setFontSize(localStorage.getItem("adminFontSize") || "16");
  }, []);

  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        background: footerBgColor,
        color: textColor,
        borderTop: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 -6px 18px rgba(0,0,0,.12)",
        zIndex: 5
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
        <p style={{ margin: 0, fontSize: Number(fontSize), opacity: .95 }}>
          © {new Date().getFullYear()} Admin Panel — All Rights Reserved
        </p>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <a href="#top" style={{ color: textColor, textDecoration:"none", fontWeight:800, opacity:.95 }}>Back to top ↑</a>
          <span style={{ opacity:.7, fontSize:12 }}>v1.0</span>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
