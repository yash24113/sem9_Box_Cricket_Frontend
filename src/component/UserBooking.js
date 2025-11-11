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
  Pagination,
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
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api/userapi";

const UserBooking = () => {
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] =
    useState(null);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] =
    useState(1);

  const [openDialog, setOpenDialog] =
    useState(false);
  const [
    openFeedbackDialog,
    setOpenFeedbackDialog,
  ] = useState(false);
  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] =
    useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [cancelProcessing, setCancelProcessing] =
    useState(false);
  const [
    feedbackSubmitting,
    setFeedbackSubmitting,
  ] = useState(false);

  /* ---------- Load logged-in user once ---------- */
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(
          "loggedInUser"
        );
      if (raw) {
        const parsed = JSON.parse(raw);
        const user =
          parsed?.data ||
          parsed?.user ||
          parsed ||
          null;
        setLoggedInUser(user || null);
      } else {
        setLoggedInUser(null);
      }
    } catch (err) {
      console.error(
        "Error parsing loggedInUser:",
        err
      );
      setLoggedInUser(null);
    }
  }, []);

  /* ---------- Fetch bookings ---------- */
  const fetchBookings = async (
    pageNum,
    userId
  ) => {
    if (!userId) {
      setBookings([]);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") ||
        "";

      const response =
        await axios.get(
          `${API_BASE}/my-bookings`,
          {
            params: { page: pageNum, limit: 5 },
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

      const data = response.data || {};
      const list = data.data || [];
      const total = Number(
        data.total || list.length || 0
      );

      setBookings(list);
      setTotalPages(
        Math.max(
          1,
          Math.ceil(total / 5)
        )
      );
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error
      );
      setBookings([]);
      setTotalPages(1);
      setSnackbar({
        open: true,
        message:
          "Failed to load bookings. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      loggedInUser === null
    ) {
      // still resolving
      return;
    }
    if (!loggedInUser?._id) {
      // not logged in
      setLoading(false);
      setBookings([]);
      setTotalPages(1);
      return;
    }
    fetchBookings(
      page,
      loggedInUser._id
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loggedInUser]);

  const handlePageChange = (
    event,
    value
  ) => {
    setPage(value);
  };

  /* ---------- Feedback ---------- */
  const handleOpenFeedbackDialog = (
    booking
  ) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setOpenFeedbackDialog(true);
  };

  const handleCloseFeedbackDialog =
    () => {
      setOpenFeedbackDialog(false);
      setSelectedBooking(null);
    };

  const handleSubmitFeedback = async () => {
    if (!selectedBooking || !rating)
      return;

    setFeedbackSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") ||
        "";

      await axios.post(
        `${API_BASE}/bookings/${selectedBooking._id}/feedback`,
        { rating, comment },
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      setSnackbar({
        open: true,
        message:
          "Thank you for your feedback!",
        severity: "success",
      });

      await fetchBookings(
        page,
        loggedInUser?._id
      );
      handleCloseFeedbackDialog();
    } catch (error) {
      console.error(
        "Error submitting feedback:",
        error
      );
      setSnackbar({
        open: true,
        message:
          "Failed to submit feedback. Please try again.",
        severity: "error",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  /* ---------- Ticket download ---------- */
  const handleDownloadTicket = (
    bookingId
  ) => {
    window.open(
      `${API_BASE}/download-ticket/${bookingId}`,
      "_blank"
    );
  };

  /* ---------- Cancel booking ---------- */
  const openCancelDialog = (
    booking
  ) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking?._id) return;

    setCancelProcessing(true);
    setOpenDialog(false);

    try {
      const token =
        localStorage.getItem("token") ||
        "";

      await axios.delete(
        `${API_BASE}/cancel-booking/${selectedBooking._id}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      setSnackbar({
        open: true,
        message:
          "Booking cancelled successfully",
        severity: "success",
      });

      await fetchBookings(
        page,
        loggedInUser?._id
      );
    } catch (error) {
      console.error(
        "Failed to cancel booking:",
        error
      );
      setSnackbar({
        open: true,
        message:
          "Failed to cancel booking. Please try again.",
        severity: "error",
      });
    } finally {
      setSelectedBooking(null);
      setCancelProcessing(false);
    }
  };

  /* ---------- Status chip ---------- */
  const getStatusChip = (status) => {
    switch (status) {
      case "upcoming":
        return (
          <Chip
            label="Upcoming"
            color="primary"
            size="small"
          />
        );
      case "completed":
        return (
          <Chip
            label="Completed"
            color="success"
            size="small"
          />
        );
      case "cancelled":
        return (
          <Chip
            label="Cancelled"
            color="error"
            size="small"
          />
        );
      default:
        return (
          <Chip
            label={status || "Unknown"}
            size="small"
          />
        );
    }
  };

  /* ---------- Loading state ---------- */
  if (loading && !cancelProcessing) {
    return (
      <div style={styles.loader}>
        <CircularProgress />
        <p>
          Loading your
          bookings...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold" }}
        >
          📅 My Bookings
        </Typography>
        {bookings.length >
          0 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={
              handlePageChange
            }
            color="primary"
            disabled={loading}
          />
        )}
      </Box>

      {bookings.length ===
      0 ? (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            color="textSecondary"
            gutterBottom
          >
            No bookings
            found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate(
                "/arealist"
              )
            }
            startIcon={
              <PlaceIcon />
            }
          >
            Book a Slot
          </Button>
        </Paper>
      ) : (
        <>
          <Grid
            container
            spacing={3}
          >
            {bookings.map(
              (booking) => (
                <Grid
                  item
                  xs={12}
                  key={
                    booking._id
                  }
                >
                  <Card
                    elevation={3}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{
                              fontWeight:
                                "bold",
                            }}
                          >
                            <PlaceIcon
                              color="primary"
                              sx={{
                                verticalAlign:
                                  "middle",
                                mr: 1,
                              }}
                            />
                            {booking
                              .area_id
                              ?.area_name ||
                              "N/A"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Booking
                            ID:{" "}
                            {
                              booking._id
                            }
                          </Typography>
                        </Box>
                        {getStatusChip(
                          booking.booking_status
                        )}
                      </Box>

                      <Grid
                        container
                        spacing={2}
                        sx={{
                          mb: 2,
                        }}
                      >
                        <Grid
                          item
                          xs={12}
                          md={6}
                        >
                          <Typography variant="body1">
                            <AccessTimeIcon
                              color="action"
                              sx={{
                                mr: 1,
                                verticalAlign:
                                  "bottom",
                              }}
                            />
                            <strong>
                              Time:
                            </strong>{" "}
                            {booking
                              .slot_id
                              ?.slot_start_time}{" "}
                            -{" "}
                            {booking
                              .slot_id
                              ?.slot_end_time}
                          </Typography>
                          <Typography variant="body1">
                            <CalendarTodayIcon
                              color="action"
                              sx={{
                                mr: 1,
                                verticalAlign:
                                  "bottom",
                              }}
                            />
                            <strong>
                              Date:
                            </strong>{" "}
                            {booking.date
                              ? format(
                                  new Date(
                                    booking.date
                                  ),
                                  "PPP"
                                )
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={6}
                        >
                          <Typography variant="body1">
                            <AttachMoneyIcon
                              color="action"
                              sx={{
                                mr: 1,
                                verticalAlign:
                                  "bottom",
                              }}
                            />
                            <strong>
                              Total:
                            </strong>{" "}
                            ₹
                            {
                              booking.price
                            }
                          </Typography>
                          <Typography variant="body1">
                            <PaymentIcon
                              color="action"
                              sx={{
                                mr: 1,
                                verticalAlign:
                                  "bottom",
                              }}
                            />
                            <strong>
                              Status:
                            </strong>{" "}
                            {booking.payment_status
                              ? booking.payment_status
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase() +
                                booking.payment_status.slice(
                                  1
                                )
                              : "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Divider
                        sx={{
                          my: 2,
                        }}
                      />

                      <Box
                        sx={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            <strong>
                              Booked
                              on:
                            </strong>{" "}
                            {booking.createdAt
                              ? format(
                                  new Date(
                                    booking.createdAt
                                  ),
                                  "PPPp"
                                )
                              : "N/A"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display:
                              "flex",
                            gap: 1,
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={
                              <DownloadIcon />
                            }
                            onClick={() =>
                              handleDownloadTicket(
                                booking._id
                              )
                            }
                          >
                            Ticket
                          </Button>

                          {booking.booking_status ===
                            "completed" &&
                            !booking.feedback_submitted && (
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                startIcon={
                                  <FeedbackIcon />
                                }
                                onClick={() =>
                                  handleOpenFeedbackDialog(
                                    booking
                                  )
                                }
                              >
                                Feedback
                              </Button>
                            )}

                          {booking.booking_status ===
                            "upcoming" && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={
                                <DeleteIcon />
                              }
                              onClick={() =>
                                openCancelDialog(
                                  booking
                                )
                              }
                              disabled={
                                cancelProcessing
                              }
                            >
                              {cancelProcessing
                                ? "Processing..."
                                : "Cancel"}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            )}
          </Grid>

          {/* Bottom pagination */}
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent:
                "center",
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={
                handlePageChange
              }
              color="primary"
              disabled={loading}
            />
          </Box>
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() =>
          setOpenDialog(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            gutterBottom
          >
            Are you sure you
            want to cancel this
            booking?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: 2 }}
        >
          <Button
            onClick={() =>
              setOpenDialog(
                false
              )
            }
            disabled={
              cancelProcessing
            }
          >
            No, Keep It
          </Button>
          <Button
            onClick={
              handleCancelBooking
            }
            color="error"
            variant="contained"
            disabled={
              cancelProcessing
            }
            startIcon={
              cancelProcessing ? (
                <CircularProgress
                  size={20}
                />
              ) : null
            }
          >
            {cancelProcessing
              ? "Cancelling..."
              : "Yes, Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={
          openFeedbackDialog
        }
        onClose={
          handleCloseFeedbackDialog
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Share Your Feedback
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="body1"
              gutterBottom
            >
              How was your
              experience at{" "}
              {selectedBooking
                ?.area_id
                ?.area_name ||
                "this venue"}
              ?
            </Typography>
            <Box
              sx={{
                display:
                  "flex",
                alignItems:
                  "center",
                my: 2,
              }}
            >
              <Rating
                name="feedback-rating"
                value={
                  rating
                }
                onChange={(
                  event,
                  newValue
                ) =>
                  setRating(
                    newValue ||
                      0
                  )
                }
                size="large"
                icon={
                  <StarIcon
                    fontSize="inherit"
                  />
                }
                emptyIcon={
                  <StarIcon
                    fontSize="inherit"
                    style={{
                      opacity:
                        0.55,
                    }}
                  />
                }
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  ml: 1,
                }}
              >
                {rating} star
                {rating !==
                1
                  ? "s"
                  : ""}
              </Typography>
            </Box>
            <TextField
              label="Your feedback (optional)"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={
                comment
              }
              onChange={(e) =>
                setComment(
                  e.target
                    .value
                )
              }
              placeholder="Tell us about your experience..."
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 2 }}
        >
          <Button
            onClick={
              handleCloseFeedbackDialog
            }
            disabled={
              feedbackSubmitting
            }
          >
            Cancel
          </Button>
          <Button
            onClick={
              handleSubmitFeedback
            }
            variant="contained"
            color="primary"
            disabled={
              feedbackSubmitting ||
              !rating
            }
            startIcon={
              feedbackSubmitting ? (
                <CircularProgress
                  size={20}
                />
              ) : null
            }
          >
            {feedbackSubmitting
              ? "Submitting..."
              : "Submit Feedback"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <CustomSnackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          6000
        }
        onClose={() =>
          setSnackbar(
            (prev) => ({
              ...prev,
              open: false,
            })
          )
        }
        anchorOrigin={{
          vertical: "top",
          horizontal:
            "center",
        }}
      >
        <Alert
          onClose={() =>
            setSnackbar(
              (prev) => ({
                ...prev,
                open: false,
              })
            )
          }
          severity={
            snackbar.severity
          }
          sx={{
            width: "100%",
          }}
        >
          {
            snackbar.message
          }
        </Alert>
      </CustomSnackbar>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth:
      "1200px",
    margin: "0 auto",
    fontFamily:
      '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  loader: {
    display: "flex",
    flexDirection:
      "column",
    alignItems:
      "center",
    justifyContent:
      "center",
    minHeight:
      "300px",
    textAlign:
      "center",
  },
};

export default UserBooking;
