import React, { useEffect, useState } from "react";
import { fetchMyEquipments, fetchImageById } from "../../services/api";
import { Link } from "react-router-dom";
import "../../assets/EquipmentsPage.css";

const MyEquipmentsPage = () => {
  const [myEquipments, setMyEquipments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMyEquipments = async () => {
      try {
        const data = await fetchMyEquipments();
        setMyEquipments(data);

        for (const item of data) {
          if (item.mainImageId) {
            const image = await fetchImageById(item.mainImageId);
            setImageUrls((prev) => ({
              ...prev,
              [item.id]: image,
            }));
          }
        }
      } catch (err) {
        setError("Не вдалося завантажити ваші оголошення");
        console.error(err);
      }
    };

    loadMyEquipments();
  }, []);

  return (
    <div className="equipments-page">
      <h2>Мої оголошення</h2>
      {error && <p className="error">{error}</p>}
      <div className="equipment-list">
        {myEquipments.map((item) => (
          <div key={item.id} className="equipment-card">
            <h3>{item.name}</h3>
            {imageUrls[item.id] ? (
              <img src={imageUrls[item.id]} alt={item.name} width="200" />
            ) : (
              <p>Завантаження зображення...</p>
            )}
            <div className="actions">
              <Link to={`/equipment/${item.id}`}>👁 Переглянути</Link>
              <Link to={`/equipment/${item.id}/edit`}>✏️ Редагувати</Link>
            </div>
          </div>
        ))}
      </div>
      <Link to="/equipment/upload" className="upload-link">
        ➕ Завантажити власне обладнання
      </Link>
    </div>
  );
};

export default MyEquipmentsPage;