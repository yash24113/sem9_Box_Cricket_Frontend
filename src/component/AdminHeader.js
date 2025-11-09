import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const HEADER_HEIGHT = 84;

const AdminHeader = () => {
  const navigate = useNavigate();

  // ---------- State ----------
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Theme (from localStorage)
  const [headerBgColor, setHeaderBgColor] = useState(
    localStorage.getItem("adminHeaderBgColor") || "#1f2937"
  );
  const [textColor, setTextColor] = useState(
    localStorage.getItem("adminTextColor") || "#ffffff"
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("adminFontSize") || "16"
  );
  const [sidebarBgColor, setSidebarBgColor] = useState(
    localStorage.getItem("adminSidebarBgColor") || "#111827"
  );
  const [footerBgColor, setFooterBgColor] = useState(
    localStorage.getItem("adminFooterBgColor") || "#111827"
  );
  const [cardBgColor, setCardBgColor] = useState(
    localStorage.getItem("adminCardBgColor") || "#1f2937"
  );
  const [showCustomizer, setShowCustomizer] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const activityTimeout = useRef(null);

  // ---------- Auth / Initials ----------
  const adminUser =
    (function () {
      try {
        return (
          JSON.parse(localStorage.getItem("adminUser") || "null") ||
          JSON.parse(sessionStorage.getItem("loggedInUser") || "null") ||
          null
        );
      } catch {
        return null;
      }
    })() || {};

  const initials = useMemo(() => {
    const first = (adminUser?.fname || adminUser?.firstName || "")
      .trim()
      .charAt(0)
      .toUpperCase();
    const last = (adminUser?.lname || adminUser?.lastName || "")
      .trim()
      .charAt(0)
      .toUpperCase();
    const email = (adminUser?.email || "").trim().charAt(0).toUpperCase();
    return (first + last) || email || "AD";
  }, [adminUser]);

  // ---------- Activity glow ----------
  const resetActivityTimer = () => {
    setIsActive(true);
    if (activityTimeout.current) clearTimeout(activityTimeout.current);
    activityTimeout.current = setTimeout(() => setIsActive(false), 6000);
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    const onActivity = () => resetActivityTimer();
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setNotifOpen(false);
        setShowCustomizer(false);
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    ["mousemove", "keydown", "touchstart"].forEach((t) =>
      document.addEventListener(t, onActivity, { passive: true })
    );
    document.addEventListener("keydown", onEsc);
    resetActivityTimer();

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      ["mousemove", "keydown", "touchstart"].forEach((t) =>
        document.removeEventListener(t, onActivity)
      );
      document.removeEventListener("keydown", onEsc);
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
    };
  }, []);

  // ---------- Actions ----------
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setToastMessage("Logging out…");
    setShowToast(true);

    setTimeout(() => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      sessionStorage.removeItem("loggedInUser");
      setToastMessage("Logout successful!");
    }, 700);

    setTimeout(() => {
      setShowToast(false);
      navigate("/Signin");
    }, 1300);
  };

  const saveTheme = () => {
    localStorage.setItem("adminHeaderBgColor", headerBgColor);
    localStorage.setItem("adminSidebarBgColor", sidebarBgColor);
    localStorage.setItem("adminFooterBgColor", footerBgColor);
    localStorage.setItem("adminTextColor", textColor);
    localStorage.setItem("adminCardBgColor", cardBgColor);
    localStorage.setItem("adminFontSize", fontSize);
    setToastMessage("Theme saved!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1100);
  };

  const toggleSidebarGlobal = () => {
    window.dispatchEvent(new CustomEvent("admin:toggleSidebar"));
  };

  return (
    <div>
      {/* Scoped styles */}
      <style>{`
        :root{
          --ah-h: ${HEADER_HEIGHT}px;
          --ah-bg: ${headerBgColor};
          --ah-fg: ${textColor};
          --ah-fs: ${fontSize}px;
          --ah-primary:#2c4c97;
          --ah-gold:#d6a74b;
          --ah-muted: rgba(255,255,255,.65);
          --ah-ring: rgba(255,255,255,.18);
        }
        .ah-root{
          position: fixed; inset: 0 0 auto 0; height: var(--ah-h); z-index: 1000;
          background: var(--ah-bg); color: var(--ah-fg); font-size: var(--ah-fs);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 24px rgba(0,0,0,.18);
        }
        .ah-root:after{
          content:""; position:absolute; left:0; right:0; bottom:0; height:3px;
          background: linear-gradient(90deg,var(--ah-primary),var(--ah-gold),var(--ah-primary));
          opacity:.9;
        }
        .ah-wrap{
          max-width: 1280px; height: 100%;
          margin: 0 auto; padding: 0 16px; display:flex; align-items:center; gap: 12px;
        }

        /* Brand */
        .ah-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit; }
        .ah-logo{ height:42px; width:auto; display:block; border-radius:10px; background:#fff; padding:3px; }
        .ah-title{ font-weight:900; letter-spacing:.3px; margin:0; line-height:1 }

        /* Controls */
        .ah-actions{ display:flex; align-items:center; gap:10px; margin-left:auto; }
        .ah-iconbtn{
          position:relative; display:inline-flex; align-items:center; justify-content:center;
          height:40px; width:40px; border-radius:999px; border:1px solid var(--ah-ring);
          background: rgba(255,255,255,.10); color:var(--ah-fg); cursor:pointer;
          transition: transform .12s, background .2s, box-shadow .25s; backdrop-filter: blur(6px);
        }
        .ah-iconbtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.16); box-shadow: 0 10px 24px rgba(0,0,0,.25) }
        .ah-badge{
          position:absolute; top:-4px; right:-4px; min-width:18px; height:18px; padding:0 4px;
          border-radius:999px; background:#ef4444; color:#fff; font-size:11px; display:grid; place-items:center;
          border:2px solid var(--ah-bg);
        }
        .ah-active-dot{
          position:absolute; bottom:-2px; right:-2px; width:10px; height:10px; border-radius:999px;
          border:2px solid var(--ah-bg); background:${isActive ? "limegreen" : "gray"};
        }

        /* Dropdowns */
        .ah-pop{
          position:absolute; right:0; top: calc(100% + 10px);
          min-width: 230px; background:#fff; color:#0f172a; border-radius:12px;
          box-shadow: 0 18px 40px rgba(0,0,0,.2); border:1px solid rgba(0,0,0,.06); overflow:hidden;
          animation: ah-pop .15s ease both; z-index: 1100;
        }
        .ah-item{ padding: 10px 12px; cursor:pointer; transition: background .2s; display:flex; align-items:center; gap:10px }
        .ah-item:hover{ background:#f8fafc }
        .ah-sep{ height:1px; background: rgba(0,0,0,.06) }
        @keyframes ah-pop { from {transform: translateY(6px); opacity:0} to { transform: translateY(0); opacity:1 } }

        /* Avatar */
        .ah-avatar{
          position:relative; height:40px; width:40px; border-radius:999px;
          display:flex; align-items:center; justify-content:center; font-weight:900;
          background: linear-gradient(135deg,#2c4c97,#1e3a8a); color:#fff; border:1px solid var(--ah-ring);
          cursor:pointer; box-shadow: 0 10px 22px rgba(0,0,0,.25); transition: transform .12s, box-shadow .25s;
        }
        .ah-avatar:hover{ transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.28) }

        /* Search (optional – left as a hook for future) */
        .ah-search{
          display:none; align-items:center; gap:8px; max-width:560px; margin: 0 12px; flex:1;
          background: rgba(255,255,255,.10); border:1px solid var(--ah-ring);
          padding: 7px 10px; border-radius: 999px; backdrop-filter: blur(6px);
        }
        .ah-input{ outline:none; border:none; background:transparent; color:var(--ah-fg); width:100%; }
        .ah-searchbtn{ border:none; padding:8px 12px; border-radius:999px; cursor:pointer; color:#0f172a; background:var(--ah-gold); font-weight:800; }

        /* Customizer */
        .ah-cust{
          position: fixed; top:0; right:0; bottom:0; width: 360px;
          background:#ffffff; color:#0f172a; box-shadow: -10px 0 30px rgba(0,0,0,.25);
          transform: translateX(100%); transition: transform .25s ease; z-index: 1200; padding: 16px;
        }
        .ah-cust.open{ transform: translateX(0) }
        .ah-cust h3{ margin: 4px 0 6px }
        .ah-cust label{ display:block; font-size:12px; color:#6b7280; margin: 8px 0 4px }
        .ah-cust input[type="color"], .ah-cust input[type="text"], .ah-cust input[type="number"]{
          width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:8px; outline:none;
        }
        .ah-cust .row{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px }
        .ah-cust .btns{ display:flex; gap:10px; margin-top:12px }
        .ah-cust .btn{ flex:1; border:none; border-radius:10px; padding:10px; cursor:pointer; font-weight:800; }
        .ah-cust .btn.save{ background:var(--ah-primary); color:#fff }
        .ah-cust .btn.close{ background:#f3f4f6 }

        /* Toast */
        .ah-toast{
          position: fixed; top: 18px; right: 18px; background:#10b981; color:#fff;
          padding: 12px 16px; border-radius: 10px; box-shadow: 0 10px 24px rgba(0,0,0,.25); z-index: 2000; font-weight:800;
        }

        @media (min-width: 920px){
          .ah-search{ display:flex; }
        }
        @media (max-width: 720px){
          .ah-title{ display:none; }
          .ah-wrap{ padding: 0 12px; }
        }
      `}</style>

      {/* Fixed header */}
      <header className="ah-root" role="banner">
        <div className="ah-wrap">
          {/* Burger + Brand */}
          <button
            className="ah-iconbtn"
            onClick={toggleSidebarGlobal}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={textColor}>
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <Link to="/admin" className="ah-brand" aria-label="Admin home">
            <img src={logo} alt="Admin" className="ah-logo" />
            <h1 className="ah-title">Box Cricket Admin</h1>
          </Link>

          {/* Optional search (kept off on mobile; wire when needed) */}
          {/*
          <form
            className="ah-search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q") || "";
              navigate(`/admin/search?q=${encodeURIComponent(String(q))}`);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={textColor} style={{ opacity: .9 }}>
              <path d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/>
            </svg>
            <input className="ah-input" name="q" placeholder="Search users, areas, slots, bookings..." />
            <button className="ah-searchbtn" type="submit">Search</button>
          </form>
          */}

          {/* Right actions */}
          <div className="ah-actions">
            {/* Theme customizer */}
            <button
              className="ah-iconbtn"
              onClick={() => setShowCustomizer(true)}
              title="Theme"
              aria-label="Theme customizer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={textColor}>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                className="ah-iconbtn"
                onClick={() => setNotifOpen((v) => !v)}
                title="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={textColor}>
                  <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z"/>
                  <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2z"/>
                </svg>
                <span className="ah-badge">3</span>
              </button>
              {notifOpen && (
                <div className="ah-pop" role="menu" aria-label="Notifications">
                  <div className="ah-item"><b>New booking</b> · User #1042</div>
                  <div className="ah-item">Feedback received · Raj</div>
                  <div className="ah-item">Contact form · Meera</div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                className="ah-avatar"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                title="Account"
              >
                {initials}
                <span className="ah-active-dot" />
              </button>
              {dropdownOpen && (
                <div className="ah-pop" role="menu" aria-label="Account">
                  <div
                    className="ah-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/admin");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18Z" fill="#0f172a"/></svg>
                    Dashboard
                  </div>
                  <div
                    className="ah-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/admin/settings");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-9 4a9 9 0 1 0 18 0A9 9 0 0 0 3 12Z" fill="#0f172a"/></svg>
                    Settings
                  </div>
                  <div className="ah-sep" />
                  <div
                    className="ah-item"
                    style={{ color: "#b91c1c", fontWeight: 800 }}
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M16 17l5-5-5-5M21 12H9" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: HEADER_HEIGHT }} />

      {/* Theme Customizer */}
      <aside className={`ah-cust ${showCustomizer ? "open" : ""}`} aria-label="Theme customizer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3>Theme Customizer</h3>
          <button
            className="ah-iconbtn"
            onClick={() => setShowCustomizer(false)}
            title="Close"
            aria-label="Close customizer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0f172a">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label>Header Background</label>
        <input
          type="color"
          value={headerBgColor}
          onChange={(e) => setHeaderBgColor(e.target.value)}
        />

        <div className="row">
          <div>
            <label>Sidebar Background</label>
            <input
              type="color"
              value={sidebarBgColor}
              onChange={(e) => setSidebarBgColor(e.target.value)}
            />
          </div>
          <div>
            <label>Footer Background</label>
            <input
              type="color"
              value={footerBgColor}
              onChange={(e) => setFooterBgColor(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <div>
            <label>Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>
          <div>
            <label>Card Background</label>
            <input
              type="color"
              value={cardBgColor}
              onChange={(e) => setCardBgColor(e.target.value)}
            />
          </div>
        </div>

        <label>Base Font Size (px)</label>
        <input
          type="number"
          min="12"
          max="20"
          value={Number(fontSize)}
          onChange={(e) => setFontSize(e.target.value)}
        />

        <div className="btns">
          <button className="btn close" onClick={() => setShowCustomizer(false)}>
            Close
          </button>
          <button className="btn save" onClick={saveTheme}>
            Save
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 1500,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Logout confirmation"
        >
          <div
            style={{
              background: "#fff",
              color: "#0f172a",
              width: 340,
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 18px 40px rgba(0,0,0,.28)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Logout?</h3>
            <p style={{ marginTop: 4, color: "#4b5563" }}>
              You can sign in again anytime.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#f3f4f6",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && <div className="ah-toast">{toastMessage}</div>}
    </div>
  );
};

export default AdminHeader;
