import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ backgroundColor: "#007bff", color: "white", padding: "10px", borderRadius: "5px", cursor: "pointer", border: "none", marginRight: "10px" }}
      >
        Prev
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          style={{
            backgroundColor: currentPage === index + 1 ? "#007bff" : "#ccc",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            border: "none",
            marginRight: "5px",
          }}
        >
          {index + 1}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ backgroundColor: "#007bff", color: "white", padding: "10px", borderRadius: "5px", cursor: "pointer", border: "none", marginLeft: "10px" }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
