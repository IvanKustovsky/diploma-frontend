import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import {
  fetchImageById,
  fetchApprovedAdvertisementsByUserId,
} from "../../services/api";
import "../../assets/EquipmentsPage.css";

const UserEquipmentsPage = () => {
  const DEFAULT_PAGE_SIZE = parseInt(process.env.REACT_APP_PAGE_SIZE || "5", 10);
  const location = useLocation();
  const userId = location.state?.userId;
  const userEmail = location.state?.userEmail;

  const [equipments, setEquipments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);

  const blobUrlsRef = useRef(new Set());

  const fetchAndSetImage = useCallback(async (itemId, imageId) => {
    if (imageUrls[itemId] !== undefined) return;
    try {
      const image = await fetchImageById(imageId);
      setImageUrls(prev => ({ ...prev, [itemId]: image }));
      blobUrlsRef.current.add(image);
    } catch {
      setImageUrls(prev => ({ ...prev, [itemId]: null }));
    }
  }, [imageUrls]);

  const loadEquipments = useCallback(async (page, size) => {
    if (!userId) return;
    setIsLoadingList(true);
    try {
      const pageData = await fetchApprovedAdvertisementsByUserId(userId, page, size);
      setEquipments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setCurrentPage(pageData.number || 0);
      setPageSize(pageData.size || size);
    } catch (err) {
      setError("Не вдалося завантажити обладнання користувача.");
      setEquipments([]);
      setTotalPages(0);
    } finally {
      setIsLoadingList(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEquipments(currentPage, pageSize);
  }, [currentPage, pageSize, loadEquipments]);

  useEffect(() => {
    if (equipments.length === 0) return;
    const fetchImages = async () => {
      setIsFetchingImages(true);
      const promises = equipments
        .filter(item => item.mainImageId && imageUrls[item.id] === undefined)
        .map(item => fetchAndSetImage(item.id, item.mainImageId));
      await Promise.allSettled(promises);
      setIsFetchingImages(false);
    };
    fetchImages();
  }, [equipments, fetchAndSetImage, imageUrls]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  if (!userId) {
    return <Navigate to="/equipments" replace />;
  }

  const handlePreviousPage = () => setCurrentPage(p => Math.max(0, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="equipments-page">
      <h2>Обладнання користувача {userEmail && `(${userEmail})`}</h2>
      {error && <p className="error">{error}</p>}

      {isLoadingList && <div className="loading">Завантаження...</div>}

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
                    onError={() => setImageUrls(prev => ({ ...prev, [item.id]: null }))}
                  />
                ) : (
                  <div className="image-placeholder">
                    {!item.mainImageId
                      ? 'Немає фото'
                      : (isFetchingImages || isImageLoading)
                        ? 'Завантаження фото...'
                        : 'Фото недоступне'}
                  </div>
                )}
                <p><strong>Ціна за день:</strong> {item.pricePerDay} грн</p>
                <Link to={`/equipment/${item.id}`}>Детальніше</Link>
              </div>
            );
          })}
        </div>
      )}

      {!isLoadingList && totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={handlePreviousPage} disabled={currentPage === 0 || isLoadingList}>
            Попередня
          </button>
          <span>Сторінка {currentPage + 1} з {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1 || isLoadingList}>
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

export default UserEquipmentsPage;
