import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../assets/logo.png";
import "../Header.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [logoutModal, setLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const loggedInUser = localStorage.getItem("loggedInUser");
  const isAuthenticated = Boolean(token && loggedInUser);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    setSnackbar({ open: true, message: "Logged out successfully!", severity: "success" });
    setLogoutModal(false);
    setSidebarOpen(false);
    setTimeout(() => navigate("/Signin"), 1500);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        {/* Menu Button (Mobile View) */}
        <div className="menu-icon" onClick={toggleSidebar}>
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </div>

        {/* Desktop Nav */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>Home</Link>
          </li>
          <li>
            <Link to="/about" className={`nav-item ${isActive("/about") ? "active" : ""}`}>About</Link>
          </li>
          <li>
            <Link to="/gallery" className={`nav-item ${isActive("/gallery") ? "active" : ""}`}>Gallery</Link>
          </li>
          <li>
            <Link to="/arealist" className={`nav-item ${isActive("/arealist") ? "active" : ""}`}>Area</Link>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <Link to="/contact" className={`nav-item ${isActive("/contact") ? "active" : ""}`}>ContactUs</Link>
              </li>
              <li>
                <Link to="/feedback" className={`nav-item ${isActive("/feedback") ? "active" : ""}`}>Feedback</Link>
              </li>
              <li>
                <Link to="/userbooking" className={`nav-item ${isActive("/userbooking") ? "active" : ""}`}>MyBooking</Link>
              </li>
              <li>
                <Link to="/profile" className={`nav-item ${isActive("/profile") ? "active" : ""}`}>Profile</Link>
              </li>
            </>
          )}
        </ul>

        {/* Auth Buttons (Desktop) */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <button className="btn logout" onClick={() => setLogoutModal(true)}>Logout</button>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px" }}>
              <Link to="/Signin" className="btn login">Login</Link>
              <Link to="/Login" className="btn signup">Signup</Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar (Mobile View) */}
      <div className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <ul>
          <li><Link to="/" className={isActive("/") ? "active" : ""} onClick={toggleSidebar}>Home</Link></li>
          <li><Link to="/about" className={isActive("/about") ? "active" : ""} onClick={toggleSidebar}>About</Link></li>
          <li><Link to="/gallery" className={isActive("/gallery") ? "active" : ""} onClick={toggleSidebar}>Gallery</Link></li>
          <li><Link to="/arealist" className={isActive("/arealist") ? "active" : ""} onClick={toggleSidebar}>Area</Link></li>

          {isAuthenticated && (
            <>
              <li><Link to="/contact" className={isActive("/contact") ? "active" : ""} onClick={toggleSidebar}>ContactUs</Link></li>
              <li><Link to="/feedback" className={isActive("/feedback") ? "active" : ""} onClick={toggleSidebar}>Feedback</Link></li>
              <li><Link to="/userbooking" className={isActive("/userbooking") ? "active" : ""} onClick={toggleSidebar}>MyBooking</Link></li>
              <li><Link to="/profile" className={isActive("/profile") ? "active" : ""} onClick={toggleSidebar}>Profile</Link></li>
            </>
          )}

          <li className="sidebar-auth">
            {isAuthenticated ? (
              <button onClick={() => setLogoutModal(true)}>Logout</button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <Link to="/Signin" onClick={toggleSidebar}>Login</Link>
                <Link to="/Login" onClick={toggleSidebar}>Signup</Link>
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          textAlign: "center"
        }}>
          <h3>Are you sure you want to logout?</h3>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            <Button variant="contained" color="error" onClick={handleLogout}>Yes</Button>
            <Button variant="outlined" onClick={() => setLogoutModal(false)}>No</Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "300px", fontSize: "16px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </nav>
  );
};

export default Header;
