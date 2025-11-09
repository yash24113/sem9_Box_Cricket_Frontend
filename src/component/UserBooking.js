import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { margin, styled } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentsIcon from "@mui/icons-material/Payments";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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

const SuccessAnimation = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "20px",
  animation: "fadeIn 0.5s ease-in-out",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "scale(0.5)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
});

const UserBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [areas, setAreas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [cancelProcessing, setCancelProcessing] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))?.data;

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUser?._id) {
        setLoading(false);
        return;
      }
      try {
        const [bookingRes, slotRes, areaRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/userapi/user-booking/${loggedInUser._id}`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewAreaWiseSlot`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewArea`),
        ]);

        const fetchedBookings = Array.isArray(bookingRes.data)
          ? bookingRes.data
          : bookingRes.data
          ? [bookingRes.data]
          : [];

        setBookings(fetchedBookings);
        setSlots(slotRes.data.data || []);
        setAreas(areaRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUser]);

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;

    setCancelProcessing(true);
    setOpenDialog(false);

    try {
      await axios.delete(`http://localhost:5000/api/userapi/cancel-booking/${selectedBookingId}`);
      setOpenSuccessModal(true);
      setSnackbarOpen(true);
      setTimeout(() => {
        setOpenSuccessModal(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setSelectedBookingId(null);
      setCancelProcessing(false);
    }
  };

  const openCancelDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setOpenDialog(true);
  };

  if (loading || cancelProcessing) {
    return (
      <div style={styles.loader}>
        <CircularProgress />
        <p>Cancel booking under processing, please wait...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>📅 Your Bookings</h2>

      {loggedInUser && (
        <div style={styles.userInfoCard}>
          <p>
            <AccountCircleIcon style={styles.icon} />
            {loggedInUser.fname} {loggedInUser.lname}
          </p>
          <p>
            <EmailIcon style={styles.icon} />
            {loggedInUser.email}
          </p>
          <p>
            <PhoneIcon style={styles.icon} />
            {loggedInUser.mobile}
          </p>
        </div>
      )}

      {bookings.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {bookings.map((booking) => {
            const matchedSlot = slots.find(
              (slot) => slot._id === (booking?.slot_id?._id || booking?.slot_id)
            );

            let matchedAreaName = "N/A";

            if (matchedSlot) {
              if (matchedSlot.area?.area_name) {
                matchedAreaName = matchedSlot.area.area_name;
              } else if (matchedSlot.area) {
                const matchedArea = areas.find(
                  (area) => String(area._id) === String(matchedSlot.area)
                );
                matchedAreaName = matchedArea?.area_name || "N/A";
              }
            }

            return (
              <Grid item xs={12} sm={6} md={4} key={booking._id}>
                <div style={styles.card}>
                  <h3>
                    <PlaceIcon style={styles.icon} />
                    Area Name: {matchedAreaName}
                  </h3>

                  <p>
                    <ReceiptIcon style={styles.icon} />
                    <strong>Transaction ID:</strong> {booking?._id || "N/A"}
                  </p>

                  <p>
                    <AccessTimeIcon style={styles.icon} />
                    <strong>Slot Time:</strong>{" "}
                    {matchedSlot
                      ? `${matchedSlot.slot_start_time} to ${matchedSlot.slot_end_time}`
                      : "N/A"}
                  </p>

                  <p>
                    <CalendarTodayIcon style={styles.icon} />
                    <strong>Booking Date:</strong>{" "}
                    {booking?.date
                      ? new Date(booking.date).toLocaleDateString("en-GB")
                      : "N/A"}
                  </p>

                  <p>
                    <AttachMoneyIcon style={styles.icon} />
                    <strong>Price:</strong> ₹{booking?.price || 0}
                  </p>

                  <p>
                    <PaymentsIcon style={styles.icon} />
                    <strong>Advance Payment:</strong> ₹{booking?.advance_payment || 0}
                  </p>

                  <p>
                    <MoneyOffIcon style={styles.icon} />
                    <strong>Due Payment:</strong> ₹{booking?.due_payment || 0}
                  </p>

                  <p>
                    <PaymentIcon style={styles.icon} />
                    <strong>Payment Status:</strong>{" "}
                    <span
                      style={{
                        color: booking?.payment_status === "Succeeded" ? "green" : "red",
                      }}
                    >
                      {booking?.payment_status || "Pending"}
                    </span>
                  </p>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => openCancelDialog(booking._id)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <p>No bookings found.</p>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to cancel your booking?</p>
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

      {/* Success Modal */}
      <Dialog
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Booking Cancelled Successfully
          <IconButton
            aria-label="close"
            onClick={() => setOpenSuccessModal(false)}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#555",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <SuccessAnimation>
            <CheckCircleOutlineIcon style={{ fontSize: "80px", color: "green" }} />
            <Typography variant="body1" align="center" style={{ marginTop: "10px" }}>
              Your advance payment will be returned within 7 working days.
            </Typography>
          </SuccessAnimation>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      {/* Uncomment if needed
      <CustomSnackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Booking cancelled successfully!"
      /> */}
    </div>
  );
};

// Updated Styles
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    marginTop:"-25px"
  },
  userInfoCard: {
    backgroundColor: "#e8f5e9",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    margin: "5px auto",
    textAlign: "left",

  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    maxWidth: "350px",
    margin: "0 auto",  // center inside grid
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  loader: {
    textAlign: "center",
    padding: "40px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    verticalAlign: "middle",
    marginRight: "6px",
    color: "#555",
  },
};

export default UserBooking;
