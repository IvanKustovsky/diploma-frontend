import React, { useEffect, useState } from "react";
import { fetchPendingAdvertisements, fetchImageById } from "../../services/api";
import { Link } from "react-router-dom";
import "../../assets/EquipmentsPage.css";

const Moderation = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPendingAdvertisements = async () => {
      try {
        const data = await fetchPendingAdvertisements();
        console.log("Pending advertisements:", data);
        setAdvertisements(data);

        for (const ad of data) {
          if (ad.mainImageId) {
            const image = await fetchImageById(ad.mainImageId);
            setImageUrls((prev) => ({
              ...prev,
              [ad.id]: image,
            }));
          }
        }
      } catch (err) {
        setError("Не вдалося завантажити оголошення на модерацію");
        console.error(err);
      }
    };

    loadPendingAdvertisements();
  }, []);

  return (
    <div className="equipments-page">
      <h2>Оголошення на модерацію</h2>
      {error && <p className="error">{error}</p>}
      
      {advertisements.length === 0 && !error ? (
        <p className="no-items">Наразі немає оголошень, що потребують модерації.</p>
      ) : (
        <div className="equipment-list">
          {advertisements.map((ad) => (
            <div key={ad.id} className="equipment-card">
              <h3>{ad.equipmentName}</h3>
              <p>Ціна за день: {ad.pricePerDay} грн</p>
              {imageUrls[ad.id] ? (
                <img src={imageUrls[ad.id]} alt={ad.equipmentName} width="200" />
              ) : (
                <p>Завантаження зображення...</p>
              )}
              <Link to={`/moderation/${ad.id}`}>Переглянути</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Moderation;
