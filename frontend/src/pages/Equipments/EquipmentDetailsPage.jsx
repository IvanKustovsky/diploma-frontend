import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEquipmentById, fetchImageById, fetchCurrentUserId } from "../../services/api";
import "../../assets/EquipmentDetailsPage.css";
import { categoryTranslations, subcategoryTranslations } from '../../data/translations';

const EquipmentDetailsPage = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await fetchEquipmentById(id);
        setEquipment(data);
      } catch (err) {
        setError("Не вдалося завантажити обладнання");
        console.error(err);
      }
    };

    loadEquipment();
  }, [id]);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await fetchCurrentUserId();
        setCurrentUserId(id);
      } catch (err) {
        console.error("Не вдалося отримати userId:", err);
      }
    };

    loadUserId();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (!equipment?.imageIds?.length) return;

      try {
        const orderedIds = [
          equipment.mainImageId,
          ...equipment.imageIds.filter((imgId) => imgId !== equipment.mainImageId),
        ];
        const fetched = await Promise.all(orderedIds.map(fetchImageById));
        setImages(fetched);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Не вдалося завантажити зображення", err);
      }
    };

    if (equipment) loadImages();
  }, [equipment]);

  const showPrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (error) return <p className="error">{error}</p>;
  if (!equipment) return <p className="loading">Завантаження...</p>;

  return (
    <div className="equipment-details">
      <h2>{equipment.name}</h2>

      {images.length > 0 && (
        <div className="carousel">
          <button className="nav-btn" onClick={showPrevImage}>‹</button>
          <img src={images[currentIndex]} alt={`Фото ${currentIndex + 1}`} className="main-img" />
          <button className="nav-btn" onClick={showNextImage}>›</button>
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
        <p><strong>Категорія:</strong> {categoryTranslations[equipment.category] || equipment.category}</p>
        <p><strong>Підкатегорія: </strong>
          {subcategoryTranslations[equipment.subcategory] || equipment.subcategory}</p>
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
      {currentUserId !== equipment.userId && (
        <Link to="/equipment/rent" state={{ equipmentId: equipment.id }} className="rent-button">
          📝 Оформити оренду
        </Link>
      )}

      <Link className="back-link"
        to={currentUserId === equipment.userId ? "/my-equipments" : "/equipments"}
      > ⬅️ Назад до списку</Link>
    </div>
  );
};

export default EquipmentDetailsPage;