import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerEquipment, getCategoriesWithSubcategories } from "../../services/api";
import "../../assets/UploadEquipmentPage.css";
import { categoryTranslations, subcategoryTranslations } from '../../data/translations';

const UploadEquipmentPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [categoriesData, setCategoriesData] = useState({});
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesWithSubcategories(); 
        setCategoriesData(data);
      } catch (err) {
        console.error("Помилка завантаження категорій:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Якщо зображення не завантажено — питаємо користувача
    if (!imageFile) {
      const proceed = window.confirm(
        "Обладнання без головного зображення не буде доступним іншим користувачам, " +
        "але ви можете завантажити його пізніше. Додати фото пізніше?"
      );
      if (!proceed) {
        return;
      }
    }

    const equipmentDto = {
      name,
      description,
      category,
      subcategory,
      price: parseFloat(price),
      condition,
    };

    try {
      await registerEquipment(equipmentDto, imageFile);
      navigate("/equipments");
    } catch (err) {
      setError("Не вдалося завантажити обладнання");
      console.error(err);
    }
  };

  return (
    <div className="upload-equipment-page">
      <h2>Завантажити нове обладнання</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Назва:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Опис:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Категорія:</label>
          <select value={category} onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory(""); // скидаємо підкатегорію при зміні категорії
          }} required>
            <option value="">Оберіть категорію</option>
            {Object.keys(categoriesData).map((key) => (
              <option key={key} value={key}>
                {categoryTranslations[key] || key}
              </option>
            ))}
          </select>
        </div>

        {category && (
          <div>
            <label>Підкатегорія:</label>
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required>
              <option value="">Оберіть підкатегорію</option>
              {categoriesData[category]?.map((sub) => (
                <option key={sub} value={sub}>
                  {subcategoryTranslations[sub] || sub}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label>Ціна:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Стан:</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          >
            <option value="NEW">Новий</option>
            <option value="USED">Вживаний</option>
            <option value="REFURBISHED">Відновлений</option>
          </select>
        </div>
        <div>
          <label>Зображення (необов'язкове):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        <button type="submit">Завантажити</button>
      </form>
    </div>
  );
};

export default UploadEquipmentPage;
