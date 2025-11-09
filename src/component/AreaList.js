import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AreaCard from "./AreaCard";
import areaImage from "../assets/area.png";
import { Modal, Button, IconButton, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import WifiIcon from "@mui/icons-material/Wifi";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import WcIcon from "@mui/icons-material/Wc";
import ReviewsIcon from "@mui/icons-material/Reviews";
import PersonIcon from "@mui/icons-material/Person";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const AreaList = () => {
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [bestSlot, setBestSlot] = useState(null);
  const [showBestSlotModal, setShowBestSlotModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const navigate = useNavigate();

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const calculateSlotDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = convertTo24Hour(startTime);
    const end = convertTo24Hour(endTime);
    const duration = (end - start) / 60;
    return duration > 0 ? duration : 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaRes, slotRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewArea`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewAreaWiseSlot`),
        ]);

        const areaData = areaRes.data.data;
        const slotData = slotRes.data.data;

        const formattedSlots = slotData.map((slot) => ({
          ...slot,
          areaname: slot.area?.area_name || "",
          startTime: slot.slot_start_time,
          endTime: slot.slot_end_time,
          price: Number(slot.price),
        }));

        setAreas(areaData);
        setSlots(formattedSlots);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load area or slot data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const redirectToSlots = (areaName) => {
    if (areaName) {
      navigate(`/areawiseslot/${areaName}`); // Redirect to the correct URL
    } else {
      console.error("Please select an area first.");
    }
  };

  const filteredAreas = areas.filter((area) =>
    area.area_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const areaMap = {};
  slots.forEach((slot) => {
    const area = slot.areaname;
    const duration = calculateSlotDuration(slot.startTime, slot.endTime);

    if (!areaMap[area]) {
      areaMap[area] = {
        name: area,
        totalDuration: 0,
        totalPrice: 0,
        count: 0,
      };
    }

    areaMap[area].totalDuration += duration;
    areaMap[area].totalPrice += slot.price;
    areaMap[area].count += 1;
  });

  const graphData = Object.values(areaMap).map((area) => ({
    name: area.name,
    Average_Slot_Time: (area.totalDuration / area.count).toFixed(1),
    Average_Price: (area.totalPrice / area.count).toFixed(2),
  }));

  useEffect(() => {
    if (Object.keys(areaMap).length > 0) {
      const best = Object.values(areaMap).reduce((prev, curr) => {
        const prevScore =
          prev.totalDuration / prev.count - prev.totalPrice / prev.count;
        const currScore =
          curr.totalDuration / curr.count - curr.totalPrice / curr.count;
        return currScore > prevScore ? curr : prev;
      });
      setBestSlot(best);
    }
  }, [slots]);

  const generateRating = () => (Math.random() * 2 + 3).toFixed(1);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} color="primary" />);
    }
    if (halfStar) {
      stars.push(<StarHalfIcon key="half" color="primary" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<StarBorderIcon key={`empty-${i}`} color="primary" />);
    }

    return stars;
  };

  const dummyReviews = [
    { user: "Henil Shah", comment: "Nice box place and give more facility!", rating: 4.5 },
    { user: "Varshil Shah", comment: "Nice Food and low price.", rating: 4.0 },
    { user: "Nayan Pitroda", comment: "Very secure and well-maintained.", rating: 5.0 },
  ];
  

  const getGoogleMapsSrc = (area) => {
    if (!area) return "";
    const query = area.area_location || area.area_name;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="area-list-container">
      <style>{`
        .area-list-container {
          padding: 20px;
          font-family: Arial;
          text-align: center;
        }
        .search-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .compare-button {
          background-color: #28a745;
          color: white;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-radius: 4px;
        }
        .card-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .modal-content {
          background: white;
          padding: 30px;
          width: 100vw;
          height: 100vh;
          overflow-y: auto;
          position: relative;
          border-radius: 0;
          outline: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-close-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 2rem;
          background: #eee;
          border-radius: 50%;
          padding: 10px;
          z-index: 999;
        }
        .ok-button {
          margin-top: 20px;
          background-color: #007bff;
          color: white;
        }
        .ok-button:hover {
          background-color: #0056b3;
        }
        .facilities {
          display: flex;
          justify-content: space-around;
          margin: 20px 0;
        }
        .review-section {
          margin-top: 20px;
          text-align: left;
        }
        iframe {
          width: 50%;
          height: 900px;
          border: 0;
          margin-top: 20px;
          border-radius: 10px;
        }

        /* Add blur effect */
        .blur-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(8px);
          z-index: 999;
          transition: backdrop-filter 0.3s ease;
        }
        .facilities-modern {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 20px 0;
          justify-content: center;
        }

        .facility-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f5f5f5;
          border-radius: 12px;
          padding: 15px;
          width: 100px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .facility-card:hover {
          transform: translateY(-5px);
          background: #e0e0e0;
        }

        .facility-card span {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          color: #333;
        }
      `}</style>

      <h2>Select Your Area</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-box"
        />
        <button className="compare-button" onClick={() => setOpenModal(true)}>
          Compare Slots
        </button>
      </div>

      {/* Loading and Areas */}
      {loading ? (
        <p>Loading areas...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="card-container">
          {filteredAreas.length > 0 ? (
            filteredAreas.map((area, index) => {
              const rating = generateRating();
              return (
                <div key={index} onClick={() => handleAreaClick(area)}>
                  <AreaCard name={area.area_name} image={areaImage} />
                  <div>{renderStars(rating)} ({rating})</div>
                </div>
              );
            })
          ) : (
            <p>No matching areas found.</p>
          )}
        </div>
      )}

      {/* Apply blur background when modal is open */}
      {openModal || selectedArea ? <div className="blur-background" /> : null}

      {/* Area Info Modal with Slide */}
      <Modal open={!!selectedArea} onClose={() => setSelectedArea(null)}>
        <Slide direction="up" in={!!selectedArea}>
          <div className="modal-content">
            <IconButton
              className="modal-close-icon"
              onClick={() => setSelectedArea(null)}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
            {selectedArea && (
              <>
                <h2> <LocationOnIcon /> {selectedArea.area_name}</h2>
            
                <div className="facilities-modern">
                  <div className="facility-card">
                    <WcIcon style={{ fontSize: 40, color: "#4caf50" }} />
                    <span>Restroom</span>
                  </div>
                  <div className="facility-card">
                    <RestaurantIcon style={{ fontSize: 40, color: "#ff9800" }} />
                    <span>Restaurant</span>
                  </div>
                  <div className="facility-card">
                    <LocalDrinkIcon style={{ fontSize: 40, color: "#2196f3" }} />
                    <span>Drinks</span>
                  </div>
                  <div className="facility-card">
                    <WifiIcon style={{ fontSize: 40, color: "#673ab7" }} />
                    <span>WiFi</span>
                  </div>
                  <div className="facility-card">
                    <LocalParkingIcon style={{ fontSize: 40, color: "#f44336" }} />
                    <span>Parking</span>
                  </div>
                </div>

                <Button className="ok-button" onClick={() => redirectToSlots(selectedArea.area_name)}>
                  Go to Slots
                </Button>

                <div>
  <h3><ReviewsIcon /> Reviews</h3>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
    {dummyReviews.map((review, index) => (
      <div
        key={index}
        style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <PersonIcon style={{ fontSize: 40, color: '#007bff', marginBottom: '10px' }} />
        <p style={{ fontWeight: 'bold', margin: '0' }}>{review.user}</p>
        <p style={{ marginTop: '8px', color: '#555' }}>{review.comment}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
          {renderStars(review.rating)}
          {/* <span>({review.rating})</span> */}
        </div>
      </div>
    ))}
  </div>
</div>



                <iframe
                  title="Google Maps Location"
                  src={getGoogleMapsSrc(selectedArea)}
                  allowFullScreen="true"
                  loading="lazy"
                ></iframe>
              </>
            )}
          </div>
        </Slide>
      </Modal>

      {/* Compare Modal with Slide */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Slide direction="up" in={openModal}>
          <div className="modal-content">
            <IconButton
              className="modal-close-icon"
              onClick={() => setOpenModal(false)}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
            <h2>Slot Time & Price Comparison</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={graphData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Average_Slot_Time" fill="#007bff" />
                <Bar dataKey="Average_Price" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
            <button
              className="compare-button"
              onClick={() => setShowBestSlotModal(true)}
            >
              View Recommended Slot
            </button>
          </div>
        </Slide>
      </Modal>

      {/* Recommended Slot Modal with Slide */}
      <Modal open={showBestSlotModal} onClose={() => setShowBestSlotModal(false)}>
  <Slide direction="up" in={showBestSlotModal}>
    <div className="modal-content">
      <IconButton
        className="modal-close-icon"
        onClick={() => setShowBestSlotModal(false)}
      >
        <CloseIcon fontSize="large" />
      </IconButton>

      {bestSlot ? (
        <>
          <h3>Best Slot Recommendation</h3>
          <p>Area: {bestSlot.name}</p>
          <p>Average Slot Duration: {(bestSlot.totalDuration / bestSlot.count).toFixed(1)} hours</p>
          <p>Average Price: ₹{(bestSlot.totalPrice / bestSlot.count).toFixed(2)}</p>

          <Button
            className="ok-button"
            onClick={() => {
              navigate(`/areawiseslot/${encodeURIComponent(bestSlot.name)}`);
              setShowBestSlotModal(false);
            }}
          >
            Go to Slots
          </Button>
        </>
      ) : (
        <p>No best slot found yet.</p>
      )}
    </div>
  </Slide>
</Modal>


      <ToastContainer />
    </div>
  );
};

export default AreaList;
