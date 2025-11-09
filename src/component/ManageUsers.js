import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

const ManageUsers = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const recordsPerPage = 2;
  const API_URL = `http://localhost:5000/api/registeruserapi/getRegisterUser`;
  const UPDATE_URL = `http://localhost:5000/api/registeruserapi/updateRegisterUser`; // Update API URL

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token missing from localStorage");
        return;
      }

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.data)) {
        const sortedData = response.data.data.sort((a, b) => a.user_id - b.user_id);
        setData(sortedData);
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
    }
  };

  const handleEditClick = (user) => {
    setEditUser({ ...user });
    setImageFile(null); // Reset the image file when editing
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token missing from localStorage");
        return;
      }

      const formData = new FormData();
      formData.append("user_id", editUser.user_id);
      formData.append("fname", editUser.fname);
      formData.append("lname", editUser.lname);
      formData.append("email", editUser.email);
      formData.append("mobile", editUser.mobile);
      formData.append("gender", editUser.gender);
      formData.append("city", editUser.city);
      if (imageFile) {
        formData.append("profile_image", imageFile);
      }

      const response = await axios.put(`${UPDATE_URL}`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setShowEditModal(false);
        fetchData(); // Re-fetch data after successful update
      } else {
        alert("Update failed!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const filteredData = data.filter(
    (user) =>
      user.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div style={styles.pageContainer}>
      <AdminHeader />
      <div style={styles.mainContent}>
        <AdminSidebar />
        <div style={styles.container}>
          <h1 style={styles.heading}>Registered User Data</h1>
          <input
            type="text"
            placeholder="Search by Name or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
         <div style={styles.tableWrapper}>
  <table style={styles.table}>
    <thead>
      <tr>
        {/* <th style={styles.th}>UserID</th> */}
        <th style={styles.th}>First Name</th>
        <th style={styles.th}>Last Name</th>
        <th style={styles.thEmail}>Email</th>
        <th style={styles.thPhone}>Phone</th>
        <th style={styles.th}>Gender</th>
        <th style={styles.th}>City</th>
        <th style={styles.th}>Role</th>
        <th style={styles.th}>Profile Image</th>
        {/* <th style={styles.th}>Action</th> */}
      </tr>
    </thead>

    <tbody>
      {currentRecords.length > 0 ? (
        currentRecords.map((user, index) => (
          <tr
            key={user._id || index}
            style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
          >
            {/* <td style={styles.useridtd }>{user.user_id}</td> */}
            <td style={{ ...styles.td, ...styles.fnametd }}>{user.fname}</td>
            <td style={styles.td}>{user.lname}</td>
            <td style={{ ...styles.td, ...styles.tdEmail }}>{user.email}</td>
            <td style={{ ...styles.td, ...styles.tdPhone }}>{user.mobile}</td>
            <td style={styles.td}>{user.gender}</td>
            <td style={styles.td}>{user.city}</td>
            <td style={styles.td}>
              {user.email === "yashkharva22@gmail.com" ? "Admin" : "User"}
            </td>
            <td style={styles.td}>
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  style={styles.profileImage}
                />
              ) : (
                "No Image"
              )}
            </td>
            {/* 
            <td style={styles.td}>
              {user.email === "yashkharva22@gmail.com" && (
                <button
                  style={styles.editButton}
                  onClick={() => handleEditClick(user)}
                >
                  Edit
                </button>
              )}
            </td> 
            */}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="10" style={styles.noData}>
            No Data Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


          <div style={styles.pagination}>
            <button
              style={styles.button}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
            <button
              style={styles.button}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <AdminFooter />

      {/* Edit Modal */}
      {showEditModal && editUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Edit Admin Profile</h2>
            <div style={styles.modalForm}>
            <input
                type="text"
                name="user_id"
                value={editUser.user_id}
                onChange={handleEditChange}
                placeholder="User ID"
                style={styles.input}
              />
              <input
                type="text"
                name="fname"
                value={editUser.fname}
                onChange={handleEditChange}
                placeholder="First Name"
                style={styles.input}
              />
              <input
                type="text"
                name="lname"
                value={editUser.lname}
                onChange={handleEditChange}
                placeholder="Last Name"
                style={styles.input}
              />
              <input
                type="text"
                name="city"
                value={editUser.city}
                onChange={handleEditChange}
                placeholder="City"
                style={styles.input}
              />
              <input
                type="email"
                name="email"
                value={editUser.email}
                onChange={handleEditChange}
                placeholder="Email"
                style={styles.input}
              />
              <input
                type="text"
                name="mobile"
                value={editUser.mobile}
                onChange={handleEditChange}
                placeholder="Mobile"
                style={styles.input}
              />
              <select
                name="gender"
                value={editUser.gender}
                onChange={handleEditChange}
                style={styles.input}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="file"
                name="profile_image"
                onChange={handleImageChange}
                style={styles.input}
              />
            </div>
            <div>
              <button style={styles.saveBtn} onClick={handleEditSave}>Save</button>
              <button style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: { display: "flex", flexDirection: "column", height: "100vh" },
  mainContent: { display: "flex", flex: 1 },
  container: { textAlign: "center", margin: "20px auto", width: "90%" },
  heading: { color: "#333", fontSize: "26px", marginBottom: "20px", textTransform: "uppercase" },
  searchInput: {
    padding: "10px",
    width: "50%",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  tableWrapper: {
    width: "100%",
    maxHeight: "400px",
    overflowY: "auto",
    borderRadius: "10px",
    backgroundColor: "white",
    padding: "15px"
  },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
  },
  thEmail: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
    width: "200px",
  },
  thPhone: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
    width: "150px",
  },
  td: { padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" },
  useridtd : {padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left",width:"40px"},
 // fnametd : {width: "400px" },
  tdEmail: { width: "1px" },
  tdPhone: { width: "0px" },
  evenRow: { backgroundColor: "#f4f4f4" },
  oddRow: { backgroundColor: "#ffffff" },
  editButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  profileImage: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  pagination: { marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center" },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "0 10px",
  },
  pageInfo: { margin: "0 10px" },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "500px",
    width: "90%",
    position: "relative",
    maxHeight: "70vh",
    overflowY: "auto",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  saveBtn: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noData: { textAlign: "center", padding: "20px", fontStyle: "italic", color: "#999" },
};

export default ManageUsers;
