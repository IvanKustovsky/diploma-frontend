const InputField = ({ label, name, type = "text", placeholder, value, onChange, error }) => {
  return (
    <div className="input-field mb-4">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded`}
      />
      {error && <p className="text-error">{error}</p>}
    </div>
  );
};

export default InputField;
