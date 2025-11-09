import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); // object URL for preview
  const [errors, setErrors] = useState({});

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed?.data || null);
        setUpdatedProfile(parsed?.data || {});
      } catch {
        // corrupted storage; force logout
        localStorage.removeItem("loggedInUser");
      }
    }
  }, []);

  // Preview URL cleanup
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Simple reveal-on-scroll
  useEffect(() => {
    const onScroll = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add("in");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Basic client-side validation
  const validate = (data) => {
    const e = {};
    if (!data.fname) e.fname = "First name is required";
    if (!data.lname) e.lname = "Last name is required";
    if (data.mobile && !/^[0-9+\-\s]{7,15}$/.test(data.mobile)) e.mobile = "Enter a valid phone number";
    return e;
    // (Email is disabled from edits; token/email handled elsewhere.)
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("loggedInUser");
      navigate("/Signin");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      alert("Please upload a PNG, JPG or WEBP image.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Image too large. Max 3MB.");
      return;
    }
    setImageFile(file);
  };

  const handleUpdateProfile = () => {
    const next = { ...updatedProfile };
    // image logic
    if (imageFile) {
      // Use preview object URL for immediate UX; normally upload to server & save returned URL
      next.profile_image = imagePreview;
    } else if (next.profile_image && !/^https?:\/\//i.test(next.profile_image)) {
      next.profile_image = `http://localhost:5000/${String(next.profile_image).replace(/^\/+/, "")}`;
    }

    const v = validate(next);
    setErrors(v);
    if (Object.keys(v).length) {
      const first = Object.values(v)[0];
      if (first) alert(first);
      return;
    }

    const updatedUser = { ...currentUser, ...next };
    const prev = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const fullData = {
      success: prev?.success || "Login Successful",
      data: updatedUser,
      token: prev?.token || "",
    };

    localStorage.setItem("loggedInUser", JSON.stringify(fullData));
    setCurrentUser(updatedUser);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const hasChanges = useMemo(() => {
    if (!currentUser) return false;
    const keys = ["fname", "lname", "mobile", "gender", "city", "profile_image"];
    for (const k of keys) {
      if ((updatedProfile?.[k] || "") !== (currentUser?.[k] || "")) return true;
    }
    if (imageFile) return true;
    return false;
  }, [currentUser, updatedProfile, imageFile]);

  if (!currentUser) {
    return (
      <div className="pf-wrap" style={{ padding: "48px 16px" }}>
        <div className="pf-card reveal" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: 0, color: "#334155" }}>Please log in to view your profile.</h2>
          <p style={{ color: "#64748b" }}>You’ll be redirected to sign in.</p>
          <button className="pf-btn pf-btn-primary" onClick={() => navigate("/Signin")}>Go to Sign in</button>
        </div>
      </div>
    );
  }

  const initials =
    (currentUser.fname?.[0] || "").toUpperCase() + (currentUser.lname?.[0] || "").toUpperCase();

  return (
    <div className="pf-wrap">
      {/* Styles */}
      <style>{`
        :root{
          --bg:#0f172a; --card:#0b1224; --text:#0e1a2b; --muted:#64748b;
          --brand:#2c4c97; --gold:#d6a74b; --surface:#ffffff;
          --radius:16px; --shadow:0 12px 30px rgba(0,0,0,.10);
          --shadow-2:0 20px 50px rgba(17,35,56,.18);
          --max:960px;
        }
        *{box-sizing:border-box}
        body{margin:0}
        .pf-wrap{max-width:var(--max);margin:0 auto;padding:22px 16px}
        .pf-header{
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          margin: 10px 0 18px 0;
        }
        .pf-title{margin:0; font-size: clamp(20px, 3vw, 28px); color:#0e1a2b}
        .pf-actions{display:flex; gap:10px; flex-wrap:wrap}
        .pf-btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:999px;border:1px solid rgba(17,35,56,.12);background:#fff;color:#0f172a;font-weight:700;cursor:pointer;transition:transform .15s, box-shadow .3s}
        .pf-btn:hover{transform:translateY(-1px)}
        .pf-btn-primary{background:var(--brand); color:#fff; border-color:transparent; box-shadow:0 8px 20px rgba(44,76,151,.35)}
        .pf-btn-danger{background:#ef4444;color:#fff;border-color:transparent}
        .pf-btn-ghost{background:#fff}
        .pf-chip{
          display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;
          background:rgba(44,76,151,.06); border:1px solid rgba(44,76,151,.18); color:#1d2a44; font-weight:800
        }

        .pf-card{
          background: linear-gradient(180deg,#ffffff,#f8fafc);
          border:1px solid rgba(17,35,56,.08); border-radius:24px; padding:18px; box-shadow:var(--shadow);
          animation: pop .25s ease both;
        }

        .pf-row{display:grid; grid-template-columns: 140px 1fr; gap:16px; align-items:start}
        @media (max-width: 640px){ .pf-row{ grid-template-columns: 1fr; } }

        .pf-avatar{
          display:grid; place-items:center; gap:10px;
        }
        .pf-img{
          width:120px; height:120px; border-radius:50%; object-fit:cover; background:#fff; border:1px solid rgba(0,0,0,.06);
          box-shadow: var(--shadow);
          animation: rise .45s ease both;
        }
        .pf-initials{
          width:120px; height:120px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(135deg, #2c4c97, #1e3a8a);
          color:#fff; font-size: 42px; font-weight:900; letter-spacing: .5px;
          box-shadow: var(--shadow);
          animation: rise .45s ease both;
        }

        .pf-body{width:100%}
        .pf-section{background:#fff; border:1px solid rgba(17,35,56,.08); border-radius:16px; padding:14px; margin-bottom:12px}
        .pf-section h3{margin:0 0 8px; color:#0e1a2b; font-size:18px}
        .pf-grid{display:grid; grid-template-columns: repeat(2,1fr); gap:12px}
        @media (max-width: 640px){ .pf-grid{ grid-template-columns: 1fr; } }

        .pf-field label{display:block; font-size:12px; color:#64748b; margin-bottom:6px}
        .pf-input, .pf-select, .pf-textarea{
          width:100%; padding:12px 14px; border-radius:12px; border:1px solid rgba(17,35,56,.12);
          background:#fff; outline:none; font-size:14px;
          transition: border-color .2s, box-shadow .2s, transform .06s;
        }
        .pf-input:focus, .pf-select:focus, .pf-textarea:focus{
          border-color: var(--brand); box-shadow: 0 0 0 4px rgba(44,76,151,.12);
        }
        .pf-input[disabled], .pf-select[disabled], .pf-textarea[disabled]{background:#f3f4f6; cursor:not-allowed}

        .pf-radio{
          display:flex; gap:18px; align-items:center; flex-wrap:wrap; color:#0e1a2b; font-size:14px;
        }
        .pf-error{color:#b91c1c; font-size:12px; margin-top:6px}

        .pf-footer{
          display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; margin-top:10px
        }

        .reveal{opacity:0; transform: translateY(8px)}
        .reveal.in{opacity:1; transform: translateY(0); transition: all .5s ease}
        @keyframes pop{from{transform:scale(.995); opacity:0} to{transform:scale(1); opacity:1}}
        @keyframes rise{from{transform:translateY(6px); opacity:0} to{transform:translateY(0); opacity:1}}
      `}</style>

      {/* Header */}
      <div className="pf-header reveal">
        <div>
          <div className="pf-chip">Profile</div>
          <h1 className="pf-title">Welcome, {currentUser.fname}</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>{currentUser.email}</div>
        </div>
        <div className="pf-actions">
          {!isEditing ? (
            <>
              <button className="pf-btn pf-btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
              <button className="pf-btn pf-btn-danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button
                className="pf-btn pf-btn-primary"
                onClick={handleUpdateProfile}
                disabled={!hasChanges}
                title={!hasChanges ? "No changes to save" : "Save changes"}
              >
                Save Changes
              </button>
              <button
                className="pf-btn pf-btn-ghost"
                onClick={() => {
                  if (hasChanges && !window.confirm("Discard your unsaved changes?")) return;
                  setIsEditing(false);
                  setUpdatedProfile(currentUser);
                  setImageFile(null);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="pf-card reveal">
        <div className="pf-row">
          {/* Avatar */}
          <div className="pf-avatar">
            {imagePreview || currentUser.profile_image ? (
              <img
                className="pf-img"
                src={imagePreview || currentUser.profile_image}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/120?text=No+Image";
                }}
              />
            ) : (
              <div className="pf-initials" aria-label="User initials">{initials || "U"}</div>
            )}

            <div style={{ width: "100%" }}>
              <label htmlFor="file" style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>
                Profile Image
              </label>
              <input
                id="file"
                type="file"
                className="pf-input"
                onChange={handleFileChange}
                disabled={!isEditing}
                accept="image/png, image/jpeg, image/webp"
              />
              {imagePreview && isEditing && (
                <button
                  className="pf-btn"
                  style={{ marginTop: 8, width: "100%" }}
                  onClick={() => setImageFile(null)}
                  type="button"
                >
                  Remove Selected Photo
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="pf-body">
            {/* Basic Info */}
            <div className="pf-section">
              <h3>Basic Information</h3>
              <div className="pf-grid">
                <div className="pf-field">
                  <label>First Name</label>
                  <input
                    className="pf-input"
                    name="fname"
                    value={updatedProfile.fname || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  {errors.fname && <div className="pf-error">{errors.fname}</div>}
                </div>

                <div className="pf-field">
                  <label>Last Name</label>
                  <input
                    className="pf-input"
                    name="lname"
                    value={updatedProfile.lname || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  {errors.lname && <div className="pf-error">{errors.lname}</div>}
                </div>

                <div className="pf-field">
                  <label>Email</label>
                  <input className="pf-input" name="email" value={updatedProfile.email || ""} disabled />
                </div>

                <div className="pf-field">
                  <label>Mobile</label>
                  <input
                    className="pf-input"
                    name="mobile"
                    value={updatedProfile.mobile || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+91 9xxxxxxxxx"
                  />
                  {errors.mobile && <div className="pf-error">{errors.mobile}</div>}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="pf-section">
              <h3>Preferences</h3>
              <div className="pf-grid">
                <div className="pf-field">
                  <label>Gender</label>
                  <div className="pf-radio">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={updatedProfile.gender === "Male"}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />{" "}
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={updatedProfile.gender === "Female"}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />{" "}
                      Female
                    </label>
                  </div>
                </div>

                <div className="pf-field">
                  <label>City</label>
                  <select
                    className="pf-select"
                    name="city"
                    value={updatedProfile.city || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select City</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Surat">Surat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* About / Notes (optional) */}
            <div className="pf-section">
              <h3>Notes</h3>
              <div className="pf-field">
                <label>About / Notes</label>
                <textarea
                  className="pf-textarea"
                  name="about"
                  rows={3}
                  placeholder="Add any preferences, team name, or notes for booking..."
                  value={updatedProfile.about || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pf-footer">
              {!isEditing ? (
                <>
                  <button className="pf-btn pf-btn-primary" onClick={() => setIsEditing(true)}>
                    Update Profile
                  </button>
                  <button className="pf-btn pf-btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="pf-btn pf-btn-primary"
                    onClick={handleUpdateProfile}
                    disabled={!hasChanges}
                    title={!hasChanges ? "No changes to save" : "Save changes"}
                  >
                    Save Changes
                  </button>
                  <button
                    className="pf-btn"
                    onClick={() => {
                      if (hasChanges && !window.confirm("Discard your unsaved changes?")) return;
                      setIsEditing(false);
                      setUpdatedProfile(currentUser);
                      setImageFile(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
