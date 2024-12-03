import { CFormInput, CFormLabel } from "@coreui/react";

const Input = ({ id, value, lable, isDisable }) => {
  return (
    <>
      <CFormLabel htmlFor={id}>{lable}</CFormLabel>
      <CFormInput
        type="text"
        id={id}
        placeholder={value}
        disabled={isDisable}
      />
    </>
  );
};

export default Input;
