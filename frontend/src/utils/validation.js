// src/utils/validation.js

export const validateSignup = (formData, includeCompany, companyData) => {
  const errors = {};

  if (!formData.firstName.trim()) errors.firstName = "Ім'я обов'язкове";
  if (!formData.lastName.trim()) errors.lastName = "Прізвище обов'язкове";
  if (!formData.email.includes("@")) errors.email = "Некоректний email";
  if (formData.mobileNumber.length !== 9) errors.mobileNumber = "Некоректний номер";
  if (!formData.password.trim()) {
    errors.password = "Пароль обов'язковий";
  } else if (formData.password.length < 5) {
    errors.password = "Пароль має містити щонайменше 5 символів";
  }

  if (includeCompany) {
    if (!companyData.name.trim()) errors["company.name"] = "Назва компанії обов'язкова";
    if (companyData.code.length !== 8) errors["company.code"] = "Код має містити 8 цифр";
    if (!companyData.address.trim()) errors["company.address"] = "Адреса обов'язкова";
  }

  return errors;
};

export const validateLogin = (formData) => {
  const errors = {};

  if (!formData.email.trim()) {
    errors.email = "Email обов'язковий";
  } else if (!formData.email.includes("@")) {
    errors.email = "Некоректний email";
  }

  if (!formData.password.trim()) {
    errors.password = "Пароль обов'язковий";
  } else if (formData.password.length < 5) {
    errors.password = "Пароль має містити щонайменше 5 символів";
  }

  return errors;
};

export const validateEquipment = (equipment) => {
  const errors = {};

  if (!equipment.name || !equipment.name.trim()) {
    errors.name = "Назва обов'язкова";
  }

  if (!equipment.description || !equipment.description.trim()) {
    errors.description = "Опис обов'язковий";
  } else if (equipment.description.length > 255) {
    errors.description = "Опис не може перевищувати 255 символів";
  }

  if (!equipment.category) {
    errors.category = "Категорія обов'язкова";
  }

  if (!equipment.subcategory) {
    errors.subcategory = "Підкатегорія обов'язкова";
  }

  if (!equipment.condition) {
    errors.condition = "Стан обов'язковий";
  }

  if (equipment.price === undefined || equipment.price === null || equipment.price < 0) {
    errors.price = "Ціна має бути невід'ємним числом";
  }

  return errors;
};

export const validateAdminMessage = (message) => {
  const errors = {};
  if (!message.trim()) {
    errors.adminMessage = "Коментар адміністратора обов'язковий!";
  }
  return errors;
};

export const validateRentalForm = (formData) => {
  const errors = {};
  const today = new Date();
  // Set time to start of day to compare dates only
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);

  if (!formData.address.trim()) {
    errors.address = "Адреса обов'язкова";
  }

  // Validate start date is not before today
  if (!formData.startDate) {
    errors.startDate = "Дата початку оренди обов'язкова";
  } else if (startDate < today) {
    errors.startDate = "Дата початку оренди не може бути раніше сьогоднішньої";
  }

  // Validate end date is after start date
  if (!formData.endDate) {
    errors.endDate = "Дата кінця оренди обов'язкова";
  } else if (endDate <= startDate) {
    errors.endDate = "Дата кінця оренди має бути пізніше за дату початку";
  }


  return errors;
};
