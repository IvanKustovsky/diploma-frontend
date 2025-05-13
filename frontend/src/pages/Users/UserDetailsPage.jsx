import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { fetchUserInfoById } from "../../services/api";
import "../../assets/UserDetailsPage.css";
import { Link } from "react-router-dom";

const UserDetailsPage = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      setError(null);
      fetchUserInfoById(userId)
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Помилка завантаження користувача", err);
          setError("Не вдалося завантажити дані користувача.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (!userId && !loading) {
    console.warn("UserDetailsPage: userId не знайдено в location.state. Перенаправлення...");
    return <Navigate to="/equipments" replace />;
  }

  if (loading) {
    return <p className="loading-message">Завантаження даних користувача...</p>;
  }

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</p>;
  }

  if (!user) {
    return <p>Не вдалося знайти інформацію про користувача.</p>;
  }


  return (
    <div className="user-details-page">
      <h2>Інформація про користувача</h2>

      <div className="user-info-section">
        <p>
          <span className="info-label">Ім’я:</span>
          {user.fullName || "Не вказано"}
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
      <Link to={"/user-equipments"} state={{ userId, userEmail: user.email }} className="user-equipments-link">
        Усі обладнання користувача
      </Link>
    </div>
  );
};

export default UserDetailsPage;