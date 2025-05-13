import { useState } from "react";
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
      setShowConfirm(true);
      return null;
    }

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

  if (requireAdmin && (!roles || !roles.includes("ADMIN"))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
