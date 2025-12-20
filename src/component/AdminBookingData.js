import React, { useEffect, useState } from "react";
import {
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

// Snackbar
const CustomSnackbar = styled(Snackbar)({
  "& .MuiSnackbarContent-root": {
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    minWidth: "300px",
  },
});

// Small helper to normalize strings for comparison
const normalize = (val) =>
  (val ?? "").toString().trim().toLowerCase();

const AdminBookingData = () => {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Logged-in user
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const userRole = loggedInUser?.role || "superadmin"; // default fallback
  const adminAddress = normalize(loggedInUser?.address || "");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://sem9-box-cricket-backend.onrender.com/api/userapi";

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      const [bookingRes, slotRes, areaRes, userRes] = await Promise.all([
        axios.get(`${API_BASE}/viewBooking`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }),
        axios.get(`${API_BASE}/viewAreaWiseSlot`),
        axios.get(`${API_BASE}/viewArea`),
        axios.get(`${API_BASE}/viewUser`),
      ]);

      let fetchedBookings = bookingRes.data?.data || [];
      const allAreas = areaRes.data?.data || [];

      // ===== ROLE-BASED FILTERING =====
      if (userRole === "admin" && adminAddress) {
        // Filter bookings where area matches admin's address
        let filteredForAdmin = fetchedBookings.filter((b) => {
          const bookingAreaName = normalize(b.area_name);

          let areaNameFromCollection = "";
          const areaFromCollection = allAreas.find(
            (a) => String(a._id) === String(b.area_id)
          );
          if (areaFromCollection?.area_name) {
            areaNameFromCollection = normalize(areaFromCollection.area_name);
          }

          const effectiveAreaName =
            bookingAreaName || areaNameFromCollection;

          return (
            effectiveAreaName &&
            effectiveAreaName === adminAddress
          );
        });

        // If nothing matched (e.g. address mismatch), show all bookings
        if (filteredForAdmin.length > 0) {
          fetchedBookings = filteredForAdmin;
        }
      }

      setBookings(fetchedBookings);
      setSlots(slotRes.data?.data || []);
      setAreas(allAreas);
      setUsers(userRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching admin booking data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ADMIN / SUPERADMIN CANCEL API
  const handleCancelBooking = async () => {
    try {
      if (!selectedBooking?._id) return;

      await axios.delete(
        `${API_BASE}/admin-cancel-booking/${selectedBooking._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBookings((prev) =>
        prev.filter((b) => b._id !== selectedBooking._id)
      );
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Admin cancel booking error:", error);
      alert("Failed to cancel booking. Check console.");
    }
  };

  const findSlotInfo = (slotId) =>
    slots.find((s) => String(s._id) === String(slotId?._id || slotId));

  // Get area name directly from booking + Area collection fallback
  const findAreaName = (booking) => {
    if (!booking) return "N/A";

    const areaFromCollection = areas.find(
      (a) => String(a._id) === String(booking.area_id)
    );

    return (
      areaFromCollection?.area_name ||
      booking.area_name ||
      "N/A"
    );
  };

  const findUserInfo = (userId) =>
    users.find((u) => String(u._id) === String(userId));

  if (loading) {
    return (
      <div style={styles.loader}>
        <CircularProgress />
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AdminHeader />

      <div style={styles.mainSection}>
        <AdminSidebar />

        <div style={styles.content}>
          <h2 style={styles.heading}>
            {userRole === "superadmin"
              ? "All Bookings"
              : `Bookings of My Area (${loggedInUser?.address || "N/A"})`}
          </h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Area</th>
                  <th style={styles.th}>Slot</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Advance</th>
                  <th style={styles.th}>Due</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking, i) => {
                    const slot = findSlotInfo(booking.slot_id);
                    const areaName = findAreaName(booking);
                    const user = findUserInfo(booking.user_id);

                    return (
                      <tr
                        key={booking._id || i}
                        style={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                      >
                        <td style={styles.td}>
                          {user
                            ? `${user.fname || ""} ${user.lname || ""}`.trim()
                            : "N/A"}
                        </td>
                        <td style={styles.td}>
                          {user?.email || booking.email}
                        </td>
                        <td style={styles.td}>
                          {user?.mobile || booking.mobile}
                        </td>
                        <td style={styles.td}>{areaName}</td>
                        <td style={styles.td}>
                          {slot
                            ? `${slot.slot_start_time} - ${slot.slot_end_time}`
                            : booking.start_time && booking.end_time
                            ? `${booking.start_time} - ${booking.end_time}`
                            : "N/A"}
                        </td>
                        <td style={styles.td}>
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>₹{booking.price}</td>
                        <td style={styles.td}>₹{booking.advance_payment}</td>
                        <td style={styles.td}>₹{booking.due_payment}</td>

                        <td style={styles.td}>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setOpenDialog(true);
                            }}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={styles.noData}>
                      No bookings available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminFooter />

      {/* Cancel Popup */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to cancel this booking?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>No</Button>
          <Button color="error" onClick={handleCancelBooking}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={openSnackbar}
        autoHideDuration={3000}
        message="Booking cancelled successfully!"
        onClose={() => setOpenSnackbar(false)}
      />
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh" },
  mainSection: { display: "flex", flex: 1 },
  content: { flex: 1, padding: "20px", textAlign: "center" },
  heading: {
    color: "#333",
    fontSize: "26px",
    marginBottom: "20px",
  },
  tableWrapper: {
    width: "90%",
    margin: "auto",
    overflowX: "auto",
    borderRadius: "10px",
    backgroundColor: "white",
    padding: "15px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
  },
  td: {
    padding: "12px",
    textAlign: "center",
    borderBottom: "1px solid #ddd",
  },
  evenRow: { backgroundColor: "#f8f9fa" },
  oddRow: { backgroundColor: "#ffffff" },
  noData: {
    padding: "20px",
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
  },
  loader: { textAlign: "center", padding: "40px" },
};

export default AdminBookingData;
