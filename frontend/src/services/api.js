// api.js
import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/auth";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/e2rent",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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
    "/auth/api/v1/refresh"
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
    console.log("📛 Interceptor error details:", {
      hasResponse: !!error.response,
      status: error.response?.status,
      code: error.code,
      message: error.message,
    });
    const originalRequest = error.config;
    const status = error.response?.status;
    const isLoginRequest = originalRequest.url?.includes("/auth/api/v1/login"); // Пропускаємо refresh для login запиту

    if ((status === 401) && !isLoginRequest && !originalRequest.retry) { // щоб уникнути зациклення
      originalRequest._retry = true;
      try {
        const response = await refreshToken();
        const newToken = response.access_token;

        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest); // Повторюємо оригінальний запит
      } catch (refreshError) {
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
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Щось пішло не так"); 
  }
};

export const fetchCurrentUserId = async () => {
  try {
    const response = await apiClient.get("/users/api/v1/getUserIdFromToken");
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося отримати userId");
  }
};

export const fetchUserInfoById = async (id) => {
  try {
    const response = await apiClient.get(`/users/api/v1/${id}`, id);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Щось пішло не так");
  }
};

export const logInUser = async (userData) => {
  try {
    const body = { username: userData.email, password: userData.password };
    const response = await apiClient.post("/auth/api/v1/login", body);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Щось пішло не так");
  }
};

export const logOutUser = async () => {
  try {
    const response = await apiClient.post("/auth/api/v1/logout");
    return response.status;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Помилка при виході з системи");
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post("/auth/api/v1/refresh", null);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося оновити токен");
  }
};

export const fetchPendingAdvertisements = async () => {
  try {
    const response = await apiClient.get("/advertisement/api/v1/pending");
    return response.data.content;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити обладнання");
  }
};

