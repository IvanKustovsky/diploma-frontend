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
    // Детальне логування помилки
    console.log("📛 Interceptor error details:", {
      hasResponse: !!error.response,
      status: error.response?.status,
      code: error.code,
      message: error.message,
    });
    const originalRequest = error.config;
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !originalRequest._retry) { // щоб уникнути зациклення
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

export const fetchAllEquipments = async () => {
  try {
    const response = await apiClient.get("/equipments/api/v1/all");
    return response.data.content; // Повертаємо тільки масив об'єктів обладнання
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити обладнання");
  }
};

export const fetchMyEquipments = async () => {
  try {
    const response = await apiClient.get("/equipments/api/v1/my");
    return response.data.content; // Повертаємо тільки масив об'єктів обладнання
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити обладнання");
  }
};

export const fetchEquipmentById = async (id) => {
  try {
    const response = await apiClient.get(`/equipments/api/v1/${id}`);
    console.log("response from fetchEquipmentById ", response)
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити деталі обладнання");
  }
};

export const fetchImageById = async (id) => {
  try {
    const response = await apiClient.get(`/equipments/api/v1/images/${id}`, {
      responseType: "blob", // ⚠️ обов'язково, бо це зображення
    });
    return URL.createObjectURL(response.data); // перетворюємо на локальний url
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);
    throw error;
  }
};

export const registerEquipment = async (equipmentDto, file) => {
  try {
    const formData = new FormData();
    formData.append("equipmentDto", new Blob([JSON.stringify(equipmentDto)], { type: "application/json" }));
    if (file) {
      formData.append("main-image", file);
    }

    const response = await apiClient.post("/equipments/api/v1/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // не обов'язково, axios сам поставить, але можна явно
      },
    });

    return response.data;
  } catch (error) {
    console.error("Помилка при реєстрації обладнання:", error);
    throw error;
  }
};

export const updateEquipment = async (id, equipmentDto) => {
  try {
    const formData = new FormData();
    formData.append("equipmentDto", new Blob([JSON.stringify(equipmentDto)], { type: "application/json" }));

    const response = await apiClient.put(`/equipments/api/v1/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error(`Помилка при оновленні обладнання з ID ${id}:`, error);
    throw error;
  }
};

export const uploadMainImage = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append("main-image", file);

    const response = await apiClient.post(`/equipments/api/v1/${id}/images/main`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Помилка при завантаженні основного зображення для обладнання з ID ${id}:`, error);
    throw error;
  }
};

export const uploadAdditionalImages = async (id, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const response = await apiClient.post(`/equipments/api/v1/${id}/images`, formData,  {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Помилка при завантаженні додаткових зображень для обладнання з ID ${id}:`, error);
    throw error;
  }
};