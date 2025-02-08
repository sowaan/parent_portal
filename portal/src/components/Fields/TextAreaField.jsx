const TextAreaField = ({ label, value, onChange, rows, required, disabled }) => {
  return (
    <div>
      <label className="mb-3 block text-black dark:text-white">{label}</label>
      <textarea
        rows={rows ?? 6}
        placeholder={label}
        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      ></textarea>
    </div>
  );
};

export default TextAreaField;
