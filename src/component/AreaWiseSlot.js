// AreaWiseSlot.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaClock, FaRupeeSign, FaRegCalendarCheck } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

const AreaWiseSlot = () => {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [priceFilter, setPriceFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [endTimeFilter, setEndTimeFilter] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:5000/api/userapi";

  const generateNext7Dates = () =>
    Array.from({ length: 7 }, (_, i) =>
      dayjs().add(i, "day").format("YYYY-MM-DD")
    );

  // Fetch slots
  useEffect(() => {
    if (!areaName) {
      setError("Invalid area name. Please go back and try again.");
      setLoading(false);
      return;
    }

    const fetchSlots = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/viewAreaWiseSlot?area=${encodeURIComponent(areaName)}`
        );
        const data = response.data?.data;
        if (Array.isArray(data)) {
          setSlots(data);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch slots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [areaName, API_BASE]);

  // Fetch bookings for selected date
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_BASE}/viewBooking`);
        const apiBookings = response.data?.data || [];

        const matchingBookings = apiBookings.filter(
          (booking) =>
            dayjs(booking.date).format("YYYY-MM-DD") === selectedDate
        );

        setBookings(matchingBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, [API_BASE, selectedDate]);

  // Apply filters
  useEffect(() => {
    let filtered = [...slots];

    // Time range filter
    if (startTimeFilter && endTimeFilter) {
      const startMinutes = convertTimeToMinutes(startTimeFilter);
      const endMinutes = convertTimeToMinutes(endTimeFilter);

      filtered = filtered.filter((slot) => {
        const slotStartMinutes = convertTimeToMinutes(
          slot.slot_start_time
        );
        return (
          slotStartMinutes >= startMinutes &&
          slotStartMinutes <= endMinutes
        );
      });
    }

    // Price filter
    if (priceFilter) {
      filtered = filtered.filter((slot) =>
        String(slot.price || "")
          .toLowerCase()
          .includes(priceFilter.toLowerCase())
      );
    }

    // Hide past slots for today
    if (selectedDate === dayjs().format("YYYY-MM-DD")) {
      const now = dayjs();
      filtered = filtered.filter((slot) => {
        if (!slot.slot_end_time) return true;
        const [endHour, endMin] = slot.slot_end_time
          .split(":")
          .map(Number);
        const slotEndTime = dayjs()
          .hour(endHour || 0)
          .minute(endMin || 0);
        return slotEndTime.isAfter(now);
      });
    }

    // Sort by start time
    filtered.sort((a, b) => {
      const [aHour, aMinute] = (a.slot_start_time || "0:0")
        .split(":")
        .map(Number);
      const [bHour, bMinute] = (b.slot_start_time || "0:0")
        .split(":")
        .map(Number);
      if (aHour !== bHour) return aHour - bHour;
      return aMinute - bMinute;
    });

    setFilteredSlots(filtered);
  }, [
    slots,
    startTimeFilter,
    endTimeFilter,
    priceFilter,
    selectedDate,
  ]);

  const convertTimeToMinutes = (time) => {
    if (!time || typeof time !== "string") return 0;
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  };

  const formatTime = (time) => {
    if (!time) return "";

    if (
      typeof time === "string" &&
      (time.includes("AM") || time.includes("PM"))
    ) {
      return time;
    }

    if (typeof time === "string" && time.includes(":")) {
      const [hours, minutes] = time.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes
          .toString()
          .padStart(2, "0")} ${period}`;
      }
    }

    return String(time);
  };

  const handleBooking = (slot) => {
    if (!slot || !slot._id) {
      console.error("Invalid slot data:", slot);
      return;
    }

    const bookingData = {
      areaName: areaName || "",
      startTime: formatTime(slot.slot_start_time) || "",
      endTime: formatTime(slot.slot_end_time) || "",
      price: slot.price || 0,
      slotId: slot._id || "",
      areaId: slot.area?._id || "",
      selectedDate:
        selectedDate ||
        new Date().toISOString().split("T")[0],
    };

    navigate("/booking-form", {
      state: bookingData,
      replace: true,
    });
  };

  return (
    <div style={styles.container}>
      <h2>
        Available Slots for{" "}
        <span style={{ color: "#007bff" }}>
          {areaName || "Unknown Area"}
        </span>
      </h2>

      <h4 style={{ marginTop: "10px" }}>
        Selected Date:{" "}
        <span style={{ color: "#28a745" }}>
          {dayjs(selectedDate).format("DD/MM/YYYY")}
        </span>
      </h4>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterItem}>
          <label style={styles.label}>Start Time:</label>
          <input
            type="time"
            value={startTimeFilter}
            onChange={(e) => setStartTimeFilter(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.filterItem}>
          <label style={styles.label}>End Time:</label>
          <input
            type="time"
            value={endTimeFilter}
            onChange={(e) => setEndTimeFilter(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.filterItem}>
          <label style={styles.label}>Price:</label>
          <input
            type="text"
            placeholder="Filter by price"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Date selector */}
      <div style={styles.datePickerWrapper}>
        <div style={styles.datePicker}>
          {generateNext7Dates().map((date) => (
            <div
              key={date}
              style={{
                ...styles.dateItem,
                backgroundColor:
                  selectedDate === date
                    ? "#007bff"
                    : "#f0f0f0",
                color:
                  selectedDate === date
                    ? "white"
                    : "black",
              }}
              onClick={() => setSelectedDate(date)}
            >
              <div>{dayjs(date).format("ddd")}</div>
              <div>{dayjs(date).format("DD MMM")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Slots / states */}
      {loading ? (
        <p style={styles.loading}>Loading slots...</p>
      ) : error ? (
        <div>
          <p style={styles.error}>Error: {error}</p>
          <button
            style={styles.tryAnotherButton}
            onClick={() => navigate("/arealist")}
          >
            Back to Area List
          </button>
        </div>
      ) : filteredSlots.length > 0 ? (
        <div style={styles.cardContainer}>
          {filteredSlots.map((slot, index) => {
            const isBooked = bookings.some(
              (booking) => booking.slot_id === slot._id
            );
            return (
              <div
                key={slot._id || index}
                style={{
                  ...styles.card,
                  backgroundColor: isBooked
                    ? "#ffe0e0"
                    : "#f9f9f9",
                  border: isBooked
                    ? "2px solid red"
                    : "1px solid #ddd",
                }}
              >
                <h3>
                  <FaClock style={styles.icon} />
                  {formatTime(slot.slot_start_time)} -{" "}
                  {formatTime(slot.slot_end_time)}
                </h3>
                <p style={{ fontSize: "20px" }}>
                  <FaRupeeSign style={styles.icon} />{" "}
                  {slot.price}
                </p>
                <button
                  style={{
                    ...styles.bookButton,
                    backgroundColor: isBooked
                      ? "#ccc"
                      : "#28a745",
                    cursor: isBooked
                      ? "not-allowed"
                      : "pointer",
                  }}
                  onClick={() =>
                    !isBooked && handleBooking(slot)
                  }
                  disabled={isBooked}
                >
                  <FaRegCalendarCheck
                    style={{ marginRight: "8px" }}
                  />
                  {isBooked ? "Booked" : "Book Now"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <p style={styles.noData}>
            No slots available for this area on selected date.
          </p>
          <button
            style={styles.tryAnotherButton}
            onClick={() => navigate("/arealist")}
          >
            Try Another Area
          </button>
        </div>
      )}

      <button
        style={styles.backButton}
        onClick={() => navigate("/arealist")}
      >
        Back to Area List
      </button>
    </div>
  );
};

const styles = {
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
  container: {
    padding: "20px",
    textAlign: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  filters: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  input: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "180px",
    marginTop: "5px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
  },
  datePickerWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  datePicker: {
    display: "flex",
    overflowX: "auto",
    padding: "10px 0",
    marginBottom: "20px",
    gap: "10px",
  },
  dateItem: {
    padding: "10px",
    borderRadius: "8px",
    minWidth: "80px",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "bold",
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    marginTop: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    width: "260px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease",
  },
  bookButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "10px",
  },
  tryAnotherButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "15px",
  },
  backButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "15px",
  },
  icon: { marginRight: "8px", color: "#555" },
  noData: {
    fontSize: "18px",
    color: "red",
    fontWeight: "bold",
    marginTop: "20px",
  },
  loading: {
    fontSize: "18px",
    color: "blue",
    fontWeight: "bold",
    marginTop: "20px",
  },
  error: {
    fontSize: "18px",
    color: "red",
    fontWeight: "bold",
    marginTop: "20px",
  },
};

export default AreaWiseSlot;
