import { FieldError } from "react-hook-form";

type InputFieldProps = {
    label:string;
    type?:string;
    name:string;
    register:any;
    defaultValue?:string;
    error:FieldError;
    inputProps:React.InputHTMLAttributes<HTMLInputElement>;
}

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  inputProps,
}:InputFieldProps) => {
  return  <div className="w-full md:w-1/4 flex flex-col gap-2 justify-center items-start">
  <label className="text-xs text-gray-500 ">{label}</label>
  <input
    type={type}
    {...register(name)}
    className="ring-[1.5px] w-full ring-gray-300 p-2 rounded-md text-sm"
    {...inputProps}
    defaultValue={defaultValue}
  />
  {error?.message && (
    <p className="text-[10px] text-red-800">
      {error.message.toString()}
    </p>
  )}
</div>;
};

export default InputField;
