import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "../assets/logo.png";

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <>
      {/* Slider Section */}
      <div style={{ width: "80%", margin: "0 auto" }}>
        <Slider {...settings}>
          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMq6U5EUHZr6Dy_4nmpIWBknpRzvf42EslWw&s"
              alt="Slide 1"
              style={{ width: "100%", height: "350px", objectFit: "contain" }}
            />
          </div>
          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbHstjLyNrHN-V5p0Y4cBd1ZJ2IL8ZFROqg&s"
              alt="Slide 2"
              style={{ width: "100%", height: "350px", objectFit: "contain" }}
            />
          </div>
          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt2EK25rS3OBiiOSU6mVx1pop8rPjdzhCp8Q&s"
              alt="Slide 3"
              style={{ width: "100%", height: "350px", objectFit: "contain" }}
            />
          </div>
        </Slider>
      </div>

      {/* About Us Section */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "50px 0",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px"
      }}>
        <img src={logo} alt="Company Logo" style={{ width: "150px", height: "150px", marginRight: "20px" }} />
        <div style={{ maxWidth: "600px" }}>
          <h2 style={{ fontSize: "28px", color: "#333" }}>About Us</h2>
          <p style={{ fontSize: "18px", color: "#555", lineHeight: "1.5" }}>
            Welcome to our Box Cricket booking platform! We provide the best cricketing experience with top-notch facilities and easy online booking.
            Join us for a fun-filled cricket match with friends and family!
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
