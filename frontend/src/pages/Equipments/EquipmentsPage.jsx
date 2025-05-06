import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchImageById, fetchApprovedAdvertisements } from "../../services/api";
import { Link } from "react-router-dom";
import "../../assets/EquipmentsPage.css";

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

  // Ref для відстеження всіх blob-URL
  const blobUrlsRef = useRef(new Set());

  // --- Функція для завантаження зображень ---
  const fetchAndSetImage = useCallback(async (itemId, imageId) => {
    let alreadyExists = false;
    setImageUrls(currentUrls => {
      if (currentUrls[itemId]) {
        alreadyExists = true;
      }
      return currentUrls;
    });

    if (alreadyExists) {
      return;
    }

    try {
      const imageBlobUrl = await fetchImageById(imageId);
      if (imageBlobUrl) {
        setImageUrls(prevUrls => ({
          ...prevUrls,
          [itemId]: imageBlobUrl,
        }));
        blobUrlsRef.current.add(imageBlobUrl);
      } else {
        setImageUrls(prevUrls => ({
          ...prevUrls,
          [itemId]: null,
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch image ${imageId} for item ${itemId}:`, error);
      setImageUrls(prevUrls => ({
        ...prevUrls,
        [itemId]: null,
      }));
    }
  }, []); // Залежності useCallback пусті, оскільки fetchImageById є імпортованою функцією

  // --- Функція для завантаження списку обладнання ---
  const loadEquipments = useCallback(async (page, size) => {
    setIsLoadingList(true);
    setError(null);
    try {
      const pageData = await fetchApprovedAdvertisements(page, size);
      console.log("Page data fetched: ", pageData);
      setEquipments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setCurrentPage(pageData.number || 0);
      setPageSize(pageData.size || size); // Оновлюємо розмір сторінки з відповіді, якщо він є
    } catch (err) {
      console.error("Failed to load equipment list:", err);
      setError("Не вдалося завантажити обладнання");
      setEquipments([]);
      setTotalPages(0);
    } finally {
      setIsLoadingList(false);
    }
  }, []); // Залежності: fetchApprovedAdvertisements

  // --- Ефект для завантаження списку при зміні сторінки або розміру ---
  useEffect(() => {
    loadEquipments(currentPage, pageSize);
  }, [currentPage, pageSize, loadEquipments]);

  // --- Ефект для завантаження зображень для поточного списку ---
  useEffect(() => {
    if (equipments.length === 0) {
      return;
    }

    const fetchImagesForCurrentList = async () => {
      setIsFetchingImages(true);
      const imagePromises = equipments
        .filter(item => item.mainImageId && imageUrls[item.id] === undefined) // Завантажуємо тільки якщо ID є і URL ще не існує
        .map(item => fetchAndSetImage(item.id, item.mainImageId));
      await Promise.allSettled(imagePromises);
      setIsFetchingImages(false);
    };

    fetchImagesForCurrentList();
  }, [equipments, fetchAndSetImage, imageUrls]); // Залежності: список обладнання, функція завантаження зображень, поточні URL зображень

  // --- Ефект для очищення blob-URL при розмонтуванні компонента ---
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
        console.log("Revoked blob URL:", url);
      });
      blobUrlsRef.current.clear();
    };
  }, []); // Порожній масив залежностей — запускається лише при монтуванні/розмонтуванні

  // --- Обробники для пагінації ---
  const handlePreviousPage = () => {
    // Не потрібно перевіряти isLoadingList тут, кнопка вже буде disabled
    setCurrentPage(prevPage => Math.max(0, prevPage - 1));
  };

  const handleNextPage = () => {
    // Не потрібно перевіряти isLoadingList тут, кнопка вже буде disabled
    setCurrentPage(prevPage => Math.min(totalPages - 1, prevPage + 1));
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setCurrentPage(0); // Скидаємо на першу сторінку при зміні розміру
  };

  return (
    <div className="equipments-page">
      <h2>Енергетичне обладнання</h2>

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
            // Стан завантаження для конкретного зображення (якщо є ID, але URL ще не встановлено)
            const isImageLoading = item.mainImageId && imageUrl === undefined;

            return (
              <div key={item.id} className="equipment-card">
                <h3>{item.equipmentName}</h3>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.equipmentName}
                    // width і height видалені, керування розміром через CSS
                    onError={(e) => {
                      console.warn(`Failed to load image resource: ${imageUrl}`);
                      // Замість display: none можна показати плейсхолдер або текст помилки
                      setImageUrls(prev => ({ ...prev, [item.id]: null })); // Позначити як помилку
                    }}
                  />
                ) : (
                  // Використовуємо клас замість інлайн стилів
                  <div className="image-placeholder">
                    {!item.mainImageId
                      ? 'Немає фото'
                      : (isFetchingImages || isImageLoading) // Показуємо завантаження, якщо глобально завантажуються зображення або конкретне це
                        ? 'Завантаження фото...'
                        : 'Фото недоступне' // Якщо URL = null або інша помилка
                    }
                  </div>
                )}
                <p><strong>Ціна за день:</strong> {item.pricePerDay} грн</p>
                <Link to={`/equipment/${item.id}`}>Детальніше</Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Елементи керування пагінацією */}
      {!isLoadingList && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0 || isLoadingList} // Disable під час завантаження списку
          >
            Попередня
          </button>
          <span>Сторінка {currentPage + 1} з {totalPages}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || isLoadingList} // Disable під час завантаження списку
          >
            Наступна
          </button>
          {/* Додано label та контейнер для кращого вигляду */}
          <div className="page-size-selector">
             <label htmlFor="pageSizeSelect">Елементів на сторінці:</label>
             <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={isLoadingList} // Disable під час завантаження списку
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