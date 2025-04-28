import React, { useEffect, useState } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import {
  fetchImageById,
  fetchApprovedAdvertisementsByUserId,
} from "../../services/api";
import "../../assets/EquipmentsPage.css";

const UserEquipmentsPage = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const userEmail = location.state?.userEmail;

  const [equipments, setEquipments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadEquipments = async () => {
      try {
        const data = await fetchApprovedAdvertisementsByUserId(userId);
        setEquipments(data);

        for (const item of data) {
          const image = await fetchImageById(item.mainImageId);
          setImageUrls((prev) => ({
            ...prev,
            [item.id]: image,
          }));
        }
      } catch (err) {
        setError("Не вдалося завантажити обладнання користувача.");
        console.error(err);
      }
    };

    loadEquipments();
  }, [userId]);

  if (!userId) {
    return <Navigate to="/equipments" replace />;
  }

  return (
    <div className="equipments-page">
      <h2>Обладнання користувача {userEmail && `(${userEmail})`}</h2>
      {error && <p className="error">{error}</p>}
      <div className="equipment-list">
        {equipments.map((item) => (
          <div key={item.id} className="equipment-card">
            <h3>{item.equipmentName}</h3>
            {imageUrls[item.id] ? (
              <img src={imageUrls[item.id]} alt={item.name} width="200" />
            ) : (
              <p>Завантаження зображення...</p>
            )}
            <p><strong>Ціна:</strong> {item.price} грн</p>
            <Link to={`/equipment/${item.id}`}>Детальніше</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserEquipmentsPage;