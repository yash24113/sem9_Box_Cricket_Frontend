import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import Pagination from "./Pagination"; // <-- Importing pagination

const AdminViewFeedback = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3); // Show 5 feedbacks per page

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewFeedback`);
                if (response.data && response.data.data) {
                    setFeedbackList(response.data.data);
                } else {
                    setFeedbackList([]);
                }
            } catch (error) {
                console.error("Error fetching feedback data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    const totalPages = Math.ceil(feedbackList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = feedbackList.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AdminHeader />

            <div style={{ display: "flex", flex: 1 }}>
                <AdminSidebar />

                <div style={styles.container}>
                    <h1 style={styles.heading}>User Feedback</h1>
                    <div style={styles.tableWrapper}>
                        {loading ? (
                            <p style={styles.loadingText}>Loading feedback...</p>
                        ) : (
                            <>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>First Name</th>
                                            <th style={styles.th}>Last Name</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Mobile</th>
                                            <th style={styles.th}>Rating</th>
                                            <th style={styles.th}>Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((feedback, index) => (
                                                <tr
                                                    key={index}
                                                    style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                                                >
                                                    <td style={styles.td}>{feedback.fname}</td>
                                                    <td style={styles.td}>{feedback.lname}</td>
                                                    <td style={styles.td}>{feedback.email}</td>
                                                    <td style={styles.td}>{feedback.mobile}</td>
                                                    <td style={styles.td}>{feedback.rating}</td>
                                                    <td style={styles.td}>{feedback.query}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={styles.noData}>
                                                    No Feedback Available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {feedbackList.length > itemsPerPage && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AdminFooter />
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        marginTop: "20px",
        width: "100%",
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
    loadingText: {
        textAlign: "center",
        color: "#007bff",
        fontSize: "18px",
        fontWeight: "bold",
    },
};

export default AdminViewFeedback;
