import React, { useState, useMemo, useEffect } from "react";
import { createRental, fetchEquipmentById } from "../../services/api";
import "../../assets/RentFormPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { validateRentalForm } from "../../utils/validation";
import cities from '../../data/cities.json';
import { categoryTranslations } from '../../data/translations';

const RentFormPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { equipmentId } = location.state || {};

    const [equipment, setEquipment] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [query, setQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState(null);
    const [error, setError] = useState(null);
    const [rentalValidationErrors, setRentalValidationErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const loadEquipment = async () => {
            try {
                const data = await fetchEquipmentById(equipmentId);
                setEquipment(data);
            } catch (err) {
                setError("Не вдалося завантажити дані обладнання.");
                console.error(err);
            }
        };

        if (equipmentId) {
            loadEquipment();
        }
    }, [equipmentId]);

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayString = getTodayDateString();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const fullAddress = selectedCity
            ? `${selectedCity.city.trim()}, ${selectedCity.district.trim()}, ${selectedCity.region.trim()}`
            : query;

        const formData = { startDate, endDate, address: fullAddress };
        const errors = validateRentalForm(formData);

        if (Object.keys(errors).length > 0) {
            setRentalValidationErrors(errors);
            setError(null);
            return;
        }

        setRentalValidationErrors({});

        if (!equipmentId) {
            setError("Не вказано ID обладнання.");
            return;
        }

        const rentalDto = {
            equipmentId,
            startDate,
            endDate,
            address: fullAddress,
        };

        try {
            await createRental(rentalDto);
            setIsSuccess(true);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error(err);
            setIsSuccess(false);
        }
    };

    const filteredCities = useMemo(() => {
        if (!query.trim()) return [];
        return cities.filter(({ city }) =>
            city.trim().toLowerCase().includes(query.trim().toLowerCase())
        ).slice(0, 10);
    }, [query]);

    const handleSelect = (city) => {
        setSelectedCity(city);
        setQuery(`${city.city.trim()}, ${city.district.trim()}, ${city.region.trim()}`);
    };

    const handleGoBackToEquipments = () => {
        navigate("/equipments");
    };

    return (
        <div className="rent-form-page">
            <h2>Створити оренду для обладнання</h2>

            {equipment && (
                <div className="equipment-summary">
                    <p><strong>Назва:</strong> {equipment.name}</p>
                    <p><strong>Категорія:</strong> {categoryTranslations[equipment.category] || equipment.category}</p>
                    <p><strong>Ціна:</strong> {equipment.price} грн</p>
                </div>
            )}

            {isSuccess ? (
                <div className="success-message">
                    <p>Оренду успішно створено!</p>
                    <p>Власника обладнання повідомлено. Будь ласка, очікуйте на його підтвердження.</p>
                    <button onClick={handleGoBackToEquipments}>Повернутись до пошуку обладнання</button>
                </div>
            ) : (
                <>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="startDate">Дата початку оренди:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (endDate && new Date(e.target.value) > new Date(endDate)) {
                                        setEndDate("");
                                    }
                                }}
                                required
                                min={todayString}
                            />
                            {rentalValidationErrors.startDate && (
                                <p className="validation-error">{rentalValidationErrors.startDate}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="endDate">Дата кінця оренди:</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                min={startDate || todayString}
                            />
                            {rentalValidationErrors.endDate && (
                                <p className="validation-error">{rentalValidationErrors.endDate}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="address">Місто (адреса):</label>
                            <input
                                type="text"
                                id="address"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedCity(null);
                                }}
                                required
                                placeholder="Введіть назву міста"
                                autoComplete="off"
                            />
                            {filteredCities.length > 0 && (
                                <ul className="city-suggestions">
                                    {filteredCities.map((city, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSelect(city)}
                                            className="suggestion-item"
                                        >
                                            {city.city.trim()}, {city.district.trim()}, {city.region.trim()}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {rentalValidationErrors.address && (
                                <p className="validation-error">{rentalValidationErrors.address}</p>
                            )}
                        </div>
                        <button type="submit">Створити оренду</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default RentFormPage;
