// api.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/e2rent/users/api/v1";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Успішна відповідь
  } catch (error) {
    // Передаємо всю інформацію про помилки
    if (error.response) {
      throw error.response; // Кидаємо всю відповідь з сервера
    }
    throw new Error("Щось пішло не так"); // Загальна помилка
  }
};