import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchEquipmentById,
  fetchImageById,
  updateEquipment,
  uploadMainImage,
  uploadAdditionalImages,
  getCategoriesWithSubcategories
} from "../../services/api";
import { categoryTranslations, subcategoryTranslations } from '../../data/translations';
import "../../assets/EditEquipmentPage.css";
import { validateEquipment } from "../../utils/validation";

const EditEquipmentPage = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [categoriesData, setCategoriesData] = useState({});
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState(false);

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

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await fetchEquipmentById(id);
        console.log(data)
        setEquipment(data);
        setMainImagePreview(null);
        setAdditionalImagePreviews([]);
        setIsLoadingImages(true);

        if (data.mainImageId) {
          try {
            const imgUrl = await fetchImageById(data.mainImageId);
            setMainImagePreview(imgUrl);
          } catch (imgErr) {
            console.error(`Помилка завантаження головного зображення ID ${data.mainImageId}:`, imgErr);
          }
        }

        if (data.imageIds && Array.isArray(data.imageIds)) {
          const additionalIds = data.imageIds.filter(imgId => imgId !== data.mainImageId);

          if (additionalIds.length > 0) {
            const imagePromises = additionalIds.map(async (imgId) => {
              try {
                const url = await fetchImageById(imgId);
                return { id: imgId, url: url };
              } catch (err) {
                console.error(`Помилка завантаження зображення ID ${imgId}:`, err);
                return null;
              }
            });

            const settledImages = await Promise.all(imagePromises);

            setAdditionalImagePreviews(settledImages.filter(img => img !== null));
          }
        }
      } catch (err) {
        console.error("Помилка при завантаженні обладнання:", err);
      } finally {
        setIsLoadingImages(false);
      }
    };
    loadEquipment();
  }, [id]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "pricePerDay") {
      updatedValue = value.trim();
      if (updatedValue !== "" && !isNaN(updatedValue)) {
        updatedValue = parseFloat(updatedValue).toString();
      } else if (updatedValue === "") {
        updatedValue = "";
      }
    } else {
      updatedValue = value.trim();
    }

    setEquipment({
      ...equipment,
      [name]: updatedValue,
    });
  };

  const handleEquipmentUpdate = async () => {
    const errors = validateEquipment(equipment);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await updateEquipment(id, equipment);
      alert("Оголошення оновлено!");
      setValidationErrors({});
    } catch (err) {
      alert("Помилка оновлення.");
      console.error("Update Error:", err);
    }
  };

  const reloadImages = async () => {
    setIsLoadingImages(true);
    setMainImagePreview(null);
    setAdditionalImagePreviews([]);
    try {
      const data = await fetchEquipmentById(id);
      setEquipment(data);

      if (data.mainImageId) {
        try {
          const imgUrl = await fetchImageById(data.mainImageId);
          setMainImagePreview(imgUrl);
        } catch (imgErr) {
          console.error(`Помилка перезавантаження головного зображення ID ${data.mainImageId}:`, imgErr);
        }
      }

      if (data.imageIds && Array.isArray(data.imageIds)) {
        const additionalIds = data.imageIds.filter(imgId => imgId !== data.mainImageId);
        if (additionalIds.length > 0) {
          const imagePromises = additionalIds.map(async (imgId) => {
            try {
              const url = await fetchImageById(imgId);
              return { id: imgId, url: url };
            } catch (err) {
              console.error(`Помилка перезавантаження зображення ID ${imgId}:`, err);
              return null;
            }
          });
          const settledImages = await Promise.all(imagePromises);
          setAdditionalImagePreviews(settledImages.filter(img => img !== null));
        }
      }
    } catch (err) {
      console.error("Помилка перезавантаження даних обладнання:", err);
    } finally {
      setIsLoadingImages(false);
    }
  }


  const handleMainImageUpload = async () => {
    if (!mainImageFile) return;
    try {
      await uploadMainImage(id, mainImageFile);
      alert("Головне зображення оновлено!");
      setMainImageFile(null);
      document.querySelector('input[type="file"][accept=".png, .jpg, .jpeg"]:not([multiple])').value = "";
      reloadImages();
    } catch (err) {
      alert("Не вдалося завантажити головне зображення.");
      console.error("Main Image Upload Error:", err);
    }
  };

  const handleAdditionalImagesUpload = async () => {
    if (additionalImages.length === 0) return;
    try {
      await uploadAdditionalImages(id, additionalImages);
      alert("Зображення додано!");
      setAdditionalImages([]);
      document.querySelector('input[type="file"][multiple]').value = "";
      reloadImages();
    } catch (err) {
      console.log(err)
      if (err.data?.errorMessage.includes("Досягнуто загальний ліміт")) {
        alert("Помилка: " + err.data?.errorMessage);
      } else {
        alert("Помилка завантаження зображень.");
      }
      console.error("Additional Images Upload Error:", err);
    }
  };

  if (!equipment) return <div className="loading">Завантаження...</div>;

  return (
    <div className="edit-equipment-page">
      <h2>Редагування оголошення "{equipment.name}"</h2>

      <div>
        <label>Назва:</label>
        <input
          type="text"
          name="name"
          value={equipment.name}
          onChange={handleFieldChange}
        />
        {validationErrors.name && <p className="error-message">{validationErrors.name}</p>}
      </div>

      <div>
        <label>Опис:</label>
        <textarea
          name="description"
          value={equipment.description}
          onChange={handleFieldChange}
          maxLength={255}
        />
        {validationErrors.description && <p className="error-message">{validationErrors.description}</p>}
      </div>

      <div>
        <label>Категорія:</label>
        <select
          name="category"
          value={equipment.category || ""}
          onChange={(e) => {
            const selectedCategory = e.target.value;
            setEquipment({
              ...equipment,
              category: selectedCategory,
              subcategory: selectedCategory === "OTHER" ? "OTHER" : "",
            });
          }}
          required
        >
          <option value="">Оберіть категорію</option>
          {Object.keys(categoriesData).map((key) => (
            <option key={key} value={key}>
              {categoryTranslations[key] || key}
            </option>
          ))}
        </select>
        {validationErrors.category && <p className="error-message">{validationErrors.category}</p>}
      </div>

      {equipment.category && equipment.category !== "OTHER" && (
        <div>
          <label>Підкатегорія:</label>
          <select
            name="subcategory"
            value={equipment.subcategory || ""}
            onChange={handleFieldChange}
            required={equipment.category !== "OTHER"}
          >
            <option value="">Оберіть підкатегорію</option>
            {categoriesData[equipment.category]?.map((sub) => (
              <option key={sub} value={sub}>
                {subcategoryTranslations[sub] || sub}
              </option>
            ))}
          </select>
          {validationErrors.subcategory && <p className="error-message">{validationErrors.subcategory}</p>}
        </div>
      )}

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
        {validationErrors.condition && <p className="error-message">{validationErrors.condition}</p>}
      </div>

      <div>
        <label>Ціна за день (грн):</label>
        <input
          type="number"
          name="pricePerDay"
          value={equipment.pricePerDay}
          onChange={handleFieldChange}
        />
        {validationErrors.pricePerDay && (
          <p className="error-message">{validationErrors.pricePerDay}</p>
        )}
      </div>

      <button onClick={handleEquipmentUpdate}>Оновити текстові поля</button>

      <hr />

      <h3>Зображення</h3>
      {isLoadingImages && <div className="loading">Завантаження зображень...</div>}

      <div className="image-section">
        <div className="main-image-container">
          <h4>Головне зображення</h4>
          {mainImagePreview ? (
            <img src={mainImagePreview} className="preview-image main-preview" alt="Головне" />
          ) : !isLoadingImages && (
            <p>Немає головного зображення</p>
          )}
          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            onChange={(e) => {
              setMainImageFile(e.target.files[0]);
              if (e.target.files[0]) {
                setMainImagePreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
          <button onClick={handleMainImageUpload} disabled={!mainImageFile || isLoadingImages}>
            {isLoadingImages ? 'Завантаження...' : 'Оновити головне зображення'}
          </button>
        </div>

        <div className="additional-images-container">
          <h4>Додаткові зображення</h4>
          <div className="additional-images-gallery">
            {!isLoadingImages && additionalImagePreviews.length > 0 ? (
              additionalImagePreviews.map((image) => (
                <img key={image.id} src={image.url} className="preview-image additional-preview" alt={`Додаткове ${image.id}`} />
              ))
            ) : !isLoadingImages && (
              <p>Немає додаткових зображень.</p>
            )}
          </div>
          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            multiple
            onChange={(e) => setAdditionalImages(Array.from(e.target.files))}
          />
          <button onClick={handleAdditionalImagesUpload} disabled={additionalImages.length === 0 || isLoadingImages}>
            {isLoadingImages ? 'Завантаження...' : 'Додати вибрані зображення'}
          </button>
        </div>
      </div>

      <hr />

      <Link className="back-link" to="/my-equipments">⬅️ Назад до моїх оголошень</Link>
    </div>
  );
};

export default EditEquipmentPage;