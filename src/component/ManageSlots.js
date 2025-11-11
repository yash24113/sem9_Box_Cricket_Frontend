// src/pages/admin/ManageSlots.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";
import "../ManageSlots.css";
import Pagination from "./Pagination";

const styles = {
  container: { textAlign: "center", marginTop: "10px", width: "100%" },
  heading: { color: "#333", fontSize: "26px", margin: "10px" },
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
    marginBottom: "10px",
    marginLeft: "10px",
  },
  tableWrapper: {
    width: "90%",
    margin: "auto",
    overflowX: "auto",
    borderRadius: "10px",
    padding: "15px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "center",
    cursor: "pointer",
  },
  td: { padding: "12px", textAlign: "center" },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#ffffff" },
  editButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    marginRight: "5px",
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
    margin: "10px 0",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  saveButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 15px",
    margin: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "10px 15px",
    margin: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
  },
};

const API_ROOT = (
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api/userapi"
).replace(/\/+$/, "");

/* ---------- helpers ---------- */

function getStoredUser() {
  // from /login response, you stored something in loggedInUser/adminUser
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data) return parsed.data;
      if (parsed?.user) return parsed.user;
      if (parsed?.email || parsed?.role) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse loggedInUser:", e);
  }

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

// match admin.address === area.area_name (case-insensitive, trimmed)
function addressEqualsAreaName(address, areaName) {
  if (!address || !areaName) return false;
  return (
    String(address).trim().toLowerCase() ===
    String(areaName).trim().toLowerCase()
  );
}

