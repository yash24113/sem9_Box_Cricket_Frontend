// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const fallbackAvatar =
  "https://ui-avatars.com/api/?name=User&background=random&bold=true";
const logoUrl =
  "https://png.pngtree.com/png-clipart/20240718/original/pngtree-cricket-logo-player-bat-boll-and-stump-png-image_15581859.png";

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); // controls dropdown/drawer
  const [isMobile, setIsMobile] = useState(false);

  const ref = useRef(null); // desktop dropdown anchor
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- auth bootstrap ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("loggedInUser");
      const parsed = raw ? JSON.parse(raw) : null;
      const u = parsed?.user || parsed?.data || parsed || null;
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  /* ---------- responsive watcher ---------- */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 860px)").matches);
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------- close on outside click / esc (desktop only) ---------- */
  useEffect(() => {
    const onClick = (e) => {
      if (!isMobile && ref.current && !ref.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMobile]);

  /* ---------- close drawer on route change ---------- */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  /* ---------- nav items ---------- */
  const menuLogged = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/arealist", label: "Area" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact Us" },
  ];
  const menuGuest = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/gallery", label: "Gallery" },
    { to: "/arealist", label: "Area" },
  ];
  const items = user ? menuLogged : menuGuest;

  /* ---------- actions ---------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  const imgSrc = user?.profile_image || fallbackAvatar;
  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <header className="header-shell">
      <style>{css}</style>

      {/* Left: Logo + Brand */}
      <Link to="/" className="brand" aria-label="Box Cricket Home">
        <img src={logoUrl} alt="Logo" className="brand-logo" />
        <span className="brand-name">Box Cricket</span>
      </Link>

      {/* Center: Nav (hidden on mobile) */}
      {!isMobile && (
        <nav className="nav-center">
          {items.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${isActive(to) ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}

      {/* Right: Toggle (Mobile) or Profile (Desktop) */}
      {isMobile ? (
        <button
          className="hamburger-btn"
          onClick={() => setOpen(true)}
          aria-label="Open Menu"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      ) : (
        <div ref={ref} className="profile-wrap">
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="profile menu"
            className="profile-btn"
          >
            <img
              src={imgSrc}
              onError={(e) => (e.currentTarget.src = fallbackAvatar)}
              alt="profile"
              className="avatar"
              width={36}
              height={36}
            />
            <span className="profile-name">
              {user
                ? `${user.fname || ""} ${user.lname || ""}`.trim()
                : "Guest User"}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="chev"
              aria-hidden
            >
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>

          {/* Desktop dropdown */}
          {open && (
            <div role="menu" className="dropdown">
              <div className="drop-head">
                <div className="drop-user">
                  <img
                    src={imgSrc}
                    onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                    alt="profile"
                    className="avatar big"
                  />
                  <div>
                    <div className="u-name">
                      {user
                        ? `${user.fname || ""} ${user.lname || ""}`.trim()
                        : "Guest"}
                    </div>
                    <div className="u-email">{user?.email || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="drop-actions">
                {user ? (
                  <>
                    <Link
                      to="/userbooking"
                      className="drop-item"
                      onClick={() => setOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      className="drop-item"
                      onClick={() => setOpen(false)}
                    >
                      My Account
                    </Link>
                    <button onClick={logout} className="drop-item danger">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/Signin"
                      className="drop-item primary"
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/Login"
                      className="drop-item"
                      onClick={() => setOpen(false)}
                    >
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile drawer (right side) */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={`drawer-backdrop ${open ? "show" : ""}`}
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
            <div className="drawer-head">
              <img
                src={imgSrc}
                onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                alt="profile"
                className="avatar big"
              />
              <div>
                <div className="u-name">
                  {user
                    ? `${user.fname || ""} ${user.lname || ""}`.trim()
                    : "Guest"}
                </div>
                <div className="u-email">{user?.email || "—"}</div>
              </div>
              <button
                className="drawer-close"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* Mobile nav list */}
            <nav className="drawer-nav">
              {items.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="drawer-link"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="drawer-divider" />

            {/* Actions */}
            <div className="drawer-actions">
              {user ? (
                <>
                  <Link
                    to="/userbooking"
                    className="drawer-link"
                    onClick={() => setOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/profile"
                    className="drawer-link"
                    onClick={() => setOpen(false)}
                  >
                    My Account
                  </Link>
                  <button className="drawer-link danger" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/Signin"
                    className="drawer-link primary"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/Register"
                    className="drawer-link"
                    onClick={() => setOpen(false)}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </header>
  );
}

/* ---------- styles ---------- */
const css = `
.header-shell {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #0b7a10;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* brand */
.brand{display:flex; align-items:center; gap:10px; text-decoration:none; color:#fff}
.brand-logo{width:34px; height:34px; object-fit:contain; filter: drop-shadow(0 2px 6px rgba(0,0,0,.2))}
.brand-name{font-weight:800; letter-spacing:.2px; font-size: clamp(16px, 2.2vw, 20px)}

/* center nav (hidden on mobile) */
.nav-center{display:flex; align-items:center; justify-content:center; gap:10px}
.nav-link{color:#eaffea; text-decoration:none; padding:8px 12px; border-radius:999px; font-weight:700; font-size:14px; opacity:.95; transition: background .2s, color .2s, transform .12s}
.nav-link:hover{text-decoration:none; background: rgba(255,255,255,.18); color:#fff; transform: translateY(-1px)}
.nav-link.active{background:#ffffff; color:#0b7a10}

/* profile */
.profile-wrap{position:relative}
.profile-btn{border:0; background:transparent; display:flex; align-items:center; gap:8px; cursor:pointer; color:#fff}
.avatar{border-radius:50%; object-fit:cover; border:2px solid #fff; width:36px; height:36px}
.avatar.big{width:44px; height:44px; border-width:3px}
.profile-name{font-weight:700;} 
.chev{opacity:.9}

/* hamburger */
.hamburger-btn {
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 8px;
}
.hamburger-btn:active {
  background: rgba(255,255,255,0.2);
}

/* desktop dropdown */
.dropdown{position:absolute; right:0; margin-top:8px; background:#fff; color:#222; border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,.2); min-width:260px; overflow:hidden; border:1px solid #e8e8e8}
.drop-head{padding:12px; border-bottom:1px solid #f0f0f0; background: linear-gradient(180deg,#ffffff,#f7fff7)}
.drop-user{display:flex; align-items:center; gap:10px}
.u-name{font-weight:800; font-size:14px; color:#0b7a10}
.u-email{font-size:12px; color:#666}
.drop-actions{display:flex; flex-direction:column; padding:6px}
.drop-item{display:block; padding:10px 12px; color:#222; text-decoration:none; background:#fff; border:0; cursor:pointer; font-weight:600; border-radius:8px; margin:2px 4px}
.drop-item:hover{background:#f3fff3}
.drop-item.primary{background:#0b7a10; color:#fff; text-align:center}
.drop-item.primary:hover{background:#0a6d0e}
.drop-item.danger, .drawer-link.danger{color:#b91c1c; text-align:left}

/* MOBILE drawer */
.drawer-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  opacity: 0; pointer-events: none; transition: opacity .25s ease; z-index: 99;
}
.drawer-backdrop.show{opacity:1; pointer-events:auto}

.drawer{
  position: fixed; top: 0; right: 0; height: 100%; width: 86%;
  max-width: 360px; background: #fff; color:#0b1224; z-index: 100;
  box-shadow: -10px 0 40px rgba(0,0,0,.25);
  transform: translateX(100%); transition: transform .28s cubic-bezier(.32,.72,.25,1);
  display:flex; flex-direction:column;
}
.drawer.open{transform: translateX(0)}

.drawer-head{
  display:flex; align-items:center; gap:10px; padding:14px;
  border-bottom:1px solid #efefef; background: linear-gradient(180deg,#ffffff,#f6fff6);
}
.drawer-close{
  margin-left:auto; font-size:28px; line-height:1; border:0; background:transparent; cursor:pointer; color:#0b7a10;
}
.drawer-nav, .drawer-actions{display:flex; flex-direction:column; padding:8px}
.drawer-link{
  display:block; padding:12px 14px; text-decoration:none; color:#1f2937; border-radius:10px; font-weight:700; margin:2px 6px;
}
.drawer-link:hover{background:#f3fff3}
.drawer-link.primary{background:#0b7a10; color:#fff; text-align:center}
.drawer-divider{height:1px; background:#eee; margin:6px 0}

/* responsive */
@media (max-width: 860px){
  .header-shell { display: flex; justify-content: space-between; gap: 8px; padding: 10px 14px; }
  .profile-name { display: none; }
  .nav-center { display: none; }
}
`;

