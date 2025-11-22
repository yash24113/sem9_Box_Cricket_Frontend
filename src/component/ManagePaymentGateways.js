// src/pages/admin/ManagePaymentGateways.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API =
  process.env.REACT_APP_API_ROOT || "http://localhost:5000/api/userapi";

const Field = ({ label, children }) => (
  <label style={{ display: "grid", gap: 6 }}>
    <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
      {label}
    </span>
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
      fontSize: "14px",
      ...props.style,
    }}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    style={{
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "14px",
      minHeight: "60px",
      resize: "vertical",
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
      fontSize: "14px",
      background: "#fff",
      ...props.style,
    }}
  />
);

const Checkbox = ({ label, ...props }) => (
  <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    <input type="checkbox" {...props} />
    <span style={{ fontSize: 13 }}>{label}</span>
  </label>
);

const ManagePaymentGateways = () => {
  // ---- auth / role gate (same pattern as ManageAdmins)
  const loginBlob = useMemo(() => {
    try {
      const raw = localStorage.getItem("loggedInUser") || "{}";
      return JSON.parse(raw);
    } catch {
      const raw = localStorage.getItem("loggedInUser");
      return raw || {};
    }
  }, []);

  const currentUser = useMemo(() => {
    if (!loginBlob) return null;
    if (typeof loginBlob === "string") return loginBlob;

    if (loginBlob?.data?.user) return loginBlob.data.user;
    if (loginBlob?.user) return loginBlob.user;
    if (loginBlob?.data) return loginBlob.data;
    return loginBlob;
  }, [loginBlob]);

  let email = "";
  let normalizedRole = "";

  if (typeof currentUser === "string") {
    email = currentUser.toLowerCase().trim();
  } else if (currentUser && typeof currentUser === "object") {
    email = (currentUser.email || "").toLowerCase().trim();
    normalizedRole = (currentUser.role || "").toLowerCase().trim();
  }

  const isSuperadmin =
    normalizedRole === "superadmin" || email === "superadmin@gmail.com";

  // ---- state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    providerKey: "stripe",
    logoUrl: "",
    description: "",
    publicKey: "",
    mode: "test",
    currency: "INR",
    isActive: true,
    isDefault: false,
    sortOrder: 0,
  });

  const [busyId, setBusyId] = useState(null);

  // token header
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // ---- CRUD calls
  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/payment-gateways`);
      let data = res?.data?.data || [];
      if (q.trim()) {
        const query = q.trim().toLowerCase();
        data = data.filter(
          (g) =>
            String(g.name || "").toLowerCase().includes(query) ||
            String(g.providerKey || "").toLowerCase().includes(query)
        );
      }
      setRows(data);
    } catch (e) {
      toast.error("Failed to load payment gateways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (row) => {
    setEditRow({ ...row });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editRow?._id) return;
    try {
      setBusyId(editRow._id);
      const payload = {
        name: editRow.name,
        providerKey: editRow.providerKey,
        logoUrl: editRow.logoUrl,
        description: editRow.description,
        publicKey: editRow.publicKey,
        mode: editRow.mode,
        currency: editRow.currency,
        isActive: !!editRow.isActive,
        isDefault: !!editRow.isDefault,
        sortOrder: Number(editRow.sortOrder || 0),
      };

      const res = await axios.put(
        `${API}/payment-gateways/${editRow._id}`,
        payload
      );
      toast.success(res?.data?.message || "Payment gateway updated");
      setShowEditModal(false);
      fetchRows();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Update failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const removeGateway = async (id) => {
    if (!window.confirm("Delete this payment gateway?")) return;
    try {
      setBusyId(id);
      const res = await axios.delete(`${API}/payment-gateways/${id}`);
      toast.success(res?.data?.message || "Payment gateway deleted");
      setRows((xs) => xs.filter((g) => g._id !== id));
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Delete failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const createGateway = async () => {
    const required = ["name", "providerKey"];
    const missing = required.filter(
      (k) => !String(createData[k] || "").trim()
    );
    if (missing.length) {
      toast.error(`Missing: ${missing.join(", ")}`);
      return;
    }
    try {
      setBusyId("create");
      const payload = {
        ...createData,
        sortOrder: Number(createData.sortOrder || 0),
      };
      const res = await axios.post(`${API}/payment-gateways`, payload);
      toast.success(res?.data?.message || "Payment gateway created");
      setShowCreateModal(false);
      setCreateData({
        name: "",
        providerKey: "stripe",
        logoUrl: "",
        description: "",
        publicKey: "",
        mode: "test",
        currency: "INR",
        isActive: true,
        isDefault: false,
        sortOrder: 0,
      });
      fetchRows();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Create failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  // ---- access gate
  if (!isSuperadmin) {
    return (
      <div style={styles.pageContainer}>
        <AdminHeader />
        <div
          style={{
            display: "grid",
            placeItems: "center",
            flex: 1,
            background: "#f8fafc",
          }}
        >
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
        <AdminSidebar />

        <div style={styles.container}>
          <h1 style={styles.heading}>Manage Payment Gateways</h1>

          {/* Filters + Actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Input
              placeholder="Search by name or provider key"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: "100%" }}
            />
            <button style={styles.button} onClick={fetchRows}>
              Search / Refresh
            </button>
            <button
              style={{ ...styles.button, backgroundColor: "#10b981" }}
              onClick={() => setShowCreateModal(true)}
            >
              + New Gateway
            </button>
          </div>

          {/* Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Logo</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Provider Key</th>
                  <th style={styles.th}>Mode</th>
                  <th style={styles.th}>Currency</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Default</th>
                  <th style={styles.th}>Sort</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={styles.noData}>
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={styles.noData}>
                      No payment gateways found.
                    </td>
                  </tr>
                ) : (
                  rows.map((g, index) => (
                    <tr
                      key={g._id || index}
                      style={
                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                      }
                    >
                      <td style={styles.td}>
                        {g.logoUrl ? (
                          <img
                            src={g.logoUrl}
                            alt={g.name}
                            style={{ height: 30, objectFit: "contain" }}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>
                            No logo
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>{g.name}</td>
                      <td style={styles.td}>{g.providerKey}</td>
                      <td style={styles.td}>{g.mode}</td>
                      <td style={styles.td}>{g.currency}</td>
                      <td style={styles.td}>
                        {g.isActive ? "Yes" : "No"}
                      </td>
                      <td style={styles.td}>
                        {g.isDefault ? "Yes" : "No"}
                      </td>
                      <td style={styles.td}>{g.sortOrder ?? 0}</td>
                      <td style={{ ...styles.td, minWidth: 200 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            style={styles.editButton}
                            onClick={() => openEdit(g)}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              ...styles.smallBtn,
                              backgroundColor: "#dc3545",
                            }}
                            disabled={busyId === g._id}
                            onClick={() => removeGateway(g._id)}
                          >
                            {busyId === g._id ? "…" : "Delete"}
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

      {/* Edit Modal */}
      {showEditModal && editRow && (
        <div
          style={styles.modalOverlay}
          onClick={(e) =>
            e.target === e.currentTarget && setShowEditModal(false)
          }
        >
          <div style={styles.modalContent}>
            <h2>Edit Payment Gateway</h2>
            <div style={styles.modalForm}>
              <Field label="Name">
                <Input
                  value={editRow.name || ""}
                  onChange={(e) =>
                    setEditRow({ ...editRow, name: e.target.value })
                  }
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="Provider Key">
                  <Select
                    value={editRow.providerKey || "stripe"}
                    onChange={(e) =>
                      setEditRow({
                        ...editRow,
                        providerKey: e.target.value,
                      })
                    }
                  >
                    <option value="stripe">stripe</option>
                    <option value="razorpay">razorpay</option>
                    <option value="paytm">paytm</option>
                    <option value="other">other</option>
                  </Select>
                </Field>

                <Field label="Mode">
                  <Select
                    value={editRow.mode || "test"}
                    onChange={(e) =>
                      setEditRow({ ...editRow, mode: e.target.value })
                    }
                  >
                    <option value="test">test</option>
                    <option value="live">live</option>
                  </Select>
                </Field>
              </div>

              <Field label="Logo URL">
                <Input
                  value={editRow.logoUrl || ""}
                  onChange={(e) =>
                    setEditRow({ ...editRow, logoUrl: e.target.value })
                  }
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={editRow.description || ""}
                  onChange={(e) =>
                    setEditRow({
                      ...editRow,
                      description: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Public Key (frontend-safe)">
                <Input
                  value={editRow.publicKey || ""}
                  onChange={(e) =>
                    setEditRow({
                      ...editRow,
                      publicKey: e.target.value,
                    })
                  }
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="Currency">
                  <Input
                    value={editRow.currency || "INR"}
                    onChange={(e) =>
                      setEditRow({
                        ...editRow,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </Field>
                <Field label="Sort Order">
                  <Input
                    type="number"
                    value={editRow.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditRow({
                        ...editRow,
                        sortOrder: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Flags">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Checkbox
                      label="Active"
                      checked={!!editRow.isActive}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <Checkbox
                      label="Default"
                      checked={!!editRow.isDefault}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                  </div>
                </Field>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                justifyContent: "flex-end",
              }}
            >
              <button
                style={styles.cancelBtn}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
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
        <div
          style={styles.modalOverlay}
          onClick={(e) =>
            e.target === e.currentTarget && setShowCreateModal(false)
          }
        >
          <div style={styles.modalContent}>
            <h2>New Payment Gateway</h2>
            <div style={styles.modalForm}>
              <Field label="Name">
                <Input
                  value={createData.name}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      name: e.target.value,
                    })
                  }
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="Provider Key">
                  <Select
                    value={createData.providerKey}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        providerKey: e.target.value,
                      })
                    }
                  >
                    <option value="stripe">stripe</option>
                    <option value="razorpay">razorpay</option>
                    <option value="paytm">paytm</option>
                    <option value="other">other</option>
                  </Select>
                </Field>

                <Field label="Mode">
                  <Select
                    value={createData.mode}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        mode: e.target.value,
                      })
                    }
                  >
                    <option value="test">test</option>
                    <option value="live">live</option>
                  </Select>
                </Field>
              </div>

              <Field label="Logo URL">
                <Input
                  value={createData.logoUrl}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      logoUrl: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={createData.description}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      description: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Public Key (frontend-safe)">
                <Input
                  value={createData.publicKey}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      publicKey: e.target.value,
                    })
                  }
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                <Field label="Currency">
                  <Input
                    value={createData.currency}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </Field>
                <Field label="Sort Order">
                  <Input
                    type="number"
                    value={createData.sortOrder}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        sortOrder: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Flags">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Checkbox
                      label="Active"
                      checked={createData.isActive}
                      onChange={(e) =>
                        setCreateData({
                          ...createData,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <Checkbox
                      label="Default"
                      checked={createData.isDefault}
                      onChange={(e) =>
                        setCreateData({
                          ...createData,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                  </div>
                </Field>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                justifyContent: "flex-end",
              }}
            >
              <button
                style={styles.cancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.saveBtn, backgroundColor: "#10b981" }}
                onClick={createGateway}
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

const styles = {
  pageContainer: { display: "flex", flexDirection: "column", height: "100vh" },
  mainContent: { display: "flex", flex: 1 },
  container: { textAlign: "center", margin: "20px auto", width: "90%" },
  heading: {
    color: "#333",
    fontSize: "26px",
    marginBottom: "20px",
    textTransform: "uppercase",
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
  td: { padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" },
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
  noData: {
    textAlign: "center",
    padding: "20px",
    fontStyle: "italic",
    color: "#999",
  },
};

export default ManagePaymentGateways;
