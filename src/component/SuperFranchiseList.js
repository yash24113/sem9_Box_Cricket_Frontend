// src/pages/admin/SuperFranchiseList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";

const API = process.env.REACT_APP_API_ROOT || "http://localhost:5000/api/userapi";

/* ---------- tiny helpers ---------- */
const StatusPill = ({ v }) => {
  const map = { pending: "#f59e0b", approved: "#10b981", rejected: "#ef4444" };
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 10,
        fontSize: 12,
        color: "#0f172a",
        background: `${map[v] || "#e5e7eb"}33`,
        border: `1px solid ${map[v] || "#e5e7eb"}`,
        whiteSpace: "nowrap",
      }}
    >
      {v}
    </span>
  );
};
const fmtMoney = (v) => (v === 0 || v ? `₹${v}` : "-");
const nowIso = () => new Date().toISOString();

/* ---------- Local history (fallback until backend stores it) ---------- */
const LS_KEY = "franchiseApprovalHistory";
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h) { localStorage.setItem(LS_KEY, JSON.stringify(h)); }

/* ---------- Component ---------- */
const SuperFranchiseList = () => {
  /* ---- auth / role gate ---- */
  const loginBlob = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; }
  }, []);
  const currentUser = loginBlob?.data || null;
  const role =
    currentUser?.role ||
    (currentUser?.email === "superadmin@gmail.com" ? "superadmin" : "user");

  /* ---- state ---- */
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // history drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory());

  // who am i (for history)
  const approverName = useMemo(() => {
    const f = (currentUser?.fname || currentUser?.firstName || "").trim();
    const l = (currentUser?.lname || currentUser?.lastName || "").trim();
    const nm = [f, l].filter(Boolean).join(" ").trim();
    return nm || currentUser?.email || "Superadmin";
  }, [currentUser]);

  // axios auth header
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("status", status);
      if (q.trim()) query.set("q", q.trim());
      const r = await axios.get(`${API}/franchise/list?${query.toString()}`);
      setRows(r?.data?.data || []);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  /* ---- actions ---- */
  const approve = async (id) => {
    try {
      setBusyId(id);
      const res = await axios.put(`${API}/franchise/${id}/approve`);
      const lead = res?.data?.data?.lead || rows.find((r) => r._id === id);

      const entry = {
        leadId: id,
        name: lead?.name || "-",
        email: lead?.email || "-",
        city: lead?.city || "-",
        state: lead?.state || "-",
        approvedBy: approverName,
        approvedByEmail: currentUser?.email || "",
        approvedAt: nowIso(),
      };
      const next = [entry, ...history].slice(0, 200);
      setHistory(next);
      saveHistory(next);

      toast.success("Approved and admin created");
      fetchRows();
    } catch {
      toast.error("Approval failed");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    try {
      setBusyId(id);
      await axios.put(`${API}/franchise/${id}/reject`);
      toast.success("Rejected");
      fetchRows();
    } catch {
      toast.error("Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  /* ---- derive approved-by (prefers backend when available) ---- */
  const approvedByFor = (row) => {
    if (row?.approvedBy) return row.approvedBy;
    const h = history.find((e) => e.leadId === row._id);
    if (h) return `${h.approvedBy} (${new Date(h.approvedAt).toLocaleString()})`;
    if (row?.createdAdminId) return "Admin created (approver not recorded)";
    return "—";
  };

  /* ---- access gate (same shell as ManageUsers) ---- */
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

  /* ---- UI (same layout & styles map as ManageUsers) ---- */
  return (
    <div style={styles.pageContainer}>
      <AdminHeader />

      <div style={styles.mainContent}>
        {/* Sidebar (left) */}
        <AdminSidebar />

        {/* Main container (right) */}
        <div style={styles.container}>
          <h1 style={styles.heading}>Franchise Leads — Superadmin</h1>

          {/* Filters row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr auto auto auto", gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search by name / email / phone / city / state"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={styles.searchInput}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ ...styles.input, padding: "10px" }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button style={styles.button} onClick={fetchRows}>Search / Refresh</button>
            <button
              style={{ ...styles.button, backgroundColor: "#795548" }}
              onClick={() => setHistoryOpen(true)}
            >
              View History
            </button>
          </div>

          {/* Table */}
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
                    "Venue",
                    "Budget",
                    "Timeline",
                    "Status",
                    "Approved By",
                    "Actions",
                  ].map((h) => (
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
                    <td colSpan="11" style={styles.noData}>Loading…</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={styles.noData}>No leads.</td>
                  </tr>
                ) : (
                  rows.map((r, index) => (
                    <tr
                      key={r._id}
                      style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                    >
                      <td style={styles.td}>{r.name}</td>
                      <td style={{ ...styles.td, ...styles.tdEmail }}>{r.email}</td>
                      <td style={{ ...styles.td, ...styles.tdPhone }}>{r.phone}</td>
                      <td style={styles.td}>{r.city}</td>
                      <td style={styles.td}>{r.state}</td>
                      <td style={styles.td}>
                        {r.haveVenue ? `${r.venueType} • ${r.areaSqFt || 0} sqft` : "No"}
                      </td>
                      <td style={styles.td}>{fmtMoney(r.investmentBudget)}</td>
                      <td style={styles.td}>{r.timeline}</td>
                      <td style={styles.td}><StatusPill v={r.status} /></td>
                      <td style={{ ...styles.td, minWidth: 220 }}>
                        {r.status === "approved" ? approvedByFor(r) : "—"}
                      </td>
                      <td style={{ ...styles.td, minWidth: 240 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            disabled={busyId === r._id || r.status !== "pending"}
                            onClick={() => approve(r._id)}
                            style={{ ...styles.smallBtn, backgroundColor: "#10b981" }}
                          >
                            {busyId === r._id ? "…" : "Approve"}
                          </button>
                          <button
                            disabled={busyId === r._id || r.status !== "pending"}
                            onClick={() => reject(r._id)}
                            style={{ ...styles.smallBtn, backgroundColor: "#dc3545" }}
                          >
                            {busyId === r._id ? "…" : "Disapprove"}
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

      {/* History Drawer (same modal visuals as ManageUsers) */}
      {historyOpen && (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Approval history"
          onClick={(e) => { if (e.target === e.currentTarget) setHistoryOpen(false); }}
        >
          <div style={{ ...styles.modalContent, maxWidth: 960 }}>
            <h2 style={{ marginTop: 0 }}>Approval History</h2>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Lead", "Email", "City/State", "Approved By", "When"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={styles.noData}>No approvals recorded locally yet.</td>
                    </tr>
                  ) : (
                    history.map((h, i) => (
                      <tr key={`${h.leadId}-${i}`} style={i % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.td}>{h.name || "-"}</td>
                        <td style={{ ...styles.td, ...styles.tdEmail }}>{h.email || "-"}</td>
                        <td style={styles.td}>{(h.city || "-")}/{(h.state || "-")}</td>
                        <td style={styles.td}>
                          {h.approvedBy || "-"} {h.approvedByEmail ? `• ${h.approvedByEmail}` : ""}
                        </td>
                        <td style={styles.td}>{h.approvedAt ? new Date(h.approvedAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setHistory([]); saveHistory([]); }}
                style={styles.cancelBtn}
                title="Clear local history (does not affect server)"
              >
                Clear Local
              </button>
              <button onClick={() => setHistoryOpen(false)} style={styles.saveBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
};

/* ------- Styles copied/adapted from ManageUsers so UI matches exactly ------- */
const styles = {
  pageContainer: { display: "flex", flexDirection: "column", height: "100vh" },
  mainContent: { display: "flex", flex: 1 },
  container: { textAlign: "center", margin: "20px auto", width: "90%" },
  heading: { color: "#333", fontSize: "26px", marginBottom: "20px", textTransform: "uppercase" },

  searchInput: {
    padding: "10px",
    width: "100%",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    background: "#fff",
  },

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
  smallBtn: {
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  /* Modal visuals same as ManageUsers */
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

export default SuperFranchiseList;
