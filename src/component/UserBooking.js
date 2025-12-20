// src/pages/UserBooking.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Typography,
  Rating,
  TextField,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  Paper,
  Alert,
} from "@mui/material";

import { styled } from "@mui/system";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DownloadIcon from "@mui/icons-material/Download";
import { format } from "date-fns";

// Snackbar styling
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

// Base API
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/userapi";

// Axios instance
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// UserBooking Component
const UserBooking = () => {
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [cancelProcessing, setCancelProcessing] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Load logged-in user
  useEffect(() => {
    try {
      const raw = localStorage.getItem("loggedInUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = parsed?.data || parsed?.user || parsed;
        setLoggedInUser(user);
      }
    } catch {
      setLoggedInUser(null);
    }
  }, []);

  // Load all bookings for this user
  const fetchBookings = async () => {
    if (!loggedInUser?._id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/my-bookings`);
      setBookings(data?.data || []);
    } catch (error) {
      const msg =
        error?.response?.status === 401
          ? "Session expired. Please login again."
          : "Failed to load bookings.";

      setSnackbar({ open: true, message: msg, severity: "error" });
      if (error?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser) fetchBookings();
  }, [loggedInUser]);

  // Cancel Booking
  const handleCancelBooking = async () => {
    if (!selectedBooking?._id) return;
    setCancelProcessing(true);
    setOpenDialog(false);

    try {
      await api.delete(`/cancel-booking/${selectedBooking._id}`);

      setSnackbar({
        open: true,
        message: "Booking cancelled successfully",
        severity: "success",
      });

      fetchBookings();
    } catch (error) {
      let msg = "Failed to cancel booking.";

      if (error?.response?.data?.error) msg = error.response.data.error;
      if (error?.response?.status === 401) msg = "Session expired. Login again.";

      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSelectedBooking(null);
      setCancelProcessing(false);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async () => {
    if (!selectedBooking || !rating) return;
    setFeedbackSubmitting(true);

    try {
      await api.post(`/bookings/${selectedBooking._id}/feedback`, {
        rating,
        comment,
      });

      setSnackbar({
        open: true,
        message: "Thank you for your feedback!",
        severity: "success",
      });

      fetchBookings();
      setOpenFeedbackDialog(false);
      setSelectedBooking(null);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to submit feedback",
        severity: "error",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Status Chip
  const getStatusChip = (status) => {
    switch (status) {
      case "upcoming":
        return <Chip label="Upcoming" color="primary" size="small" />;
      case "completed":
        return <Chip label="Completed" color="success" size="small" />;
      case "cancelled":
        return <Chip label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status || "Unknown"} size="small" />;
    }
  };

  // Ticket Download
  const downloadTicket = (bookingId) => {
    window.open(`${API_BASE}/download-ticket/${bookingId}`, "_blank");
  };

  // UI Rendering
  if (loading && !cancelProcessing) {
    return (
      <div style={styles.loader}>
        <CircularProgress />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        📅 My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>No bookings found</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/arealist")}
            sx={{ mt: 2 }}
          >
            Book a Slot
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking._id}>
              <Card elevation={3}>
                <CardContent>
                  {/* HEADER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        <PlaceIcon sx={{ mr: 1 }} color="primary" />
                        {booking?.area_id?.area_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Booking ID: {booking._id}
                      </Typography>
                    </Box>

                    {getStatusChip(booking.booking_status)}
                  </Box>

                  {/* DETAILS */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography>
                        <AccessTimeIcon sx={{ mr: 1 }} />
                        <b>Time:</b> {booking.start_time} - {booking.end_time}
                      </Typography>

                      <Typography>
                        <CalendarTodayIcon sx={{ mr: 1 }} />
                        <b>Date:</b>{" "}
                        {booking.date
                          ? format(new Date(booking.date), "PPP")
                          : "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography>
                        <AttachMoneyIcon sx={{ mr: 1 }} />
                        <b>Total Amount:</b> ₹{booking.price}
                      </Typography>

                      <Typography>
                        <PaymentIcon sx={{ mr: 1 }} />
                        <b>Paid Amount:</b> ₹{booking.advance_payment}
                      </Typography>

                      <Typography>
                        <PaymentIcon sx={{ mr: 1, color: "red" }} />
                        <b>Due Amount:</b>{" "}
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ₹{booking.due_payment}
                        </span>
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* ACTIONS */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <b>Booked on:</b>{" "}
                      {booking.created_at
                        ? format(new Date(booking.created_at), "PPPp")
                        : "N/A"}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => downloadTicket(booking._id)}
                      >
                        Ticket
                      </Button>

                      {booking.booking_status === "completed" &&
                        !booking.feedback_submitted && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<FeedbackIcon />}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setOpenFeedbackDialog(true);
                            }}
                          >
                            Feedback
                          </Button>
                        )}

                      {booking.booking_status === "upcoming" && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setOpenDialog(true);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this booking?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>No</Button>
          <Button color="error" onClick={handleCancelBooking}>
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback dialog */}
      <Dialog
        open={openFeedbackDialog}
        onClose={() => setOpenFeedbackDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Share Feedback</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            How was your experience at{" "}
            <b>{selectedBooking?.area_id?.area_name}</b>?
          </Typography>

          <Rating
            value={rating}
            size="large"
            onChange={(e, v) => setRating(v)}
            icon={<StarIcon fontSize="inherit" />}
          />

          <TextField
            label="Your feedback"
            multiline
            rows={4}
            fullWidth
            sx={{ mt: 2 }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFeedbackDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitFeedback}
            startIcon={
              feedbackSubmitting ? <CircularProgress size={20} /> : null
            }
          >
            {feedbackSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <CustomSnackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </CustomSnackbar>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
  },
  loader: {
    marginTop: "200px",
    textAlign: "center",
  },
};

export default UserBooking;
