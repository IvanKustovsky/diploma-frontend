import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchEquipmentById,
  fetchImageById,
  approveAdvertisement,
  rejectAdvertisement
} from "../../services/api";
import "../../assets/EquipmentDetailsPage.css";
import "../../assets/AdvertisementModerationPage.css";
import { validateAdminMessage } from "../../utils/validation";
import { categoryTranslations, subcategoryTranslations } from "../../data/translations";

const AdvertisementModerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adminMessage, setAdminMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAdvertisement = async () => {
      try {
        const adData = await fetchEquipmentById(id);
        setEquipment(adData);

        const imageIds = adData.imageIds || [];
        const mainId = adData.mainImageId;

        const orderedIds = mainId
          ? [mainId, ...imageIds.filter((imgId) => imgId !== mainId)]
          : imageIds;

        const filteredIds = orderedIds.filter((id) => id !== null && id !== undefined);
        const fetchedImages = await Promise.all(filteredIds.map(fetchImageById));
        setImages(fetchedImages);
        setCurrentIndex(0);
      } catch (err) {
        setError("Не вдалося завантажити дані оголошення");
        console.error(err);
      }
    };

    loadAdvertisement();
  }, [id]);

  const handleApprove = async () => {
    const errors = validateAdminMessage(adminMessage);
    if (errors.adminMessage) {
      setValidationError(errors.adminMessage);
      return;
    }

    try {
      await approveAdvertisement(id, { adminMessage });
      alert("Оголошення схвалено ✅");
      navigate("/moderation");
    } catch (err) {
      alert("Помилка при схваленні ❌");
    }
  };

  const handleReject = async () => {
    const errors = validateAdminMessage(adminMessage);
    if (errors.adminMessage) {
      setValidationError(errors.adminMessage);
      return;
    }

    try {
      await rejectAdvertisement(id, { adminMessage });
      alert("Оголошення відхилено ❌");
      navigate("/moderation");
    } catch (err) {
      alert("Помилка при відхиленні ❌");
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!equipment) return <p className="loading">Завантаження...</p>;

  return (
    <div className="equipment-details">
      <h2>Модерація: {equipment.name}</h2>

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
        <p><strong>Ціна за день:</strong> {equipment.pricePerDay} грн</p>
        <Link to="/user-profile" state={{ userId: equipment.userId }}>
          👤 Переглянути профіль
        </Link>
      </div>

      <div className="moderation">
        <textarea
          placeholder="Коментар адміністратора..."
          value={adminMessage}
          onChange={(e) => {
            setAdminMessage(e.target.value);
            setValidationError(null);
          }}
        />
        {validationError && <p className="error">{validationError}</p>}
        <div className="actions">
          <button className="approve" onClick={handleApprove}>✅ Схвалити</button>
          <button className="reject" onClick={handleReject}>❌ Відхилити</button>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementModerationPage;