// api.js
import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/auth";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/e2rent",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // обов'язково, щоб надсилати cookie з refresh токеном
});

// ✅ Додаємо access_token до кожного запиту, що не є open-api
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log("access_token:", token)

  // 🔎 Лог всього запиту
  console.log("➡️ Запит:", {
    url: config.baseURL + config.url,
    method: config.method,
    headers: {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    data: config.data,
  });

  // Шляхи, які не потребують авторизації
  const openApiPaths = [
    "/users/api/v1/register",
    "/auth/api/v1/login",
    "/auth/api/v1/refresh",
    "/equipments/api/v1/all"
  ];

  const url = config.url?.replace(apiClient.defaults.baseURL, "") || "";
  const isOpenApi = openApiPaths.some((path) => url.startsWith(path));

  if (!isOpenApi && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔁 Якщо токен протермінувався — оновлюємо його
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) { // щоб уникнути зациклення
      console.log("Is error.response?.status === 403 ", error.response?.status === 403);
      console.log("Is !originalRequest._retry ", !originalRequest._retry);
      originalRequest._retry = true;

      try {
        const response = await refreshToken(); // Отримуємо новий access_token
        const newToken = response.access_token;

        setAccessToken(newToken); // Зберігаємо в localStorage
        originalRequest.headers.Authorization = `Bearer ${newToken}`; // Оновлюємо заголовок

        return apiClient(originalRequest); // Повторюємо запит
      } catch (refreshError) {
        // Якщо refresh не вдався — редирект або очищення токена
        clearAccessToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

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
    const body = { username: userData.email, password: userData.password };
    const response = await apiClient.post("/auth/api/v1/login", body);
    console.log("Login Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response || error);
    // Обробка помилок
    if (error.response) {
      console.error("Server responded with an error:", error.response.status);
      throw error.response;
    }
    console.error("No response from server");
    throw new Error("Щось пішло не так");
  }
};

export const logOutUser = async () => {
  try {
    const response = await apiClient.post("/auth/api/v1/logout");
    console.log("Logout successful:", response.status);
    return response.status;
  } catch (error) {
    console.error("Logout Error:", error.response || error);
    if (error.response) {
      console.error("Server responded with an error:", error.response.status);
      throw error.response;
    }
    throw new Error("Помилка при виході з системи");
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post("/auth/api/v1/refresh", null);
    return response.data; // Новий access_token у відповіді
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося оновити токен");
  }
};