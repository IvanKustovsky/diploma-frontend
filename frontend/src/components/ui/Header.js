import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/Header.css";

function Header() {
  const { isAuthenticated, logOut } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <h1 className="header-title">E2Rent</h1>
        <nav className="header-nav">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
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