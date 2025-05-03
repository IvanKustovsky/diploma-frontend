import React, { useState } from "react"; // Додано useState
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/Header.css"; // Переконайтесь, що CSS підключено

function Header() {
  const { isAuthenticated, roles, logOut } = useAuth();
  const isAdmin = roles.includes("ADMIN");
  // Стан для керування видимістю випадаючого меню
  const [isRentalsDropdownVisible, setIsRentalsDropdownVisible] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <Link to="/">
          <h1 className="header-title">E2Rent</h1>
        </Link>
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/equipments">Обладнання</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/my-equipments">Мої оголошення</Link>
              </li>
            )}
            {/* --- Змінено блок Оренди --- */}
            {isAuthenticated && (
              <li
                className="dropdown-container" // Клас для батьківського елемента
                onMouseEnter={() => setIsRentalsDropdownVisible(true)}
                onMouseLeave={() => setIsRentalsDropdownVisible(false)}
              >
                {/* Тепер це не посилання, а просто текст чи span */}
                <span>Оренди</span>
                {isRentalsDropdownVisible && (
                  <ul className="dropdown-menu">
                    <li>
                      {/* Посилання на сторінку, де користувач є ОРЕНДАРЕМ */}
                      <Link to="/outgoing-rental-requests">Мої оренди</Link>
                    </li>
                    <li>
                      {/* Посилання на сторінку, де користувач є ВЛАСНИКОМ */}
                      <Link to="/incoming-rental-requests">
                        Запити на мої оголошення
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
            {/* --- Кінець змін --- */}
            {isAuthenticated && isAdmin && (
              <li>
                <Link to="/moderation">Модерація</Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="header-right">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <button className="login-btn">Увійти</button>
              </Link>
              <Link to="/signup">
                <button className="signup-btn">Зареєструватись</button>
              </Link>
            </>
          ) : (
            <button className="logout-btn" onClick={logOut}>
              Вийти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;