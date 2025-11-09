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

// Custom Snackbar Styling
const CustomSnackbar = styled(Snackbar)({
  "& .MuiSnackbarContent-root": {
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    minWidth: "300px",
    minHeight: "60px",
    textAlign: "center",
  },
});

const AdminBookingData = () => {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [bookingRes, slotRes, areaRes, userRes] = await Promise.all([
        axios.get("http://localhost:5000/api/userapi/viewBooking"),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewAreaWiseSlot`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewArea`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewUser`), // <-- New API to fetch users
      ]);

      if (bookingRes.data && bookingRes.data.data) {
        setBookings(bookingRes.data.data);
      }
      setSlots(slotRes.data.data || []);
      setAreas(areaRes.data.data || []);
      setUsers(userRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      if (selectedBooking?._id) {
        // Ideally call API to cancel booking
         await axios.delete(`http://localhost:5000/api/userapi/cancel-booking/${selectedBooking._id}`);

        setBookings(prev => prev.filter(b => b._id !== selectedBooking._id));

        setOpenDialog(false);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const findSlotInfo = (slotId) => {
    return slots.find(slot => slot._id === (slotId?._id || slotId));
  };

  const findAreaName = (slot) => {
    if (!slot) return "N/A";

    if (slot.area?.area_name) {
      return slot.area.area_name;
    } else if (slot.area) {
      const area = areas.find(a => String(a._id) === String(slot.area));
      return area?.area_name || "N/A";
    }
    return "N/A";
  };

  const findUserInfo = (userId) => {
    return users.find(user => String(user._id) === String(userId));
  };

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
          <h2 style={styles.heading}>User Booking Details</h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Area</th>
                  <th style={styles.th}>Slot Time</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Advance</th>
                  <th style={styles.th}>Due</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => {
                    const matchedSlot = findSlotInfo(booking.slot_id);
                    const areaName = findAreaName(matchedSlot);
                    const matchedUser = findUserInfo(booking.user_id);

                    return (
                      <tr
                        key={booking._id || index}
                        style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                      >
                        <td style={styles.td}>
                          {matchedUser ? `${matchedUser.fname} ${matchedUser.lname}` : "N/A"}
                        </td>
                        <td style={styles.td}>
                          {matchedUser?.email || "N/A"}
                        </td>
                        <td style={styles.td}>
                          {matchedUser?.mobile || "N/A"}
                        </td>
                        <td style={styles.td}>{areaName}</td>
                        <td style={styles.td}>
                          {matchedSlot
                            ? `${matchedSlot.slot_start_time} - ${matchedSlot.slot_end_time}`
                            : "N/A"}
                        </td>
                        <td style={styles.td}>
                          {booking.date
                            ? new Date(booking.date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td style={styles.td}>₹{booking.price || 0}</td>
                        <td style={styles.td}>₹{booking.advance_payment || 0}</td>
                        <td style={styles.td}>₹{booking.due_payment || 0}</td>
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
                      No Bookings Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminFooter />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to cancel this booking?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={handleCancelBooking} color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <CustomSnackbar
        open={openSnackbar}
        autoHideDuration={3000}
        message="Booking canceled successfully!"
        onClose={() => setOpenSnackbar(false)}
      />
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  mainSection: {
    display: "flex",
    flex: 1,
  },
  content: {
    flex: 1,
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    color: "#333",
    fontSize: "26px",
    marginBottom: "20px",
    textTransform: "uppercase",
  },
  tableWrapper: {
    width: "90%",
    margin: "auto",
    overflowX: "auto",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    backgroundColor: "white",
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
    borderBottom: "2px solid #ddd",
    textAlign: "center",
    fontSize: "16px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
    fontSize: "14px",
    color: "#333",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  noData: {
    textAlign: "center",
    padding: "15px",
    color: "red",
    fontWeight: "bold",
    fontSize: "18px",
  },
  loader: {
    textAlign: "center",
    padding: "40px",
  },
};

export default AdminBookingData;
