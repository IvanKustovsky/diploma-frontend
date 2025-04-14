import React, { useEffect, useState } from "react";
import { fetchAllEquipments, fetchImageById } from "../../services/api"; // Додаємо fetchImageById
import { Link } from "react-router-dom";
import "../../assets/EquipmentsPage.css"; // стилі, якщо є

const EquipmentsPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // Додано стан для зображень
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEquipments = async () => {
      try {
        const data = await fetchAllEquipments();
        console.log("All equipments data: ", data);
        setEquipments(data);

        // Завантажуємо зображення для кожного обладнання
        for (const item of data) {
          const image = await fetchImageById(item.mainImageId); // Завантажуємо зображення за ID
          setImageUrls((prevUrls) => ({
            ...prevUrls,
            [item.id]: image, // Зберігаємо зображення в об'єкті з ID
          }));
        }
      } catch (err) {
        setError("Не вдалося завантажити обладнання");
        console.error(err);
      }
    };

    loadEquipments();
  }, []);

  return (
    <div className="equipments-page">
      <h2>Енергетичне обладнання</h2>
      {error && <p className="error">{error}</p>}
      <div className="equipment-list">
        {equipments.map((item) => (
          <div key={item.id} className="equipment-card">
            <h3>{item.name}</h3>
            {imageUrls[item.id] ? (
              <img
                src={imageUrls[item.id]} // Використовуємо зображення з imageUrls
                alt={item.name}
                width="200"
              />
            ) : (
              <p>Завантаження зображення...</p>
            )}
            <Link to={`/equipment/${item.id}`}>Детальніше</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentsPage;