import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import axios from "axios";
import { FaMapMarkerAlt, FaClock, FaComments, FaEnvelope, FaUserAlt, FaCalendarAlt } from "react-icons/fa";

const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:5000/api/userapi";

async function getScopedSummary(city) {
  const qs = city ? `?city=${encodeURIComponent(city)}` : "";
  const url = `${API_ROOT}/counts/summary${qs}`;
  try { const r = await axios.get(url); return r?.data?.data || {}; } catch { return {}; }
}

const Card = ({ icon, label, value, color = "#2c4c97", onClick, loading }) => (
  <div
    onClick={onClick}
    style={{
      borderRadius: 16, background: "#ffffff",
      border: "1px solid rgba(17,35,56,.08)", boxShadow: "0 10px 28px rgba(17,35,56,.10)",
      padding: 18, flex: "1 1 240px", minWidth: 240,
      cursor: onClick ? "pointer" : "default", transition: "transform .12s, box-shadow .25s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 18px 40px rgba(17,35,56,.16)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(17,35,56,.10)"; }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center",
        background: "rgba(44,76,151,.08)", border: "1px solid rgba(44,76,151,.16)", color }} >
        {icon}
      </div>
      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, background: "rgba(16,185,129,.12)",
        color: "#065f46", border: "1px solid rgba(16,185,129,.25)", userSelect: "none" }}>
        + live
      </span>
    </div>
    <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>
      {loading ? "…" : (value ?? 0)}
    </div>
  </div>
);

const AdminPanel = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loginBlob = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; }
  }, []);
  const user = loginBlob?.data || null;
  const role = (user?.role) || (user?.email === 'superadmin@gmail.com' ? 'superadmin' : 'user');
  const scopeCity = role === 'admin' ? (user?.city || '') : '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await getScopedSummary(scopeCity);
      setSummary(s);
      setLoading(false);
    })();
  }, [scopeCity]);

  const at = (ts) => new Date(ts).toLocaleString();

  const cardBgColor = localStorage.getItem("adminCardBgColor") || "#1f2937";
  const textColor = localStorage.getItem("adminTextColor") || "#ffffff";

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", background: "#f4f6f9" }}>
      <AdminHeader />
      <div style={{ display: "flex", flex: 1 }}>
        <AdminSidebar />
        <div style={{ flex: 1, padding: 20, overflowY: "auto", background: "#eef2f7" }}>
          <div style={{
            background: `linear-gradient(120deg, ${cardBgColor} 0%, #243b55 100%)`,
            color: textColor, borderRadius: 16, padding: 16,
            border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 10px 28px rgba(0,0,0,.18)", marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontWeight: 900 }}>
                  {role === 'superadmin' ? 'Superadmin' : 'Admin'} Dashboard
                </h2>
                <div style={{ opacity: 0.9, fontSize: 13 }}>
                  Last updated: {at(Date.now())}{scopeCity ? ` • Scope: ${scopeCity}` : ''}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
            {role === 'superadmin' && (
              <Card icon={<FaMapMarkerAlt />} label="Areas" value={summary.areas} loading={loading} onClick={() => navigate("/manageareas")} />
            )}
            <Card icon={<FaClock />} label="AreaWise Slots" value={summary.areaWiseSlots} loading={loading} onClick={() => navigate(role==='admin'?"/manageslots?scope=mine":"/manageslots")} />
            <Card icon={<FaComments />} label="Feedback" value={summary.feedback} loading={loading} onClick={() => navigate("/AdminViewFeedback")} />
            <Card icon={<FaEnvelope />} label="Franchise Leads" value={summary.contactus} loading={loading} onClick={() => navigate("/super/franchise")} />
            <Card icon={<FaCalendarAlt />} label="Booking" value={summary.booking} loading={loading} onClick={() => navigate(role==='admin'?"/AdminBookingData?scope=mine":"/AdminBookingData")} />
            <Card icon={<FaUserAlt />} label="Users" value={summary.users} loading={loading} onClick={() => navigate(role==='admin'?"/manageusers?scope=mine":"/manageusers")} />
          </div>

          <div style={{ marginTop: 16 }}>
            <Outlet />
          </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminPanel;