export const fetchApprovedAdvertisementsByUserId = async (userId, page = 0, size = process.env.REACT_APP_PAGE_SIZE) => {
  try {
    const response = await apiClient.get(`/advertisement/api/v1/approved/user/${userId}`, {
      params: {
        page: page,
        size: size,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити обладнання");
  }
};

export const approveAdvertisement = async (id, payload) => {
  try {
    const response = await apiClient.put(`/advertisement/api/v1/${id}/approve`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося підтвердити оголошення");
  }
};

export const rejectAdvertisement = async (id, payload) => {
  try {
    const response = await apiClient.put(`/advertisement/api/v1/${id}/reject`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося відхилити оголошення");
  }
};

export const fetchMyAdvertisements = async (page = 0, size = process.env.REACT_APP_PAGE_SIZE) => {
  try {
    const response = await apiClient.get("/advertisement/api/v1/my", {
      params: {
        page: page,
        size: size,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити обладнання");
  }
};

export const searchAdvertisements = async (filters, page = 0, size = process.env.REACT_APP_PAGE_SIZE) => {
  try {
    const params = {
      page: page,
      size: size,
      ...filters
    };
    const response = await apiClient.get("/advertisement/api/v1/approved", { params });
    return response.data;
  } catch (error) {
    console.error("Помилка завантаження оголошень з фільтрами:", error);
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити оголошення");
  }
};

export const activateEquipment = async (id) => {
  try {
    const response = await apiClient.put(`/equipments/api/v1/${id}/activate`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося активувати обладнання");
  }
};

export const deactivateEquipment = async (id) => {
  try {
    const response = await apiClient.put(`/equipments/api/v1/${id}/deactivate`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося деактивувати обладнання");
  }
};

export const getCategoriesWithSubcategories = async () => {
  try {
    const response = await apiClient.get("/equipments/api/v1/categories-with-subcategories");
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response;
    }
    throw new Error("Не вдалося завантажити категорії та підкатегорії");
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
        "Content-Type": "multipart/form-data",
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

    const response = await apiClient.post(`/equipments/api/v1/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.log(error)
    if (error.response) {
      throw error.response;
    }
    throw new Error(`Помилка при завантаженні додаткових зображень для обладнання з ID ${id}:`);
  }
};

/**
 * Створити новий запит на оренду
 * @param {object} rentalDto - DTO з даними для створення запиту на оренду
 * @returns {Promise<object>} - Дані створеного запиту на оренду
 * @throws {Error} - Якщо сервер повернув помилку або створення не вдалося
 */
export const createRental = async (rentalDto) => {
  try {
    const response = await apiClient.post("/rentals/api/v1", rentalDto);
    return response.data;
  } catch (error) {
    if (error.response?.data?.errorMessage) {
      throw new Error(error.response.data.errorMessage);
    }
    throw new Error("Не вдалося створити оренду");
  }
};

/**
 * Отримати запит на оренду по ID
 * @param {number} rentalId
 * @returns {Promise<object>}
 */
export const fetchRentalById = async (rentalId) => {
  try {
    const response = await apiClient.get(`/rentals/api/v1/${rentalId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch rental by ID:", error.response || error);
    throw new Error(error.response?.data?.errorMessage || "Не вдалося завантажити запит");
  }
};

/**
 * Отримати орендні запити, які створив поточний користувач
 * @param {number} [page=0] - Номер сторінки
 * @param {number} [size=10] - Кількість елементів на сторінці
 * @returns {Promise<object>} - Сторінка з орендними запитами
 */
export const fetchMyOutgoingRentals = async (page = 0, size = process.env.REACT_APP_PAGE_SIZE) => {
  try {
    const response = await apiClient.get(`/rentals/api/v1/outgoing`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    throw new Error("Не вдалося отримати ваші орендні запити");
  }
};

/**
 * Отримати запити на оренду, які були зроблені на обладнання поточного користувача
 * @param {number} [page=0] - Номер сторінки
 * @param {number} [size=10] - Кількість елементів на сторінці
 * @returns {Promise<object>} - Сторінка з вхідними орендними запитами
 */
export const fetchMyIncomingRentals = async (page = 0, size = process.env.REACT_APP_PAGE_SIZE) => {
  try {
    const response = await apiClient.get(`/rentals/api/v1/incoming`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    throw new Error("Не вдалося отримати запити на ваше обладнання");
  }
};

/**
 * Затвердити запит на оренду
 * @param {number} rentalId - ID запиту на оренду
 * @returns {Promise<object>} - Дані відповіді сервера (ймовірно ResponseDto)
 */
export const approveRentalRequest = async (rentalId) => {
  try {
    const response = await apiClient.put(`/rentals/api/v1/${rentalId}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.errorMessage || "Не вдалося затвердити запит");
  }
};

/**
 * Відхилити запит на оренду
 * @param {number} rentalId - ID запиту на оренду
 * @param {string} rejectionMessage - Причина відхилення
 * @returns {Promise<object>} - Дані відповіді сервера (ймовірно ResponseDto)
 */
export const rejectRentalRequest = async (rentalId, rejectionMessage) => {
  try {
    const requestBody = { rejectionMessage };
    const response = await apiClient.put(`/rentals/api/v1/${rentalId}/reject`, requestBody);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.errorMessage || "Не вдалося відхилити запит");
  }
};

/**
 * Скасувати запит на оренду (може зробити лише орендар, якщо ще не схвалено)
 * @param {number} rentalId - ID запиту на оренду
 * @returns {Promise<object>} - Дані відповіді сервера (ймовірно ResponseDto)
 */
export const cancelRentalRequest = async (rentalId) => {
  try {
    const response = await apiClient.put(`/rentals/api/v1/${rentalId}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.errorMessage || "Не вдалося скасувати запит");
  }
};

/**
 * Завантажити PDF документ для орендного запиту
 * @param {number} rentalId - ID орендного запиту
 * @returns {Promise<void>}
 */
export const downloadRentalPdf = async (rentalId) => {
  try {
    const response = await apiClient.get(`/rentals/api/v1/${rentalId}/pdf`, {
      responseType: 'arraybuffer',  // Важливо, щоб PDF був отриманий у вигляді бінарних даних
    });

    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `rental_${rentalId}.pdf`;
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
  } catch (error) {
    alert("Не вдалося завантажити PDF документ для цього оренду.");
  }
};