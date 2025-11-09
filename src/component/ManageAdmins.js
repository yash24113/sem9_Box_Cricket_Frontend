// src/pages/admin/ManageAdmins.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_ROOT || "http://localhost:5000/api/userapi";

/* --- small atoms (styled to blend with ManageUsers page) --- */
const Field = ({ label, children }) => (
  <label style={{ display: "grid", gap: 6 }}>
    <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{label}</span>
    {children}
  </label>
);
const Input = (props) => (
  <input
    {...props}
    style={{
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
      ...props.style,
    }}
  />
);
const Select = (props) => (
  <select
    {...props}
    style={{
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
      background: "#fff",
      ...props.style,
    }}
  />
);

const ManageAdmins = () => {
  // ---- auth / role gate (consistent with your other pages)
  const loginBlob = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    } catch {
      return {};
    }
  }, []);
  const currentUser = loginBlob?.data || null;
  const role =
    currentUser?.role ||
    (currentUser?.email === "superadmin@gmail.com" ? "superadmin" : "user");

  // ---- state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    gender: "Male",
    city: "",
    state: "",
    address: "",
    password: "123",
  });

  const [busyId, setBusyId] = useState(null);

  // token header (same approach as other pages)
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (city.trim()) params.set("city", city.trim());
      if (stateName.trim()) params.set("state", stateName.trim());
      const r = await axios.get(`${API}/admins?${params.toString()}`);
      setRows(r?.data?.data || []);
    } catch (e) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- actions
  const openEdit = (row) => {
    setEditRow({ ...row });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editRow?._id) return;
    try {
      setBusyId(editRow._id);
      const payload = {
        fname: editRow.fname || "",
        lname: editRow.lname || "",
        mobile: editRow.mobile || "",
        gender: editRow.gender || "Male",
        city: editRow.city || "",
        state: editRow.state || "",
        address: editRow.address || "",
        role: "admin",
      };
      await axios.put(`${API}/admins/${editRow._id}`, payload);
      toast.success("Admin updated");
      setShowEditModal(false);
      fetchRows();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (id) => {
    if (!window.confirm("Reset password to '123' for this admin?")) return;
    try {
      setBusyId(id);
      await axios.put(`${API}/admins/${id}/reset-password`);
      toast.success("Password reset to '123'");
    } catch {
      toast.error("Reset failed");
    } finally {
      setBusyId(null);
    }
  };

  const removeAdmin = async (id) => {
    if (!window.confirm("Delete this admin permanently?")) return;
    try {
      setBusyId(id);
      await axios.delete(`${API}/admins/${id}`);
      toast.success("Admin deleted");
      setRows((x) => x.filter((r) => r._id !== id));
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const createAdmin = async () => {
    const required = ["fname", "email", "password"];
    const missing = required.filter((k) => !String(createData[k] || "").trim());
    if (missing.length) {
      toast.error(`Missing: ${missing.join(", ")}`);
      return;
    }
    try {
      setBusyId("create");
      await axios.post(`${API}/admins`, {
        ...createData,
        role: "admin",
      });
      toast.success("Admin created");
      setShowCreateModal(false);
      setCreateData({
        fname: "",
        lname: "",
        email: "",
        mobile: "",
        gender: "Male",
        city: "",
        state: "",
        address: "",
        password: "123",
      });
      fetchRows();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Create failed");
    } finally {
      setBusyId(null);
    }
  };

  // ---- access gate (same structure/feel as ManageUsers)
  if (role !== "superadmin") {
    return (
      <div style={styles.pageContainer}>
        <AdminHeader />
        <div style={{ display: "grid", placeItems: "center", flex: 1, background: "#f8fafc" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 24,
              maxWidth: 560,
              textAlign: "center",
              boxShadow: "0 10px 28px rgba(17,35,56,.10)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>403 — Not Authorized</h2>
            <p style={{ color: "#4b5563" }}>
              This page is visible to <b>Superadmin</b> only.
            </p>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <AdminHeader />

      <div style={styles.mainContent}>
        {/* Sidebar (same placement as ManageUsers) */}
        <AdminSidebar />

        {/* Main container */}
        <div style={styles.container}>
          <h1 style={styles.heading}>Manage Admins</h1>

          {/* Filters - styled to match ManageUsers input */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 10, marginBottom: 12 }}>
            <Input
              placeholder="Search by name / email / phone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: "100%" }}
            />
            <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} />
            <button style={styles.button} onClick={fetchRows}>Search / Refresh</button>
            <button
              style={{ ...styles.button, backgroundColor: "#10b981" }}
              onClick={() => setShowCreateModal(true)}
            >
              + New Admin
            </button>
          </div>

          {/* Table (same header color/row striping vibe) */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "City",
                    "State",
                    "Gender",
                    "Address",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={
                        h === "Email"
                          ? styles.thEmail
                          : h === "Phone"
                          ? styles.thPhone
                          : styles.th
                      }
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={styles.noData}>Loading…</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.noData}>No admins found.</td>
                  </tr>
                ) : (
                  rows.map((r, index) => (
                    <tr
                      key={r._id || index}
                      style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                        <b>{r.fname} {r.lname}</b>
                      </td>
                      <td style={{ ...styles.td, ...styles.tdEmail }}>{r.email}</td>
                      <td style={{ ...styles.td, ...styles.tdPhone }}>{r.mobile}</td>
                      <td style={styles.td}>{r.city}</td>
                      <td style={styles.td}>{r.state}</td>
                      <td style={styles.td}>{r.gender || "-"}</td>
                      <td style={{ ...styles.td, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.address || "-"}
                      </td>
                      <td style={{ ...styles.td, minWidth: 240 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button style={styles.editButton} onClick={() => openEdit(r)}>
                            Edit
                          </button>
                          <button
                            style={{ ...styles.smallBtn, backgroundColor: "#d97706" }}
                            disabled={busyId === r._id}
                            onClick={() => resetPassword(r._id)}
                          >
                            {busyId === r._id ? "…" : "Reset PW"}
                          </button>
                          <button
                            style={{ ...styles.smallBtn, backgroundColor: "#dc3545" }}
                            disabled={busyId === r._id}
                            onClick={() => removeAdmin(r._id)}
                          >
                            {busyId === r._id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminFooter />

      {/* Edit Modal (cloned visual style from ManageUsers modals) */}
      {showEditModal && editRow && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}>
          <div style={styles.modalContent}>
            <h2>Edit Admin</h2>
            <div style={styles.modalForm}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="First Name">
                  <Input
                    value={editRow.fname || ""}
                    onChange={(e) => setEditRow({ ...editRow, fname: e.target.value })}
                  />
                </Field>
                <Field label="Last Name">
                  <Input
                    value={editRow.lname || ""}
                    onChange={(e) => setEditRow({ ...editRow, lname: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Email">
                <Input value={editRow.email || ""} disabled />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Mobile">
                  <Input
                    value={editRow.mobile || ""}
                    onChange={(e) => setEditRow({ ...editRow, mobile: e.target.value })}
                  />
                </Field>
                <Field label="Gender">
                  <Select
                    value={editRow.gender || "Male"}
                    onChange={(e) => setEditRow({ ...editRow, gender: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="City">
                  <Input
                    value={editRow.city || ""}
                    onChange={(e) => setEditRow({ ...editRow, city: e.target.value })}
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={editRow.state || ""}
                    onChange={(e) => setEditRow({ ...editRow, state: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Address">
                <Input
                  value={editRow.address || ""}
                  onChange={(e) => setEditRow({ ...editRow, address: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
              <button
                style={styles.saveBtn}
                onClick={saveEdit}
                disabled={busyId === editRow._id}
              >
                {busyId === editRow._id ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div style={styles.modalContent}>
            <h2>New Admin</h2>
            <div style={styles.modalForm}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="First Name">
                  <Input
                    value={createData.fname}
                    onChange={(e) => setCreateData({ ...createData, fname: e.target.value })}
                  />
                </Field>
                <Field label="Last Name">
                  <Input
                    value={createData.lname}
                    onChange={(e) => setCreateData({ ...createData, lname: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Email">
                <Input
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Mobile">
                  <Input
                    value={createData.mobile}
                    onChange={(e) => setCreateData({ ...createData, mobile: e.target.value })}
                  />
                </Field>
                <Field label="Gender">
                  <Select
                    value={createData.gender}
                    onChange={(e) => setCreateData({ ...createData, gender: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="City">
                  <Input
                    value={createData.city}
                    onChange={(e) => setCreateData({ ...createData, city: e.target.value })}
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={createData.state}
                    onChange={(e) => setCreateData({ ...createData, state: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Address">
                <Input
                  value={createData.address}
                  onChange={(e) => setCreateData({ ...createData, address: e.target.value })}
                />
              </Field>

              <Field label="Password (default 123)">
                <Input
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button style={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button
                style={{ ...styles.saveBtn, backgroundColor: "#10b981" }}
                onClick={createAdmin}
                disabled={busyId === "create"}
              >
                {busyId === "create" ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
};

/* ----- Styles copied/adapted from ManageUsers for a consistent look ----- */
const styles = {
  pageContainer: { display: "flex", flexDirection: "column", height: "100vh" },
  mainContent: { display: "flex", flex: 1 },
  container: { textAlign: "center", margin: "20px auto", width: "90%" },
  heading: { color: "#333", fontSize: "26px", marginBottom: "20px", textTransform: "uppercase" },

  tableWrapper: {
    width: "100%",
    maxHeight: "400px",
    overflowY: "auto",
    borderRadius: "10px",
    backgroundColor: "white",
    padding: "15px",
  },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
  },
  thEmail: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
    width: "220px",
  },
  thPhone: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
    width: "150px",
  },
  td: { padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" },
  tdEmail: { width: "1px" },
  tdPhone: { width: "0px" },
  evenRow: { backgroundColor: "#f4f4f4" },
  oddRow: { backgroundColor: "#ffffff" },

  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  editButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  smallBtn: {
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  /* Modals (same as ManageUsers) */
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1500,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "520px",
    width: "90%",
    position: "relative",
    maxHeight: "70vh",
    overflowY: "auto",
  },
  modalForm: { display: "flex", flexDirection: "column", gap: "10px" },
  saveBtn: {
    padding: "10px 20px",
    backgroundColor: "#2c4c97",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noData: { textAlign: "center", padding: "20px", fontStyle: "italic", color: "#999" },
};

export default ManageAdmins;
