const Checkbox = ({ label, checked, onChange }) => {
  return (
    <div className="checkbox-field mb-4">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="custom-checkbox"
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
