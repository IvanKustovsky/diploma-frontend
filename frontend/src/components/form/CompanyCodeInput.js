import React from "react";

const CompanyCodeInput = ({ value, onChange, error }) => {
  return (
    <div className="input-field mb-4">
      <label className="block mb-1 font-medium">Код компанії (ЄДРПОУ)</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
        maxLength={8}
        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CompanyCodeInput;
