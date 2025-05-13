import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchEquipmentById,
  fetchImageById,
  approveRentalRequest,
  rejectRentalRequest,
  fetchRentalById
} from "../../services/api";
import { categoryTranslations, subcategoryTranslations, rentalStatusTranslations } from "../../data/translations";
import "../../assets/EquipmentDetailsPage.css";
import "../../assets/AdvertisementModerationPage.css";

const IncomingRentalRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adminMessage, setAdminMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRentalRequest = async () => {
      try {
        const rentalData = await fetchRentalById(id);
        console.log("Rental data" , rentalData)
        setRental(rentalData);

        const equipmentData = await fetchEquipmentById(rentalData.equipmentId);
        setEquipment(equipmentData);

        const imageIds = equipmentData.imageIds || [];
        const mainId = equipmentData.mainImageId;
        const orderedIds = mainId
          ? [mainId, ...imageIds.filter((imgId) => imgId !== mainId)]
          : imageIds;

        const filteredIds = orderedIds.filter((id) => id !== null && id !== undefined);
        const fetchedImages = await Promise.all(filteredIds.map(fetchImageById));
        setImages(fetchedImages);
      } catch (err) {
        console.error(err);
        setError("Не вдалося завантажити дані про запит на оренду.");
      }
    };

    loadRentalRequest();
  }, [id]);

  const handleApprove = async () => {
    try {
      await approveRentalRequest(id);
      alert("Запит схвалено ✅");
      navigate("/incoming-rental-requests");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectRentalRequest(id, adminMessage);
      alert("Запит відхилено ❌");
      navigate("/incoming-rental-requests");
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!rental || !equipment) return <p className="loading">Завантаження...</p>;

  return (
    <div className="equipment-details">
      <h2>Запит на оренду: {equipment.name}</h2>

      {images.length > 0 && (
        <div className="carousel">
          <button className="nav-btn" onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}>‹</button>
          <img src={images[currentIndex]} alt={`Фото ${currentIndex + 1}`} className="main-img" />
          <button className="nav-btn" onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}>›</button>

          <div className="thumbnails">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`thumbnail-${i}`}
                className={`thumb ${i === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="info">
        <p><strong>Опис:</strong> {equipment.description}</p>
        <p><strong>Категорія:</strong> {categoryTranslations[equipment.category]}</p>
        <p><strong>Підкатегорія:</strong> {subcategoryTranslations[equipment.subcategory]}</p>
        <p><strong>Стан:</strong> {
          equipment.condition === "NEW" ? "Новий" :
            equipment.condition === "USED" ? "Вживаний" :
              "Відновлений"
        }</p>
        <p><strong>Ціна:</strong> {rental.totalPrice} грн</p>
        <p><strong>Період:</strong> {rental.startDate} - {rental.endDate}</p>
        <p><strong>Адреса:</strong> {rental.address}</p>
        <Link to="/user-profile" state={{ userId: rental.renterId }}>👤 Профіль орендаря</Link>
      </div>

      {rental.status === "PENDING" ? (
        <div className="moderation">
          <textarea
            placeholder="Причина відмови (необов'язково, якщо схвалюєте)..."
            value={adminMessage}
            onChange={(e) => {
              setAdminMessage(e.target.value);
              setValidationError(null);
            }}
          />
          {validationError && <p className="error">{validationError}</p>}
          <div className="actions">
            <button className="approve" onClick={handleApprove}>✅ Прийняти</button>
            <button className="reject" onClick={handleReject}>❌ Відхилити</button>
          </div>
        </div>
      ) : (
        <div className="status-info">
          <p><strong>Статус запиту:</strong> {rentalStatusTranslations[rental.status]}</p>
        </div>
      )}
      <Link className="back-link" to="/incoming-rental-requests">⬅️ Назад до списку</Link>
    </div>
  );
};

export default IncomingRentalRequestDetails;
