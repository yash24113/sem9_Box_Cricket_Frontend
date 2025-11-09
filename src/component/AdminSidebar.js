import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaUsers, FaMapMarkerAlt, FaClock, FaEnvelope,
  FaComments, FaCalendarAlt, FaCog, FaBars, FaChartLine, FaUserShield, FaSignOutAlt
} from "react-icons/fa";

const AdminSidebar = () => {
  const [sidebarBgColor, setSidebarBgColor] = useState(localStorage.getItem("adminSidebarBgColor") || "#111827");
  const [textColor, setTextColor] = useState(localStorage.getItem("adminTextColor") || "#ffffff");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [tooltip, setTooltip] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsCollapsed(window.innerWidth < 992);
    onResize(); window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fn = () => setIsCollapsed((p) => !p);
    window.addEventListener("admin:toggleSidebar", fn);
    return () => window.removeEventListener("admin:toggleSidebar", fn);
  }, []);

  useEffect(() => {
    const s = localStorage.getItem("adminSidebarBgColor"); if (s) setSidebarBgColor(s);
    const t = localStorage.getItem("adminTextColor"); if (t) setTextColor(t);
  }, []);

  const loginBlob = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; }
  }, []);
  const user = loginBlob?.data || null;
  const role = (user?.role) || (user?.email === 'superadmin@gmail.com' ? 'superadmin' : 'user');

  const initials = useMemo(() => {
    const f = (user?.fname || "").trim().charAt(0).toUpperCase();
    const l = (user?.lname || "").trim().charAt(0).toUpperCase();
    const e = (user?.email || "").trim().charAt(0).toUpperCase();
    return (f + l) || e || "AD";
  }, [user]);

  const navItemsSuper = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/manageareas", label: "Areas", icon: <FaMapMarkerAlt /> },
    { to: "/manageslots", label: "Slot", icon: <FaClock /> },
    { to: "/AdminBookingData", label: "Booking", icon: <FaCalendarAlt /> },
    { to: "/super/franchise", label: "GetFranchise Details", icon: <FaEnvelope /> }, // approval page
    { to: "/AdminViewFeedback", label: "Feedback", icon: <FaComments /> },
    { to: "/manageadmins", label: "Admin Details", icon: <FaUserShield /> },
    { to: "/manageusers", label: "Users", icon: <FaUsers /> },
    { to: "/admin/reports", label: "Reports", icon: <FaChartLine /> },
    { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
    { to: "/logout", label: "Logout", icon: <FaSignOutAlt />, isLogout: true },
  ];

  const navItemsAdmin = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/manageslots?scope=mine", label: "Slot", icon: <FaClock /> },
    { to: "/AdminBookingData?scope=mine", label: "Booking", icon: <FaCalendarAlt /> },
    { to: "/AdminViewFeedback", label: "Feedback", icon: <FaComments /> },
    { to: "/manageadmins/me", label: "Admin Details", icon: <FaUserShield /> },
    { to: "/manageusers?scope=mine", label: "Users", icon: <FaUsers /> },
    { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
    { to: "/logout", label: "Logout", icon: <FaSignOutAlt />, isLogout: true },
  ];

  const navItems = role === 'superadmin' ? navItemsSuper
                    : role === 'admin' ? navItemsAdmin
                    : [{ to: "/", label: "Home", icon: <FaTachometerAlt /> }];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    setShowLogoutModal(false);
    navigate("/Signin");
  };

  const handleNavItemClick = (item) => {
    if (item.isLogout) setShowLogoutModal(true);
  };

  const getLinkStyle = (isActive) => ({
    textDecoration: "none",
    color: isActive ? "lime" : textColor,
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "10px",
    fontWeight: isActive ? "800" : "600",
    border: isActive ? "1px solid rgba(255,255,255,.22)" : "1px solid transparent",
    background: isActive ? "rgba(255,255,255,.08)" : "transparent",
    transition: "transform .12s, background .2s, border-color .2s",
    transform: isActive ? "translateY(-1px)" : "none",
  });

  return (
    <div style={{
      position: "sticky",
      top: 92,
      height: "calc(100vh - 92px)",
      background: sidebarBgColor,
      color: textColor,
      width: isCollapsed ? 80 : 260,
      transition: "width .25s ease, background-color .25s ease",
      borderRight: "1px solid rgba(255,255,255,.06)",
      boxShadow: "inset -1px 0 0 rgba(255,255,255,.06)",
      display: "flex",
      flexDirection: "column",
      zIndex: 2
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between",
        padding: "12px 12px 6px", borderBottom: "1px dashed rgba(255,255,255,.12)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setIsCollapsed((s) => !s)}
            title="Collapse/Expand"
            style={{
              background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", color: textColor,
              borderRadius: 10, width: 38, height: 38, display: "grid", placeItems:"center", cursor:"pointer"
            }}
          >
            <FaBars />
          </button>
          {!isCollapsed && <strong style={{ letterSpacing: ".3px" }}>{role === 'superadmin' ? 'Superadmin' : 'Admin'}</strong>}
        </div>

        {!isCollapsed && (
          <div title="You">
            <div style={{
              width: 36, height: 36, borderRadius: 999, background:"linear-gradient(135deg,#2c4c97,#1e3a8a)",
              border:"1px solid rgba(255,255,255,.16)", display:"grid", placeItems:"center", fontWeight:900
            }}>
              {initials}
            </div>
          </div>
        )}
      </div>

      <ul style={{ listStyle:"none", margin: 8, padding: 0, display:"grid", gap: 8, overflowY:"auto" }}>
        {navItems.map((item, idx) => (
          <li key={idx} style={{ position:"relative" }}
              onMouseEnter={() => isCollapsed && setTooltip(item.label)}
              onMouseLeave={() => setTooltip("")}>
            {item.isLogout ? (
              <button
                onClick={() => handleNavItemClick(item)}
                style={{
                  ...getLinkStyle(false),
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: 18, marginRight: isCollapsed ? 0 : 10 }}>{item.icon}</span>
                {!isCollapsed && item.label}
              </button>
            ) : (
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  ...getLinkStyle(isActive),
                  justifyContent: isCollapsed ? "center" : "flex-start"
                })}
                end
              >
                <span style={{ fontSize: 18, marginRight: isCollapsed ? 0 : 10 }}>{item.icon}</span>
                {!isCollapsed && item.label}
              </NavLink>
            )}
            <span style={{
              position:"absolute", left:0, top:6, bottom:6, width: isCollapsed ? 0 : 3,
              background:"linear-gradient(180deg,#2c4c97,#d6a74b)"
            }}/>
          </li>
        ))}
      </ul>

      {tooltip && isCollapsed && (
        <div style={{
          position:"fixed", left: 80 + 10,
          top: "50%", transform:"translateY(-50%)",
          background:"#111827", color:"#fff", padding:"6px 10px",
          borderRadius:8, border:"1px solid rgba(255,255,255,.12)", boxShadow:"0 10px 24px rgba(0,0,0,.3)",
          pointerEvents:"none", fontSize: 12
        }}>
          {tooltip}
        </div>
      )}

      {showLogoutModal && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"grid", placeItems:"center", zIndex: 1500
        }}>
          <div style={{ background:"#fff", color:"#0f172a", width:320, borderRadius:14, padding:18, boxShadow:"0 18px 40px rgba(0,0,0,.28)" }}>
            <h3 style={{ marginTop:0 }}>Confirm Logout</h3>
            <p style={{ marginTop:4, color:"#4b5563" }}>Are you sure you want to sign out?</p>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <button onClick={handleLogout} style={{ flex:1, padding:"10px 12px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:800, cursor:"pointer" }}>Logout</button>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex:1, padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb", background:"#f3f4f6", cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
