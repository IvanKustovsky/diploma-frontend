import React, { createContext, useContext, useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken, logOutUser } from "../services/api";
import { setAccessToken, getAccessToken, clearAccessToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const extractRoles = (accessToken) => {
    try {
      const decodedToken = jwtDecode(accessToken);
      console.log(decodedToken);
      return decodedToken?.realm_access?.roles || [];
    } catch (e) {
      console.error("Failed to decode token", e);
      return [];
    }
  };

  const logIn = (accessToken) => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
    setRoles(extractRoles(accessToken));
  };

  const logOut = async () => {
    try {
      await logOutUser();
    } catch (e) {
      console.error("Logout failed", e);
    }
    clearAccessToken();
    setIsAuthenticated(false);
    setRoles([]);
    navigate("/login");
  };

  useLayoutEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          const response = await refreshToken();
          const newToken = response.access_token;
          setAccessToken(newToken);
          setIsAuthenticated(true);
          setRoles(extractRoles(newToken));
        } else {
          setIsAuthenticated(true);
          setRoles(extractRoles(token));
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
    <AuthContext.Provider value={{ isAuthenticated, roles, logIn, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
