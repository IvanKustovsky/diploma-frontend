import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { fetchUserInfoById } from "../../services/api";
import "../../assets/UserDetailsPage.css";
import { Link } from "react-router-dom";

const UserDetailsPage = () => {
  const location = useLocation();
  // Додамо перевірку на існування state перед доступом до userId
  const userId = location.state?.userId;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Додамо стан завантаження
  const [error, setError] = useState(null); // Додамо стан помилки

  useEffect(() => {
    if (userId) {
      setLoading(true); // Починаємо завантаження
      setError(null); // Скидаємо помилку
      fetchUserInfoById(userId)
        .then((data) => {
          setUser(data);
          setLoading(false); // Завантаження завершено
        })
        .catch((err) => {
          console.error("Помилка завантаження користувача", err);
          setError("Не вдалося завантажити дані користувача.");
          setLoading(false); // Завантаження завершено з помилкою
        });
    } else {
      setLoading(false); // Якщо немає userId, завантаження не потрібне
    }
  }, [userId]);

  // Якщо userId не передано через state, перенаправляємо
  if (!userId && !loading) { // Додамо перевірку !loading, щоб уникнути миттєвого редиректу
    console.warn("UserDetailsPage: userId не знайдено в location.state. Перенаправлення...");
    return <Navigate to="/equipments" replace />;
  }

  // Показуємо повідомлення під час завантаження
  if (loading) {
    return <p className="loading-message">Завантаження даних користувача...</p>;
  }

  // Показуємо повідомлення про помилку
  if (error) {
    // Можна додати стиль для помилки аналогічно до loading-message
    return <p style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</p>;
  }

  // Якщо користувач не знайдений після завантаження (наприклад, API повернуло null або порожній об'єкт)
  if (!user) {
    return <p>Не вдалося знайти інформацію про користувача.</p>; // Або інше повідомлення
  }


  return (
    // Використовуємо клас замість inline стилю
    <div className="user-details-page">
      <h2>Інформація про користувача</h2>

      {/* Секція інформації про користувача */}
      <div className="user-info-section">
        <p>
          <span className="info-label">Ім’я:</span>
          {user.fullName || "Не вказано"} {/* Додамо обробку можливих null значень */}
        </p>
        <p>
          <span className="info-label">Email:</span>
          {user.email || "Не вказано"}
        </p>
        <p>
          <span className="info-label">Мобільний номер:</span>
          {user.mobileNumber || "Не вказано"}
        </p>
      </div>

      {/* Секція інформації про компанію (якщо є) */}
      {user.company && (
        <div className="company-info-section">
          <h3>Інформація про компанію</h3>
          <p>
            <span className="info-label">Назва компанії:</span>
            {user.company.name || "Не вказано"}
          </p>
          <p>
            <span className="info-label">Код компанії:</span>
            {user.company.code || "Не вказано"}
          </p>
          <p>
            <span className="info-label">Адреса компанії:</span>
            {user.company.address || "Не вказано"}
          </p>
        </div>
      )}
      <Link to={"/user-equipments"} state={{ userId, userEmail: user.email }}  className="user-equipments-link">
        Усі обладнання користувача
      </Link>
    </div>
  );
};

export default UserDetailsPage;