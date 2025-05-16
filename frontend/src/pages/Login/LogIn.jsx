import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logInUser } from "../../services/api";
import useForm from "../../hooks/useForm";
import { InputField, SubmitButton } from "../../components/form";
import "../../assets/LogInForm.css";
import { useAuth } from "../../context/AuthContext";
import { validateLogin } from "../../utils/validation";

const LogIn = () => {
  const navigate = useNavigate();

  const [formData, handleChange] = useForm({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { logIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLogin(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setValidationErrors({});

      const response = await logInUser(formData);

      if (response.access_token) {
        await logIn(response.access_token);
        setSuccess(true);
        console.log("Navigating to /equipments")
        navigate("/equipments", { replace: true });
      } else {
        setError("Щось пішло не так");
      }
    } catch (err) {
      console.log("Помилка в catch:", err);
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
            placeholder="Введіть email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
          />
          <InputField
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
          />
          <SubmitButton label="Увійти" />
        </form>
      </main>
    </div>
  );
};

export default LogIn;
