const SubmitButton = ({ label }) => {
  return (
    <button
      type="submit"
      className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      {label}
    </button>
  );
};

export default SubmitButton;
