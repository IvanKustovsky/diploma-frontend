import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/ProtectedRoute.css";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, roles } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    if (!showConfirm) {
      // Поки що нічого не рендеримо, чекаємо на перший рендер для відображення повідомлення
      setShowConfirm(true);
      return null;
    }

    // Якщо користувач не автентифікований, показуємо повідомлення та кнопки
    return (
      <div className="protected-route-container">
        <h2>Для доступу до цієї сторінки вам потрібно увійти в систему.</h2>
        <button
          onClick={() => navigate("/login", { state: { from: location }, replace: true })}
        >
          Перейти до входу
        </button>
        <button onClick={() => navigate(-1)}>Скасувати</button>
      </div>
    );
  }

  // Перевірка ролі ADMIN, якщо це вимагається маршрутом
  if (requireAdmin && (!roles || !roles.includes("ADMIN"))) {
    // Якщо потрібна роль ADMIN, але користувач її не має
    return <Navigate to="/unauthorized" replace />;
  }

  // Якщо користувач автентифікований (і має потрібну роль, якщо вимагається), рендеримо дочірні компоненти
  return children;
};

export default ProtectedRoute;
