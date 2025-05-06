import React, { useEffect, useState } from "react";
import {
  fetchMyAdvertisements,
  fetchImageById,
  activateEquipment,
  deactivateEquipment,
} from "../../services/api";
import { Link } from "react-router-dom";
import { advertisementStatusTranslations } from '../../data/translations';
import "../../assets/EquipmentsPage.css";

const MyEquipmentsPage = () => {
  const DEFAULT_PAGE_SIZE = parseInt(process.env.REACT_APP_PAGE_SIZE || "5", 10);
  const [myEquipments, setMyEquipments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);

  const loadMyEquipments = async (page, size) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageData = await fetchMyAdvertisements(page, size);
      setMyEquipments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      for (const item of pageData.content) {
        if (item.mainImageId && !imageUrls[item.id]) {
          const image = await fetchImageById(item.mainImageId);
          setImageUrls((prev) => ({ ...prev, [item.id]: image }));
        }
      }
    } catch (err) {
      setError("Не вдалося завантажити ваші оголошення");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyEquipments(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleToggleStatus = async (equipmentId, status) => {
    const confirmed = window.confirm(
      status === "AVAILABLE"
        ? "Ви впевнені, що хочете деактивувати це оголошення?"
        : "Ви впевнені, що хочете активувати це оголошення?"
    );
    if (!confirmed) return;

    try {
      if (status === "AVAILABLE") {
        await deactivateEquipment(equipmentId);
      } else if (status === "INACTIVE") {
        await activateEquipment(equipmentId);
      }
      await loadMyEquipments(currentPage, pageSize);
    } catch (err) {
      console.error("Помилка зміни статусу обладнання:", err);
      setError("Не вдалося змінити статус.");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
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
          <div
            key={item.id}
            className={`equipment-card ${
              item.equipmentStatus === "AVAILABLE"
                ? "status-available"
                : item.equipmentStatus === "INACTIVE"
                ? "status-inactive"
                : ""
            }`}
          >
            <h3>{item.equipmentName}</h3>
            <h4>{advertisementStatusTranslations[item.status] || item.status}</h4>
            {item.status === "REJECTED" && item.adminMessage && (
              <h5 className="admin-message">{item.adminMessage}</h5>
            )}
            {imageUrls[item.id] ? (
              <img src={imageUrls[item.id]} alt={item.name} width="200" />
            ) : (
              <p>Завантаження зображення...</p>
            )}
            <p><strong>Ціна за день:</strong> {item.pricePerDay} грн</p>
            <div className="actions equipment-actions">
              <Link to={`/equipment/${item.id}`}>👁 Переглянути</Link>
              <Link to={`/equipment/${item.id}/edit`}>✏️ Редагувати</Link>
              {(item.equipmentStatus === "AVAILABLE" || item.equipmentStatus === "INACTIVE") && (
                <button
                  onClick={() => handleToggleStatus(item.equipmentId, item.equipmentStatus)}
                  className="action-link"
                >
                  {item.equipmentStatus === "AVAILABLE" ? "⛔ Деактивувати" : "✅ Активувати"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={handlePreviousPage} disabled={currentPage === 0 || isLoading}>
            Попередня
          </button>
          <span>Сторінка {currentPage + 1} з {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1 || isLoading}>
            Наступна
          </button>
          <div className="page-size-selector">
            <label htmlFor="pageSizeSelect">Елементів на сторінці:</label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={isLoading}
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

export default MyEquipmentsPage;
