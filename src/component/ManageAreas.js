// src/pages/admin/ManageAreas.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";
import Pagination from "./Pagination";
import "../ManageArea.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Must match backend mount: app.use("/api/userapi", ...)
const API_ROOT = (
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api/userapi"
).replace(/\/+$/, "");

/* ---------- helpers ---------- */

function getStoredUser() {
  // Try loggedInUser
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data) return parsed.data;        // { data: user }
      if (parsed?.user) return parsed.user;        // { user: user }
      if (parsed?.email || parsed?.role) return parsed; // plain user
    }
  } catch (e) {
    console.warn("Failed to parse loggedInUser:", e);
  }

  // Fallback: adminUser
  try {
    const rawAdmin = localStorage.getItem("adminUser");
    if (rawAdmin) {
      const parsed = JSON.parse(rawAdmin);
      if (parsed?.data) return parsed.data;
      if (parsed?.user) return parsed.user;
      if (parsed?.email || parsed?.role) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse adminUser:", e);
  }

  return null;
}

const ManageAreas = () => {
  const [areas, setAreas] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [editAreaId, setEditAreaId] = useState(null);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  // Logged-in user + role
  const user = useMemo(() => getStoredUser(), []);
  const role = useMemo(() => {
    if (user?.role) return user.role;
    if (user?.email === "superadmin@gmail.com") return "superadmin";
    return "user";
  }, [user]);

  const adminCity = String(user?.city || "").trim();

  // Attach token (if any)
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    fetchAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/viewArea`);
      const all = res?.data?.data || [];

      let scoped = all;

      // If you want admin to see only their-city areas (assuming area_name includes city)
      if (role === "admin" && adminCity) {
        const city = adminCity.toLowerCase();
        scoped = all.filter((a) =>
          String(a.area_name || "").toLowerCase().includes(city)
        );
      }

      // superadmin -> all; user -> here we keep all so they see data
      setAreas(scoped);

      // Optional: store for dropdowns elsewhere
      try {
        localStorage.setItem(
          "allowedAreasForDropdown",
          JSON.stringify(scoped)
        );
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch areas!",
        severity: "error",
      });
    }
  };

  const openAdd = () => {
    setShowAddModal(true);
    setEditAreaId(null);
    // For admin, you can hint with their city; superadmin starts blank
    setAreaName(role === "admin" && adminCity ? adminCity : "");
  };

  const openEdit = (area) => {
    setEditAreaId(area._id);
    setAreaName(area.area_name || "");
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const name = String(areaName || "").trim();
    if (!name) {
      setSnackbar({
        open: true,
        message: "Area name cannot be empty!",
        severity: "error",
      });
      return;
    }

    // If you want to enforce admin only using their city:
    if (
      role === "admin" &&
      adminCity &&
      name.toLowerCase().indexOf(adminCity.toLowerCase()) === -1
    ) {
      setSnackbar({
        open: true,
        message: `You are limited to your city (${adminCity}) while adding/editing areas.`,
        severity: "warning",
      });
      return;
    }

    try {
      if (editAreaId) {
        await axios.put(`${API_ROOT}/updateArea/${editAreaId}`, {
          area_name: name,
        });
        setSnackbar({
          open: true,
          message: "Area updated successfully!",
          severity: "success",
        });
      } else {
        await axios.post(`${API_ROOT}/addArea`, {
          area_name: name,
        });
        setSnackbar({
          open: true,
          message: "Area added successfully!",
          severity: "success",
        });
      }
      await fetchAreas();
      setShowAddModal(false);
      setAreaName("");
      setEditAreaId(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error saving area:", error);
      setSnackbar({
        open: true,
        message: "Operation failed!",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!areaToDelete?._id) return;
    try {
      await axios.delete(
        `${API_ROOT}/deleteArea/${areaToDelete._id}`
      );
      setSnackbar({
        open: true,
        message: "Area deleted successfully!",
        severity: "warning",
      });
      await fetchAreas();
      setAreaToDelete(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error deleting area:", error);
      setSnackbar({
        open: true,
        message: "Delete failed!",
        severity: "error",
      });
    }
  };

  // Filter by search (after scoping)
  const filteredAreas = areas.filter((area) =>
    String(area.area_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastArea = currentPage * itemsPerPage;
  const indexOfFirstArea = indexOfLastArea - itemsPerPage;
  const currentAreas = filteredAreas.slice(
    indexOfFirstArea,
    indexOfLastArea
  );
  const totalPages = Math.ceil(
    filteredAreas.length / itemsPerPage
  );

  const handlePageChange = (pageNumber) =>
    setCurrentPage(pageNumber);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <AdminHeader />

      <div style={{ display: "flex", flex: 1 }}>
        <AdminSidebar />

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            width: "100%",
          }}
        >
          <h1>Manage Areas</h1>

          {role === "admin" && (
            <p
              style={{
                marginTop: -8,
                color: "#6b7280",
              }}
            >
              Showing areas for your city:{" "}
              <b>{adminCity || "Not set"}</b>
            </p>
          )}

          <input
            type="text"
            placeholder="Search Areas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.searchBox}
          />

          {/* Allow both superadmin & admin to add; tweak if needed */}
          <button
            onClick={openAdd}
            style={styles.addButton}
          >
            + Add Area
          </button>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Area ID</th>
                  <th style={styles.th}>Area Name</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAreas.length > 0 ? (
                  currentAreas.map(
                    (area, index) => (
                      <tr
                        key={area._id}
                        style={
                          index % 2 === 0
                            ? styles.evenRow
                            : styles.oddRow
                        }
                      >
                        <td style={styles.td}>
                          {area._id}
                        </td>
                        <td style={styles.td}>
                          {area.area_name}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() =>
                              openEdit(area)
                            }
                            style={
                              styles.editButton
                            }
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              setAreaToDelete(
                                area
                              )
                            }
                            style={
                              styles.deleteButton
                            }
                          >
                            ✖️
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      style={styles.td}
                    >
                      No Areas Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <AdminFooter />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>
              {editAreaId
                ? "Edit Area"
                : "Add New Area"}
            </h3>
            <input
              type="text"
              placeholder="Enter Area Name"
              value={areaName}
              onChange={(e) =>
                setAreaName(e.target.value)
              }
              style={styles.input}
              autoFocus
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleSave}
                style={styles.saveButton}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditAreaId(null);
                  setAreaName("");
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {areaToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Delete Area</h3>
            <p>
              Are you sure you want to delete{" "}
              <b>
                {areaToDelete.area_name}
              </b>
              ?
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleDelete}
                style={styles.deleteButton}
              >
                Delete
              </button>
              <button
                onClick={() =>
                  setAreaToDelete(null)
                }
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

const styles = {
  searchBox: {
    width: "80%",
    padding: "10px",
    marginBottom: "15px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
    marginLeft: 10,
    marginBottom: 10,
  },
  tableWrapper: {
    width: "90%",
    margin: "auto",
    overflowX: "auto",
    borderRadius: "10px",
    padding: "15px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "center",
  },
  td: {
    padding: "12px",
    textAlign: "center",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  editButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    marginRight: 6,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  input: {
    width: "90%",
    padding: "10px",
    marginBottom: "15px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "10px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
  },
};

export default ManageAreas;