const ManageSlots = () => {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [slotData, setSlotData] = useState({
    areaname: "",
    start_time: "",
    end_time: "",
    price: "",
  });

  const [slots, setSlots] = useState([]); // scoped slots
  const [areasAllowed, setAreasAllowed] = useState([]); // scoped areas

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const user = useMemo(() => getStoredUser(), []);
  const role = useMemo(() => {
    if (user?.role) return user.role;
    if (user?.email === "superadmin@gmail.com") return "superadmin";
    return "user";
  }, [user]);

  const adminAddress = String(user?.address || "").trim();
  const adminState = String(user?.state || "").trim(); // used only for label

  // Attach token if present
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);

      const [areaRes, slotRes] = await Promise.all([
        axios.get(`${API_ROOT}/viewArea`),
        axios.get(`${API_ROOT}/viewAreaWiseSlot`),
      ]);

      const allAreas = areaRes?.data?.data || [];
      const allSlots = slotRes?.data?.data || [];

      let allowedAreas = allAreas;
      let allowedSlots = allSlots;

      if (role === "admin" && adminAddress) {
        // only areas where area.area_name == admin.address
        allowedAreas = allAreas.filter((a) =>
          addressEqualsAreaName(adminAddress, a.area_name)
        );

        // only slots whose populated area_name == admin.address
        allowedSlots = allSlots.filter((s) =>
          addressEqualsAreaName(
            adminAddress,
            s?.area?.area_name
          )
        );
      }

      // superadmin & others: no restriction (if you want, you can restrict "user" later)

      setAreasAllowed(allowedAreas);
      setSlots(allowedSlots);

      try {
        localStorage.setItem(
          "allowedAreasForDropdown",
          JSON.stringify(allowedAreas)
        );
      } catch {
        // ignore
      }
    } catch (error) {
      console.error("Error fetching slots/areas:", error);
      toast.error("Error fetching slots/areas");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSlotData({ ...slotData, [e.target.name]: e.target.value });
  };

  const openModal = (id = null) => {
    if (id) {
      const slot = slots.find((s) => s._id === id);
      if (slot) {
        setSlotData({
          areaname: slot.area?.area_name || "",
          start_time: slot.slot_start_time || "",
          end_time: slot.slot_end_time || "",
          price: slot.price || "",
        });
        setEditId(id);
      }
    } else {
      // default area for admin -> their address if exists in allowedAreas
      let defaultArea = "";
      if (role === "admin" && adminAddress) {
        const match = areasAllowed.find((a) =>
          addressEqualsAreaName(adminAddress, a.area_name)
        );
        if (match) defaultArea = match.area_name;
      } else if (areasAllowed.length === 1) {
        defaultArea = areasAllowed[0].area_name;
      }

      setSlotData({
        areaname: defaultArea,
        start_time: "",
        end_time: "",
        price: "",
      });
      setEditId(null);
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = async () => {
    const { areaname, start_time, end_time, price } = slotData;

    if (!areaname || !start_time || !end_time || !price) {
      toast.warning("All fields are required");
      return;
    }

    // ensure area is from allowedAreas
    const area = areasAllowed.find(
      (a) =>
        String(a.area_name).trim() ===
        String(areaname).trim()
    );
    if (!area) {
      toast.error("Please select a valid area");
      return;
    }

    // extra guard: for admin, enforce address === area.area_name
    if (
      role === "admin" &&
      adminAddress &&
      !addressEqualsAreaName(adminAddress, area.area_name)
    ) {
      toast.error(
        "You can only manage slots for your assigned area."
      );
      return;
    }

    const payload = {
      area: area._id,
      slot_start_time: start_time,
      slot_end_time: end_time,
      price,
    };

    try {
      if (editId) {
        await axios.put(
          `${API_ROOT}/updateAreaWiseSlot/${editId}`,
          payload
        );
        toast.success("Slot updated successfully");
      } else {
        await axios.post(
          `${API_ROOT}/addAreaWiseSlot`,
          payload
        );
        toast.success("Slot added successfully");
      }
      await fetchSlots();
      closeModal();
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("Error saving slot");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?"))
      return;
    try {
      await axios.delete(
        `${API_ROOT}/deleteAreaWiseSlot/${id}`
      );
      toast.success("Slot deleted successfully");
      await fetchSlots();
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Error deleting slot");
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, areasAllowed.length, role]);

  // Filter (on already scoped slots)
  const filteredSlots = slots.filter((slot) => {
    const areaName =
      slot.area?.area_name?.toLowerCase() || "";
    const startTime =
      slot.slot_start_time?.toLowerCase() || "";
    const endTime =
      slot.slot_end_time?.toLowerCase() || "";
    const price =
      slot.price?.toString().toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return (
      areaName.includes(term) ||
      startTime.includes(term) ||
      endTime.includes(term) ||
      price.includes(term)
    );
  });

  // Sort
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = (a[sortConfig.key] ?? "").toString();
    const bVal = (b[sortConfig.key] ?? "").toString();

    if (sortConfig.direction === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Paginate
  const totalPages = Math.ceil(
    sortedSlots.length / itemsPerPage
  );
  const paginatedSlots = sortedSlots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc"
        ? "🔼"
        : "🔽";
    }
    return "⇅";
  };

  return (
    <div style={styles.container}>
      <AdminHeader />
      <div
        className="manage-slots-content"
        style={{ display: "flex" }}
      >
        <AdminSidebar />

        <div
          style={{
            ...styles.tableWrapper,
            marginTop: "10px",
            flex: 1,
          }}
        >
          <h1 style={styles.heading}>
            Manage Area-wise Slots
          </h1>

          {role === "admin" && (
            <p
              style={{
                marginTop: -6,
                color: "#6b7280",
              }}
            >
              Showing slots for your assigned area:{" "}
              <b>
                {adminAddress || "Not set"}
              </b>
              {adminState ? `, ${adminState}` : ""}
            </p>
          )}

          <input
            style={styles.searchBox}
            type="text"
            placeholder="Search by Area, Start Time, End Time, Price"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
          <button
            style={styles.addButton}
            onClick={() => openModal()}
          >
            + Add Slot
          </button>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Slot ID</th>
                <th style={styles.th}>Area Name</th>
                <th
                  style={styles.th}
                  onClick={() =>
                    requestSort(
                      "slot_start_time"
                    )
                  }
                >
                  Start Time{" "}
                  {getSortIcon(
                    "slot_start_time"
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() =>
                    requestSort(
                      "slot_end_time"
                    )
                  }
                >
                  End Time{" "}
                  {getSortIcon(
                    "slot_end_time"
                  )}
                </th>
                <th
                  style={styles.th}
                  onClick={() =>
                    requestSort("price")
                  }
                >
                  Price {getSortIcon("price")}
                </th>
                <th style={styles.th}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={styles.td}
                  >
                    Loading…
                  </td>
                </tr>
              ) : paginatedSlots.length >
                0 ? (
                paginatedSlots.map(
                  (slot, idx) => (
                    <tr
                      key={slot._id}
                      style={
                        idx % 2 === 0
                          ? styles.evenRow
                          : styles.oddRow
                      }
                    >
                      <td style={styles.td}>
                        {slot._id}
                      </td>
                      <td style={styles.td}>
                        {slot.area
                          ?.area_name ||
                          "N/A"}
                      </td>
                      <td style={styles.td}>
                        {slot.slot_start_time ||
                          "N/A"}
                      </td>
                      <td style={styles.td}>
                        {slot.slot_end_time ||
                          "N/A"}
                      </td>
                      <td style={styles.td}>
                        ₹{slot.price}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={
                            styles.editButton
                          }
                          onClick={() =>
                            openModal(
                              slot._id
                            )
                          }
                        >
                          ✏️
                        </button>
                        <button
                          style={
                            styles.deleteButton
                          }
                          onClick={() =>
                            handleDelete(
                              slot._id
                            )
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
                    colSpan="6"
                    style={styles.td}
                  >
                    No slots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={
              setCurrentPage
            }
          />
        </div>
      </div>

      <AdminFooter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>
              {editId
                ? "Edit Slot"
                : "Add New Slot"}
            </h3>

            <select
              style={styles.input}
              name="areaname"
              value={slotData.areaname}
              onChange={handleChange}
            >
              <option value="">
                Select Area
              </option>
              {areasAllowed.map(
                (area) => (
                  <option
                    key={
                      area._id
                    }
                    value={
                      area.area_name
                    }
                  >
                    {
                      area.area_name
                    }
                  </option>
                )
              )}
            </select>

            <input
              style={styles.input}
              type="time"
              name="start_time"
              value={
                slotData.start_time
              }
              onChange={
                handleChange
              }
            />
            <input
              style={styles.input}
              type="time"
              name="end_time"
              value={
                slotData.end_time
              }
              onChange={
                handleChange
              }
            />
            <input
              style={styles.input}
              type="number"
              name="price"
              value={
                slotData.price
              }
              onChange={
                handleChange
              }
              placeholder="Price"
              min="0"
            />

            <button
              style={styles.saveButton}
              onClick={handleSave}
            >
              Save
            </button>
            <button
              style={styles.cancelButton}
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSlots;
