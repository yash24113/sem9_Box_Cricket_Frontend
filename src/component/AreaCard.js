const AreaCard = ({ name, image, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      style={{ cursor: "pointer", border: "1px solid #ddd", padding: "10px", textAlign: "center" }}
    >
      <img src={image} alt={name} width="100px" />
      <h3>{name}</h3>
    </div>
  );
};

export default AreaCard;
