import React, { useEffect, useState } from "react";
import { fetchMyEquipments, fetchImageById, activateEquipment, deactivateEquipment } from "../../services/api";
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

  const handleToggleStatus = async (equipmentId, status) => {
    const confirmMessage =
      status === "AVAILABLE"
        ? "Ви впевнені, що хочете деактивувати це оголошення?"
        : "Ви впевнені, що хочете активувати це оголошення?";

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      if (status === "AVAILABLE") {
        await deactivateEquipment(equipmentId);
      } else if (status === "INACTIVE") {
        await activateEquipment(equipmentId);
      }

      const updated = await fetchMyEquipments();
      setMyEquipments(updated);
    } catch (err) {
      console.error("Помилка зміни статусу обладнання:", err);
      setError("Не вдалося змінити статус.");
    }
  };

  return (
    <div className="equipments-page">
      <h2>Мої оголошення</h2>
      {error && <p className="error">{error}</p>}
      <Link to="/equipment/upload" className="upload-link prominent">
        ➕ Створити нове оголошення
      </Link>
      <div className="equipment-list">

        {myEquipments.map((item) => (
          <div key={item.id} className="equipment-card">
            <h3>{item.name}</h3>
            {imageUrls[item.id] ? (
              <img src={imageUrls[item.id]} alt={item.name} width="200" />
            ) : (
              <p>Завантаження зображення...</p>
            )}
            <p><strong>Ціна:</strong> {item.price} грн</p>
            <div className="actions equipment-actions">
              <Link to={`/equipment/${item.id}`}>👁 Переглянути</Link>
              <Link to={`/equipment/${item.id}/edit`}>✏️ Редагувати</Link>
              {(item.status === "AVAILABLE" || item.status === "INACTIVE") && (
                <button
                  onClick={() => handleToggleStatus(item.id, item.status)}
                  className="action-link"
                >
                  {item.status === "AVAILABLE" ? "⛔ Деактивувати" : "✅ Активувати"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEquipmentsPage;
