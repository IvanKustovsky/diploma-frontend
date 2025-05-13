import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerEquipment, getCategoriesWithSubcategories } from "../../services/api";
import "../../assets/UploadEquipmentPage.css";
import { categoryTranslations, subcategoryTranslations } from '../../data/translations';
import { validateEquipment } from "../../utils/validation";

const UploadEquipmentPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [categoriesData, setCategoriesData] = useState({});
  const [pricePerDay, setPricePerDay] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

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

    const equipmentDto = {
      name,
      description,
      category,
      subcategory,
      pricePerDay: pricePerDay.trim(),
      condition,
    };

    const validationErrors = validateEquipment(equipmentDto);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!imageFile) {
      const proceed = window.confirm(
        "Обладнання без головного зображення не буде доступним іншим користувачам, " +
        "але ви можете завантажити його пізніше. Додати фото пізніше?"
      );
      if (!proceed) return;
    }

    try {
      await registerEquipment(equipmentDto, imageFile);
      navigate("/my-equipments");
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
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div>
          <label>Опис:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <p className="error">{errors.description}</p>}
        </div>
        <div>
          <label>Категорія:</label>
          <select
            value={category}
            onChange={(e) => {
              const selectedCategory = e.target.value;
              setCategory(selectedCategory);
              setSubcategory(selectedCategory === "OTHER" ? "OTHER" : "");
            }}
          >
            <option value="">Оберіть категорію</option>
            {Object.keys(categoriesData).map((key) => (
              <option key={key} value={key}>
                {categoryTranslations[key] || key}
              </option>
            ))}
          </select>
          {errors.category && <p className="error">{errors.category}</p>}
        </div>

        {category && category !== "OTHER" && (
          <div>
            <label>Підкатегорія:</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={category === "OTHER"}
            >
              <option value="">Оберіть підкатегорію</option>
              {categoriesData[category]?.map((sub) => (
                <option key={sub} value={sub}>
                  {subcategoryTranslations[sub] || sub}
                </option>
              ))}
            </select>
            {errors.subcategory && <p className="error">{errors.subcategory}</p>}
          </div>
        )}
        <div>
          <label>Ціна за день оренди (грн):</label>
          <input
            type="number"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
          />
          {errors.pricePerDay && <p className="error">{errors.pricePerDay}</p>}
        </div>
        <div>
          <label>Стан:</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="NEW">Новий</option>
            <option value="USED">Вживаний</option>
            <option value="REFURBISHED">Відновлений</option>
          </select>
          {errors.condition && <p className="error">{errors.condition}</p>}
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
