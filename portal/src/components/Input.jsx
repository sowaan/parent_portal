

const Input = ({ id, type, label, placeholder, value, onChanged, icon, required, isDisable }) => {
  return (
    <>
      <label htmlFor={id} className="mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChanged}
          required={required}
          disabled={isDisable}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        {icon}
      </div>
    </>
  );
};

export default Input;
