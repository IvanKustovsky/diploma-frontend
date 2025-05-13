const PhoneInput = ({ value, onChange, error }) => {
  return (
    <div className="phone-input-container">
      <label className="block mb-1 font-medium">Номер телефону</label>
      <div className="phone-input-group">
        <span className="phone-prefix">+380</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
          maxLength={9}
          className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-r`}
          placeholder="Номер телефону"
          required
        />
      </div>
      {error && <p className="text-error">{error}</p>}
    </div>
  );
};

export default PhoneInput;