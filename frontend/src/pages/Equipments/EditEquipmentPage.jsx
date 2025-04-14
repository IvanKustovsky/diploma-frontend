import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchEquipmentById,
  fetchImageById,
  updateEquipment,
  uploadMainImage,
  uploadAdditionalImages
} from "../../services/api";
import "../../assets/EditEquipmentPage.css";

const EditEquipmentPage = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await fetchEquipmentById(id);
        setEquipment(data);
        if (data.mainImageId) {
          const imgUrl = await fetchImageById(data.mainImageId);
          setMainImagePreview(imgUrl);
        }
      } catch (err) {
        console.error("Помилка при завантаженні обладнання:", err);
      }
    };
    loadEquipment();
  }, [id]);

  const handleFieldChange = (e) => {
    setEquipment({
      ...equipment,
      [e.target.name]: e.target.value,
    });
  };

  const handleEquipmentUpdate = async () => {
    try {
      await updateEquipment(id, equipment, null);
      alert("Оголошення оновлено!");
    } catch (err) {
      alert("Помилка оновлення.");
    }
  };

  const handleMainImageUpload = async () => {
    if (!mainImageFile) return;
    try {
      await uploadMainImage(id, mainImageFile);
      alert("Головне зображення оновлено!");
    } catch (err) {
      alert("Не вдалося завантажити головне зображення.");
    }
  };

  const handleAdditionalImagesUpload = async () => {
    try {
      await uploadAdditionalImages(id, additionalImages);
      alert("Зображення додано!");
    } catch (err) {
      alert("Помилка завантаження зображень.");
    }
  };

  if (!equipment) return <div className="loading">Завантаження...</div>;

  return (
    <div className="edit-equipment-page">
      <h2>Редагування оголошення</h2>

      <div>
        <label>Назва:</label>
        <input
          type="text"
          name="name"
          value={equipment.name}
          onChange={handleFieldChange}
        />
      </div>

      <div>
        <label>Опис:</label>
        <textarea
          name="description"
          value={equipment.description}
          onChange={handleFieldChange}
        />
      </div>

      <div>
        <label>Категорія:</label>
        <input
          type="text"
          name="category"
          value={equipment.category || ""}
          onChange={handleFieldChange}
        />
      </div>

      <div>
        <label>Стан:</label>
        <select
          name="condition"
          value={equipment.condition || ""}
          onChange={handleFieldChange}
        >
          <option value="NEW">Новий</option>
          <option value="USED">Вживаний</option>
          <option value="REFURBISHED">Відновлений</option>
        </select>
      </div>

      <div>
        <label>Ціна:</label>
        <input
          type="number"
          name="price"
          value={equipment.price}
          onChange={handleFieldChange}
        />
      </div>

      <button onClick={handleEquipmentUpdate}>Оновити поля</button>

      <hr />

      <h3>Головне зображення</h3>
      {mainImagePreview && <img src={mainImagePreview} width="200" alt="main" />}
      <input
        type="file"
        onChange={(e) => setMainImageFile(e.target.files[0])}
      />
      <button onClick={handleMainImageUpload}>Оновити головне зображення</button>

      <h3>Додати інші зображення</h3>
      <input
        type="file"
        multiple
        onChange={(e) => setAdditionalImages(Array.from(e.target.files))}
      />
      <button onClick={handleAdditionalImagesUpload}>Додати зображення</button>
    </div>
  );
};

export default EditEquipmentPage;