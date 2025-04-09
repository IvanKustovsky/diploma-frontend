import React, { createContext, useContext, useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken, logOutUser } from "../services/api";
import { setAccessToken, getAccessToken, clearAccessToken } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // поки перевіряємо токен
  const navigate = useNavigate();

  const logIn = (accessToken) => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
  };

  const logOut = async () => {
    try {
      await logOutUser();
    } catch (e) {
      console.error("Logout failed", e);
    }
    clearAccessToken();
    setIsAuthenticated(false);
    navigate("/login");
  };

  // 🟡 Встановлюємо статус авторизації при першому завантаженні
  useLayoutEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          // Спробуємо оновити токен, якщо є refresh cookie
          const response = await refreshToken();
          const newToken = response.access_token;
          setAccessToken(newToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Користувач не автентифікований");
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, logIn, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
