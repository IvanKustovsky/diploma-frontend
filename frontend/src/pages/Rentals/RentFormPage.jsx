import React, { useState } from "react";
import { createRental } from "../../services/api";
import "../../assets/RentFormPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { validateRentalForm } from "../../utils/validation";

const RentFormPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { equipmentId } = location.state || {};

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState(null); // Загальна помилка API або логіки
    const [rentalValidationErrors, setRentalValidationErrors] = useState({}); // Стан для помилок валідації форми
    const [isSuccess, setIsSuccess] = useState(false); // Стан для повідомлення про успіх

    // Отримуємо поточну дату у форматі YYYY-MM-DD для атрибута min
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Місяці від 0 до 11
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayString = getTodayDateString();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Створюємо об'єкт з даними форми для валідації
        const formData = { startDate, endDate, address };
        const errors = validateRentalForm(formData); // Викликаємо функцію валідації

        // Перевіряємо, чи є помилки валідації
        if (Object.keys(errors).length > 0) {
            setRentalValidationErrors(errors); // Встановлюємо помилки валідації
            setError(null); // Очищаємо загальну помилку, якщо є помилки валідації
            return; // Зупиняємо виконання, якщо є помилки валідації
        }

        // Якщо валідація пройшла успішно, очищаємо попередні помилки валідації
        setRentalValidationErrors({});

        if (!equipmentId) {
            setError("Не вказано ID обладнання.");
            return;
        }

        const rentalDto = {
            equipmentId,
            startDate,
            endDate,
            address,
        };

        try {
            await createRental(rentalDto);
            setIsSuccess(true);
            setError(null);
        } catch (err) {
            setError(err.message); // err.message вже буде зрозумілим для користувача
            console.error(err);
            setIsSuccess(false);
        }
    };

    // Функція для повернення до списку обладнання
    const handleGoBackToEquipments = () => {
        navigate("/equipments");
    };

    return (
        <div className="rent-form-page">
            <h2>Створити оренду для обладнання</h2>

            {isSuccess ? ( // Умовно рендеримо повідомлення про успіх або форму
                <div className="success-message">
                    <p>Оренду успішно створено!</p>
                    <p>Власника обладнання повідомлено. Будь ласка, очікуйте на його підтвердження.</p>
                    <button onClick={handleGoBackToEquipments}>Повернутись до пошуку обладнання</button>
                </div>
            ) : (
                // Рендеримо форму, якщо оренда ще не створена
                <>
                    {error && <p className="error">{error}</p>} {/* Відображення загальної помилки */}
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="startDate">Дата початку оренди:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    // Якщо дата початку змінюється і вона пізніше за поточну кінцеву,
                                    // скидаємо кінцеву дату, щоб уникнути невалідного стану
                                    if (endDate && new Date(e.target.value) > new Date(endDate)) {
                                        setEndDate("");
                                    }
                                }}
                                required
                                min={todayString} // Встановлюємо мінімальну дату - сьогодні
                            />
                            {rentalValidationErrors.startDate && (
                                <p className="validation-error">{rentalValidationErrors.startDate}</p> // Відображення помилки валідації дати початку
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
                                min={startDate || todayString} // Встановлюємо мінімальну дату - дата початку або сьогодні, якщо дата початку не обрана
                            />
                            {rentalValidationErrors.endDate && (
                                <p className="validation-error">{rentalValidationErrors.endDate}</p> // Відображення помилки валідації дати кінця
                            )}
                        </div>
                        <div>
                            <label htmlFor="address">Адреса:</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                            {rentalValidationErrors.address && (
                                <p className="validation-error">{rentalValidationErrors.address}</p> // Відображення помилки валідації адреси
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
