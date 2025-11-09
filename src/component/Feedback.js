import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Feedback.css";

const Feedback = () => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({
        fname: "",
        lname: "",
        email: "",
        mobile: "",
        rating: "",
        query: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem("loggedInUser"));
        if (storedUserData?.data) {
            const { fname, lname, email, mobile } = storedUserData.data;
            setFeedback(prev => ({
                ...prev,
                fname: fname?.toString() || "",
                lname: lname?.toString() || "",
                email: email?.toString() || "",
                mobile: mobile?.toString() || ""
            }));
        }
    }, []);

    const validate = () => {
        const nameRegex = /^[A-Za-z]{2,}$/;
        const mobileRegex = /^[0-9]{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let tempErrors = {};

        if (!feedback.fname || !feedback.fname.toString().trim() || !nameRegex.test(feedback.fname))
            tempErrors.fname = "First name must be at least 2 letters.";
        if (!feedback.lname || !feedback.lname.toString().trim() || !nameRegex.test(feedback.lname))
            tempErrors.lname = "Last name must be at least 2 letters.";
        if (!feedback.email || !feedback.email.toString().trim() || !emailRegex.test(feedback.email))
            tempErrors.email = "Enter a valid email address.";
        if (!feedback.mobile || !feedback.mobile.toString().trim() || !mobileRegex.test(feedback.mobile))
            tempErrors.mobile = "Enter a valid 10-digit mobile number.";
        if (!feedback.rating)
            tempErrors.rating = "Please select a rating.";
        if (!feedback.query || feedback.query.toString().trim().length < 5)
            tempErrors.query = "Query must be at least 5 characters long.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const response = await fetch("http://localhost:5000/api/userapi/addFeedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(feedback)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Thank you for your feedback!");
                setTimeout(() => {
                    handleReset();
                    navigate("/userbooking");
                }, 2000);
            } else {
                toast.error(data.message || "Failed to submit feedback.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    const handleReset = () => {
        setFeedback({
            fname: "",
            lname: "",
            email: "",
            mobile: "",
            rating: "",
            query: ""
        });
        setErrors({});
    };

    return (
        <div className="feedback-container">
            <h1 className="heading text-center mb-4">Feedback Form</h1>
            <div className="header1">
                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="text"
                        name="fname"
                        placeholder="First Name"
                        className="input"
                        value={feedback.fname}
                        onChange={(e) => setFeedback({ ...feedback, fname: e.target.value })}
                    />
                    {errors.fname && <p className="error">{errors.fname}</p>}

                    <input
                        type="text"
                        name="lname"
                        placeholder="Last Name"
                        className="input"
                        value={feedback.lname}
                        onChange={(e) => setFeedback({ ...feedback, lname: e.target.value })}
                    />
                    {errors.lname && <p className="error">{errors.lname}</p>}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="input"
                        value={feedback.email}
                        onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    />
                    {errors.email && <p className="error">{errors.email}</p>}

                    <input
                        type="text"
                        name="mobile"
                        placeholder="Mobile"
                        className="input"
                        value={feedback.mobile}
                        onChange={(e) => setFeedback({ ...feedback, mobile: e.target.value })}
                    />
                    {errors.mobile && <p className="error">{errors.mobile}</p>}

                    <div className="rating-container mt-3 mb-2">
                        <label className="label">Rating:</label>
                        {["Excellent", "Very Good", "Good", "Bad"].map((rating) => (
                            <label key={rating} className="me-3">
                                <input
                                    type="radio"
                                    name="rating"
                                    value={rating}
                                    checked={feedback.rating === rating}
                                    onChange={(e) =>
                                        setFeedback({ ...feedback, rating: e.target.value })
                                    }
                                />{" "}
                                {rating}
                            </label>
                        ))}
                    </div>
                    {errors.rating && <p className="error">{errors.rating}</p>}

                    <textarea
                        name="query"
                        placeholder="Any Query"
                        className="textarea"
                        value={feedback.query}
                        onChange={(e) => setFeedback({ ...feedback, query: e.target.value })}
                    />
                    {errors.query && <p className="error">{errors.query}</p>}

                    <div className="button-group mt-4">
                        <button type="submit" className="btn btn-success">Submit Feedback</button>&nbsp;&nbsp;
                        <button type="button" className="btn btn-danger" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>
            <ToastContainer position="top-center" autoClose={2000} />
        </div>
    );
};

export default Feedback;
