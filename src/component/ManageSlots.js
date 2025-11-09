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
  searchBox: { width: "80%", padding: "10px", marginBottom: "15px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" },
  addButton: { backgroundColor: "#007bff", color: "white", padding: "10px", borderRadius: "5px", cursor: "pointer", border: "none", marginBottom: "10px" },
  tableWrapper: { width: "90%", margin: "auto", overflowX: "auto", borderRadius: "10px", padding: "15px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { backgroundColor: "#007bff", color: "white", padding: "12px", textAlign: "center", cursor: "pointer" },
  td: { padding: "12px", textAlign: "center" },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#ffffff" },
  editButton: { backgroundColor: "#28a745", color: "white", padding: "6px 12px", cursor: "pointer", borderRadius: "5px", border: "none", marginRight: "5px" },
  deleteButton: { backgroundColor: "#dc3545", color: "white", padding: "6px 12px", cursor: "pointer", borderRadius: "5px", border: "none" },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
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

const API_ROOT = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/userapi";

function matchesAdminAddress(areaName, city, state, address) {
  const a = String(areaName || "").toLowerCase().trim();
  const c = String(city || "").toLowerCase().trim();
  const s = String(state || "").toLowerCase().trim();
  const ad = String(address || "").toLowerCase();

  if (!a) return false;
  if (c && a === c) return true;          // exact city match
  if (s && a === s) return true;          // (rare) exact state match
  if (ad && ad.includes(a)) return true;  // area string appears in full address
  return false;
}

const ManageSlots = () => {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [slotData, setSlotData] = useState({ areaname: "", start_time: "", end_time: "", price: "" });

  const [slots, setSlots] = useState([]);               // visible slots (already scoped)
  const [areasAllowed, setAreasAllowed] = useState([]); // allowed areas for dropdown (already scoped)

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // who is logged in (scope)
  const loginBlob = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; }
  }, []);
  const currentUser = loginBlob?.data || null;
  const role =
    currentUser?.role ||
    (currentUser?.email === "superadmin@gmail.com" ? "superadmin" : "user");
  const adminCity   = String(currentUser?.city || "").trim();
  const adminState  = String(currentUser?.state || "").trim();
  const adminAddr   = String(currentUser?.address || "").trim();

  // token header (optional)
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const [areaRes, slotRes] = await Promise.all([
        axios.get(`${API_ROOT}/viewArea`),
        axios.get(`${API_ROOT}/viewAreaWiseSlot`)
      ]);

      const allAreas = areaRes?.data?.data || [];
      const allSlots = slotRes?.data?.data || [];

      // Scope areas & slots unless superadmin
      const allowedAreas = (role === "superadmin")
        ? allAreas
        : allAreas.filter(a => matchesAdminAddress(a?.area_name, adminCity, adminState, adminAddr));

      const allowedSlots = (role === "superadmin")
        ? allSlots
        : allSlots.filter(s => matchesAdminAddress(s?.area?.area_name, adminCity, adminState, adminAddr));

      setAreasAllowed(allowedAreas);
      setSlots(allowedSlots);

      // Also expose allowed areas for other pages (optional)
      try {
        localStorage.setItem("allowedAreasForDropdown", JSON.stringify(allowedAreas));
      } catch {}

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("❌ Error fetching data!");
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
      // Preselect admin's city if present in allowed areas; otherwise blank
      const defaultArea =
        areasAllowed.find(a => adminCity && a.area_name.toLowerCase() === adminCity.toLowerCase())
          ?.area_name || "";
      setSlotData({ areaname: defaultArea, start_time: "", end_time: "", price: "" });
      setEditId(null);
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = async () => {
    if (!slotData.areaname || !slotData.start_time || !slotData.end_time || !slotData.price) {
      toast.warning("⚠️ All fields are required!");
      return;
    }

    try {
      // Must pick from allowed areas only
      const area = areasAllowed.find((a) => a.area_name === slotData.areaname);
      if (!area) {
        toast.error("❌ Please select a valid area (scoped to your address).");
        return;
      }

      const newSlotData = {
        area: area._id,
        slot_start_time: slotData.start_time,
        slot_end_time: slotData.end_time,
        price: slotData.price,
      };

      if (editId) {
        await axios.put(`${API_ROOT}/updateAreaWiseSlot/${editId}`, newSlotData);
        toast.success("✅ Slot updated successfully");
      } else {
        await axios.post(`${API_ROOT}/addAreaWiseSlot`, newSlotData);
        toast.success("✅ Slot added successfully");
      }

      fetchSlots();
      closeModal();
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("❌ Error saving slot. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await axios.delete(`${API_ROOT}/deleteAreaWiseSlot/${id}`);
        toast.success("✅ Slot deleted successfully");
        fetchSlots();
      } catch (error) {
        console.error("Error deleting slot:", error);
        toast.error("❌ Error deleting slot. Please try again.");
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, areasAllowed.length, role]);

  // Filter → Sort → Paginate (on already-scoped slots)
  const filteredSlots = slots.filter((slot) => {
    const areaName = slot.area?.area_name?.toLowerCase() || "";
    const startTime = slot.slot_start_time?.toLowerCase() || "";
    const endTime = slot.slot_end_time?.toLowerCase() || "";
    const price = slot.price?.toString().toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return areaName.includes(term) || startTime.includes(term) || endTime.includes(term) || price.includes(term);
  });

  const sortedSlots = [...filteredSlots].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = (a[sortConfig.key] ?? "").toString();
    const bValue = (b[sortConfig.key] ?? "").toString();
    if (sortConfig.direction === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedSlots.length / itemsPerPage);
  const paginatedSlots = sortedSlots.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "🔼" : "🔽";
    return "⇅";
  };

  return (
    <div style={styles.container}>
      <AdminHeader />
      <div className="manage-slots-content" style={{ display: "flex" }}>
        <AdminSidebar />

        <div style={{ ...styles.tableWrapper, marginTop: "10px", flex: 1 }}>
          <h1 style={styles.heading}>Manage Area-wise Slots</h1>

          {/* Scope hint for admins */}
          {role !== "superadmin" ? (
            <p style={{ marginTop: -6, color: "#6b7280" }}>
              Showing areas/slots for: <b>{adminCity || "—"}</b>{adminState ? `, ${adminState}` : ""}
            </p>
          ) : null}

          <input
            style={styles.searchBox}
            type="text"
            placeholder="Search by Area, Start Time, End Time, Price"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button style={styles.addButton} onClick={() => openModal()}>+ Add Slot</button>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Slot ID</th>
                <th style={styles.th}>Area Name</th>
                <th style={styles.th} onClick={() => requestSort("slot_start_time")}>
                  Start Time {getSortIcon("slot_start_time")}
                </th>
                <th style={styles.th} onClick={() => requestSort("slot_end_time")}>
                  End Time {getSortIcon("slot_end_time")}
                </th>
                <th style={styles.th} onClick={() => requestSort("price")}>
                  Price {getSortIcon("price")}
                </th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={styles.td}>Loading…</td></tr>
              ) : paginatedSlots.length > 0 ? (
                paginatedSlots.map((slot, idx) => (
                  <tr key={slot._id} style={idx % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}>{slot._id}</td>
                    <td style={styles.td}>{slot.area?.area_name || "N/A"}</td>
                    <td style={styles.td}>{slot.slot_start_time || "N/A"}</td>
                    <td style={styles.td}>{slot.slot_end_time || "N/A"}</td>
                    <td style={styles.td}>₹{slot.price}</td>
                    <td style={styles.td}>
                      <button style={styles.editButton} onClick={() => openModal(slot._id)}>✏️</button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(slot._id)}>✖️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={styles.td}>No slots found.</td></tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AdminFooter />
      <ToastContainer position="top-right" autoClose={3000} />

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{editId ? "Edit Slot" : "Add New Slot"}</h3>

            {/* AREA DROPDOWN — filtered by admin address (areasAllowed) */}
            <select
              style={styles.input}
              name="areaname"
              value={slotData.areaname}
              onChange={handleChange}
            >
              <option value="">Select Area</option>
              {areasAllowed.map((area) => (
                <option key={area._id} value={area.area_name}>
                  {area.area_name}
                </option>
              ))}
            </select>

            <input
              style={styles.input}
              type="time"
              name="start_time"
              value={slotData.start_time}
              onChange={handleChange}
            />
            <input
              style={styles.input}
              type="time"
              name="end_time"
              value={slotData.end_time}
              onChange={handleChange}
            />
            <input
              style={styles.input}
              type="number"
              name="price"
              value={slotData.price}
              onChange={handleChange}
              placeholder="Price"
              min="0"
            />

            <button style={styles.saveButton} onClick={handleSave}>Save</button>
            <button style={styles.cancelButton} onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSlots;
