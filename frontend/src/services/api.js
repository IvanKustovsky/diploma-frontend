// api.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/e2rent",
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/users/api/v1/register", userData);
    return response.data; // Успішна відповідь
  } catch (error) {
    // Передаємо всю інформацію про помилки
    if (error.response) {
      throw error.response; // Кидаємо всю відповідь з сервера
    }
    throw new Error("Щось пішло не так"); // Загальна помилка
  }
};

export const logInUser = async (userData) => {
  try {
    // Формуємо body запиту для логіну в Keycloak
    const body = new URLSearchParams();
    body.append("client_id", process.env.REACT_APP_KEYCLOAK_CLIENT_ID);
    body.append("client_secret", process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET);
    body.append("grant_type", "password");
    body.append("username", userData.email); // Використовуємо email як username
    body.append("password", userData.password); // Пароль користувача

    // Викликаємо API для отримання токена
    const response = await apiClient.post("/auth/api/v1/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Повідомляємо серверу, що це форма
      },
    });

    return response.data; // Успішна відповідь
  } catch (error) {
    // Обробка помилок
    if (error.response) {
      throw error.response; // Кидаємо всю відповідь з сервера
    }
    throw new Error("Щось пішло не так");
  }
};