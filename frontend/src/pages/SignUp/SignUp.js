// SignUp.js
import React, { useState } from "react";
import { registerUser } from "../../services/api";
import "../../assets/SignUpForm.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [includeCompany, setIncludeCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    code: "",
    address: "",
  });

  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // Стан для валідаційних помилок
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const field = name.split(".")[1];
      setCompanyData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = () => {
    setIncludeCompany(!includeCompany);
    if (!includeCompany) {
      setCompanyData({
        name: "",
        code: "",
        address: "",
      });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const bodyData = includeCompany
    ? { ...formData, company: companyData }
    : formData;

  try {
    setValidationErrors({}); // Очищуємо попередні помилки
    setError(null);
    setSuccess(false);

    const response = await registerUser(bodyData);

    // Якщо реєстрація успішна
    setSuccess(true);
  } catch (err) {
    if (err.status === 400) {
      // Помилки валідації
      setValidationErrors(err.data); // Зберігаємо помилки валідації
    } else if (err.status === 409) {
      setError(err.data.errorMessage || "Користувач з таким email вже існує");
    } else {
      setError("Щось пішло не так");
    }
    setSuccess(false);
  }
};

return (
  <div className="signup-page">
    <h2>Реєстрація</h2>
    {success && <p className="success-message">Реєстрація успішна!</p>}
    {error && <p className="error-message">{error}</p>}
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="firstName"
          placeholder="Ім'я"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        {validationErrors.firstName && (
          <p className="validation-error">{validationErrors.firstName}</p>
        )}
      </div>
      <div>
        <input
          type="text"
          name="lastName"
          placeholder="Прізвище"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        {validationErrors.lastName && (
          <p className="validation-error">{validationErrors.lastName}</p>
        )}
      </div>
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validationErrors.email && (
          <p className="validation-error">{validationErrors.email}</p>
        )}
      </div>
      <div>
        <div className="phone-input">
          <span className="phone-prefix">+380</span>
          <input
            type="text"
            name="mobileNumber"
            placeholder="Номер телефону"
            value={formData.mobileNumber.replace(/\D/g, '').slice(0, 9)}
            onChange={(e) =>
              setFormData({
                ...formData,
                mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 9),
              })
            }
            maxLength={9} // обмеження на 9 символів
            required
          />
        </div>
        {validationErrors.mobileNumber && (
          <p className="validation-error">{validationErrors.mobileNumber}</p>
        )}
      </div>
      <div>
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {validationErrors.password && (
          <p className="validation-error">{validationErrors.password}</p>
        )}
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={includeCompany}
            onChange={handleCheckboxChange}
          />
          Компанія?
        </label>
      </div>
      {includeCompany && (
        <>
          <div>
            <input
              type="text"
              name="company.name"
              placeholder="Назва компанії"
              value={companyData.name}
              onChange={handleChange}
            />
            {validationErrors["company.name"] && (
              <p className="validation-error">
                {validationErrors["company.name"]}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="company.code"
              placeholder="Код компанії"
              value={companyData.code.replace(/\D/g, '').slice(0, 8)}
              onChange={(e) =>
                setCompanyData({
                  ...companyData,
                  code: e.target.value.replace(/\D/g, '').slice(0, 8),
                })
              }
              required
            />
            {validationErrors["company.code"] && (
              <p className="validation-error">
                {validationErrors["company.code"]}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="company.address"
              placeholder="Адреса компанії"
              value={companyData.address}
              onChange={handleChange}
            />
            {validationErrors["company.address"] && (
              <p className="validation-error">
                {validationErrors["company.address"]}
              </p>
            )}
          </div>
        </>
      )}
      <button type="submit">Зареєструватися</button>
    </form>
  </div>
);
};

export default SignUp;