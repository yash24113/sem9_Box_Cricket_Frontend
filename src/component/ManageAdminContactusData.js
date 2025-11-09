import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";

const ManageAdminContactusData = () => {
  const [contactData, setContactData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/viewContact`);
        if (response.data && response.data.data) {
          setContactData(response.data.data);
        } else {
          setContactData([]);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AdminHeader />

      <div style={{ display: "flex", flex: 1 }}>
        <AdminSidebar />

        <div style={styles.container}>
          <h1 style={styles.heading}>Manage Contact Us Messages</h1>
          <div style={styles.tableWrapper}>
            {loading ? (
              <p style={styles.loadingText}>Loading messages...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {contactData.length > 0 ? (
                    contactData.map((contact, index) => (
                      <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.td}>{contact.name}</td>
                        <td style={styles.td}>{contact.email}</td>
                        <td style={styles.td}>{contact.message}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={styles.noData}>No messages found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default ManageAdminContactusData;
