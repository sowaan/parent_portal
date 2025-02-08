import { AttachFileClass } from "../../common/CommonClasses";

const AttachField = ({ label, onChange, required, disabled }) => {
  return (
    <div>
      <label className="mb-3 block text-black dark:text-white">{label}</label>
      <input
        type="file"
        required={required}
        onChange={onChange}
        disabled={disabled}
        className={`${AttachFileClass} w-full`}
      />
    </div>
  );
};

export default AttachField;
