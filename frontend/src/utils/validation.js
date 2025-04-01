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
  