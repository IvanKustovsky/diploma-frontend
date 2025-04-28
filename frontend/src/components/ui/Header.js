import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/Header.css";

function Header() {
  const { isAuthenticated, roles, logOut } = useAuth();
  const isAdmin = roles.includes("ADMIN");

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
