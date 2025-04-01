// SignUp.js
import React, { useState } from "react";
import { registerUser } from "../../services/api";
import useForm from "../../hooks/useForm";
import { validateSignup } from "../../utils/validation";
import "../../assets/SignUpForm.css";
import { InputField, PhoneInput, CompanyCodeInput, Checkbox, SubmitButton } from "../../components/form";

const SignUp = () => {
  const [formData, handleChange, setFormData] = useForm({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [includeCompany, setIncludeCompany] = useState(false);
  const [companyData, setCompanyData] = useState({ name: "", code: "", address: "" });

  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateSignup(formData, includeCompany, companyData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setValidationErrors({});

      // Додаємо +380 до номера телефону перед відправкою
      const mobileNumberWithPrefix = `+380${formData.mobileNumber}`;

      const bodyData = includeCompany 
        ? { ...formData, mobileNumber: mobileNumberWithPrefix, company: companyData } 
        : { ...formData, mobileNumber: mobileNumberWithPrefix };
        await registerUser(bodyData);
        setSuccess(true);
      } catch (err) {
        setError(err.data?.errorMessage || "Щось пішло не так");
        setSuccess(false);
      }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
  };

  return (
    <div className="signup-page">
      <main className="signup-content">
        <h2>Реєстрація</h2>
        {success && <p className="success-message">Реєстрація успішна!</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <InputField
            label="Ім'я"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={validationErrors.firstName}
          />

          <InputField
            label="Прізвище"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={validationErrors.lastName}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
          />

          <PhoneInput
            value={formData.mobileNumber}
            onChange={(value) => setFormData({ ...formData, mobileNumber: value })}
            error={validationErrors.mobileNumber}
          />

          <InputField
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
          />

          <Checkbox
            label="Додати компанію"
            checked={includeCompany}
            onChange={() => setIncludeCompany(!includeCompany)}
          />

          {includeCompany && (
            <>
              <InputField
                label="Назва компанії"
                name="name"
                value={companyData.name}
                onChange={handleCompanyChange}
                error={validationErrors["company.name"]}
              />

              <CompanyCodeInput
                value={companyData.code}
                onChange={(value) =>
                  setCompanyData({ ...companyData, code: value })
                }
                error={validationErrors["company.code"]}
              />

              <InputField
                label="Адреса компанії"
                name="address"
                value={companyData.address}
                onChange={handleCompanyChange}
                error={validationErrors["company.address"]}
              />
            </>
          )}

          <SubmitButton label="Зареєструватися" />
        </form>
      </main>
    </div>
  );
};

export default SignUp;
