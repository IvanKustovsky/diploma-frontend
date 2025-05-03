import React, { useEffect, useState } from "react";
import {
    fetchMyOutgoingRentals,
    fetchEquipmentById,
    fetchImageById,
    cancelRentalRequest
} from "../../services/api";
import "../../assets/EquipmentsPage.css";
import { rentalStatusTranslations } from '../../data/translations';

const IncomingRentalRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [equipmentMap, setEquipmentMap] = useState({});
    const [imageMap, setImageMap] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const pageData = await fetchMyOutgoingRentals(currentPage, pageSize);
            setRequests(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
            setCurrentPage(pageData.number || 0);

            const uniqueIds = [...new Set((pageData.content || []).map(r => r.equipmentId))];
            const newEquip = {};
            const newImages = {};

            for (const id of uniqueIds) {
                try {
                    const equip = await fetchEquipmentById(id);
                    newEquip[id] = equip;
                    if (equip.mainImageId) {
                        try {
                            const imageUrl = await fetchImageById(equip.mainImageId);
                            newImages[id] = imageUrl;
                        } catch {
                            newImages[id] = null;
                        }
                    } else {
                        newImages[id] = null;
                    }
                } catch {
                    newEquip[id] = { error: true };
                    newImages[id] = null;
                }
            }

            setEquipmentMap(newEquip);
            setImageMap(newImages);
        } catch (err) {
            console.error("Помилка при завантаженні:", err);
            setError("Не вдалося завантажити запити на оренду.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, pageSize]);

    const handleCancel = async (rentalId) => {
        if (!window.confirm("Ви впевнені, що хочете скасувати цей запит?")) return;
        try {
            await cancelRentalRequest(rentalId);
            await loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handlePreviousPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    return (
        <div className="equipments-page">
            <h2>Мої запити на оренду</h2>

            {loading && <div className="loading">Завантаження...</div>}
            {error && <p className="error">{error}</p>}
            {!loading && requests.length === 0 && (
                <div className="no-items">Немає запитів на оренду.</div>
            )}

            {!loading && requests.length > 0 && (
                <div className="equipment-list">
                    {requests.map(request => {
                        const equip = equipmentMap[request.equipmentId];
                        const imageUrl = imageMap[request.equipmentId];
                        const name = equip && !equip.error ? equip.name : `Обладнання ID: ${request.equipmentId}`;
                        const price = equip && !equip.error ? `${equip.price} грн` : "Н/Д";

                        return (
                            <div key={request.id} className="equipment-card">
                                <h3>{name}</h3>
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={name}
                                        onError={() => {
                                            setImageMap(prev => ({ ...prev, [request.equipmentId]: null }));
                                        }}
                                    />
                                ) : (
                                    <div className="image-placeholder">Фото недоступне</div>
                                )}
                                <p><strong>Ціна:</strong> {price}</p>
                                <p><strong>Дати:</strong> {request.startDate} - {request.endDate}</p>
                                <p><strong>Адреса:</strong> {request.address}</p>
                                <p><strong>Статус:</strong> {rentalStatusTranslations[request.status] || request.status}</p>

                                {request.status === "PENDING" && (
                                    <button onClick={() => handleCancel(request.id)}>
                                        Скасувати запит
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={handlePreviousPage} disabled={currentPage === 0 || loading}>
                        Попередня
                    </button>
                    <span>Сторінка {currentPage + 1} з {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1 || loading}>
                        Наступна
                    </button>
                    <div className="page-size-selector">
                        <label htmlFor="pageSizeSelect">Елементів на сторінці:</label>
                        <select
                            id="pageSizeSelect"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            disabled={loading}
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

export default IncomingRentalRequestsPage;