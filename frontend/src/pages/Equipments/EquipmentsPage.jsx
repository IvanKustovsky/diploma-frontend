import { useEffect, useState, useCallback, useRef } from "react";
import { fetchImageById, searchAdvertisements, getCategoriesWithSubcategories } from "../../services/api";
import { Link } from "react-router-dom";
import "../../assets/EquipmentsPage.css";
import { categoryTranslations, subcategoryTranslations } from '../../data/translations';

const EquipmentsPage = () => {
  const DEFAULT_PAGE_SIZE = parseInt(process.env.REACT_APP_PAGE_SIZE || "2", 10);
  const [equipments, setEquipments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    keyword: "",
  });

  const [categoriesData, setCategoriesData] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const blobUrlsRef = useRef(new Set());

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesWithSubcategories();
        setCategoriesData(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFilters((prevFilters) => ({ ...prevFilters, category: value, subcategory: "" }));
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadEquipments(0, pageSize, filters);
  };

  const loadEquipments = useCallback(async (page, size, filters) => {
    setIsLoadingList(true);
    setError(null);
    try {
      const pageData = await searchAdvertisements(filters, page, size);
      console.log("Page data fetched: ", pageData);
      setEquipments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setCurrentPage(pageData.number || 0);
      setPageSize(pageData.size || size);
    } catch (err) {
      console.error("Failed to load equipment list:", err);
      setError("Не вдалося завантажити обладнання");
      setEquipments([]);
      setTotalPages(0);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadEquipments(currentPage, pageSize, filters);
  }, [currentPage, pageSize, loadEquipments]);

  const fetchAndSetImage = useCallback(async (itemId, imageId) => {
    let alreadyExists = false;
    setImageUrls((currentUrls) => {
      if (currentUrls[itemId]) {
        alreadyExists = true;
      }
      return currentUrls;
    });

    if (alreadyExists) return;

    try {
      const imageBlobUrl = await fetchImageById(imageId);
      if (imageBlobUrl) {
        setImageUrls((prevUrls) => ({
          ...prevUrls,
          [itemId]: imageBlobUrl,
        }));
        blobUrlsRef.current.add(imageBlobUrl);
      } else {
        setImageUrls((prevUrls) => ({
          ...prevUrls,
          [itemId]: null,
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch image ${imageId} for item ${itemId}:`, error);
      setImageUrls((prevUrls) => ({
        ...prevUrls,
        [itemId]: null,
      }));
    }
  }, []);

  useEffect(() => {
    if (equipments.length === 0) return;

    const fetchImagesForCurrentList = async () => {
      setIsFetchingImages(true);
      const imagePromises = equipments
        .filter((item) => item.mainImageId && imageUrls[item.id] === undefined)
        .map((item) => fetchAndSetImage(item.id, item.mainImageId));
      await Promise.allSettled(imagePromises);
      setIsFetchingImages(false);
    };

    fetchImagesForCurrentList();
  }, [equipments, fetchAndSetImage, imageUrls]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
        console.log("Revoked blob URL:", url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(totalPages - 1, prevPage + 1));
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  return (
    <div className="equipments-page">
      <h2>Енергетичне обладнання</h2>

      <div className="filter-section"> {/* Додано клас filter-section */}
        {/* Пошук за ключовим словом та кнопка "Пошук" */}
        <div className="main-search">
          <input
            type="text"
            name="keyword"
            placeholder="Ключове слово"
            value={filters.keyword}
            onChange={handleFilterChange}
            className="filter-control" // Додано клас filter-control
          />
          <button onClick={handleSearch}>Пошук</button>
        </div>

        {/* Кнопка для розгортання/згортання додаткових фільтрів */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="toggle-filters-button" // Додано клас
        >
          {showAdvancedFilters ? "Згорнути фільтри" : "Розгорнути фільтри"}
        </button>

        {/* Додаткові фільтри (розгортаються/згортаються) */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-control" // Додано клас filter-control
            >
              <option value="">Всі категорії</option>
              {Object.keys(categoriesData).map((key) => (
                <option key={key} value={key}>
                  {categoryTranslations[key] || key}
                </option>
              ))}
            </select>

            {filters.category && (
              <select
                name="subcategory"
                value={filters.subcategory}
                onChange={handleFilterChange}
                className="filter-control" // Додано клас filter-control
              >
                <option value="">Всі підкатегорії</option>
                {categoriesData[filters.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {subcategoryTranslations[sub] || sub}
                  </option>
                ))}
              </select>
            )}

            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="filter-control" // Додано клас filter-control
            >
              <option value="">Всі стани</option>
              <option value="NEW">Новий</option>
              <option value="USED">Вживаний</option>
              <option value="REFURBISHED">Відновлений</option>
            </select>

            <div className="filter-group price-filters"> {/* Додано клас filter-group та price-filters */}
              <input
                type="number"
                name="minPrice"
                placeholder="Мін. ціна"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="filter-control" // Додано клас filter-control
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Макс. ціна"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="filter-control" // Додано клас filter-control
              />
            </div>
          </div>
        )}
      </div> {/* Закриття filter-section */}

      {isLoadingList && <div className="loading">Завантаження списку...</div>}
      {error && !isLoadingList && <p className="error">{error}</p>}

      {!isLoadingList && !error && equipments.length === 0 && (
        <div className="no-items">
          Наразі немає доступного обладнання для перегляду.
        </div>
      )}

      {!isLoadingList && equipments.length > 0 && (
        <div className="equipment-list">
          {equipments.map((item) => {
            const imageUrl = imageUrls[item.id];
            const isImageLoading = item.mainImageId && imageUrl === undefined;

            return (
              <div key={item.id} className="equipment-card">
                <h3>{item.equipmentName}</h3>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.equipmentName}
                    onError={(e) => {
                      console.warn(`Failed to load image resource: ${imageUrl}`);
                      setImageUrls((prev) => ({ ...prev, [item.id]: null }));
                    }}
                  />
                ) : (
                  <div className="image-placeholder">
                    {!item.mainImageId
                      ? "Немає фото"
                      : isFetchingImages || isImageLoading
                        ? "Завантаження фото..."
                        : "Фото недоступне"}
                  </div>
                )}
                <p>
                  <strong>Ціна за день:</strong> {item.pricePerDay} грн
                </p>
                <Link to={`/equipment/${item.id}`}>Детальніше</Link>
              </div>
            );
          })}
        </div>
      )}

      {!isLoadingList && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0 || isLoadingList}
          >
            Попередня
          </button>
          <span>
            Сторінка {currentPage + 1} з {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || isLoadingList}
          >
            Наступна
          </button>
          <div className="page-size-selector">
            <label htmlFor="pageSizeSelect">Елементів на сторінці:</label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={isLoadingList}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentsPage;