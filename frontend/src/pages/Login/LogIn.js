// pages/LogIn.js
import React, { useState } from "react";
import { logInUser } from "../../services/api";
import useForm from "../../hooks/useForm";
import { InputField, SubmitButton } from "../../components/form";
import "../../assets/LogInForm.css";

const LogIn = () => {
  const [formData, handleChange] = useForm({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setError(null);
      setSuccess(false);
  
      const response = await logInUser(formData);
  
      if (response.access_token) {
        localStorage.setItem("access_token", response.access_token);
        setSuccess(true);
      } else {
        setError("Щось пішло не так"); // Якщо відповідь є, але неочікувана
      }
    } catch (err) {
      console.log("Помилка в catch:", err);
      // Перевіряємо, чи є відповідь від сервера і чи це помилка авторизації
      if (err.status === 401 || (err.data && err.data.error === "invalid_grant")) {
        setError("Невірні дані для входу");
      } else {
        setError("Щось пішло не так");
      }
    }
  };

  return (
    <div className="login-page">
      <main className="login-content">
        <h2>Вхід</h2>
        {success && <p className="success-message">Вхід успішний!</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder={"Введіть email"}
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          <SubmitButton label="Увійти" />
        </form>
      </main>
    </div>
  );
};

export default LogIn;