import { IconDropDown } from "../../common/Icons";

const SelectField = ({
  label,
  selectedOption,
  onChange,
  required,
  disabled,
  options,
}) => {
  return (
    <div>
      <label className="mb-2.5 block text-black dark:text-white">{label}</label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={selectedOption}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
            selectedOption ? "text-black dark:text-white" : ""
          }`}
        >
          {options}
        </select>

        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
          <IconDropDown />
        </span>
      </div>
    </div>
  );
};

export default SelectField;
