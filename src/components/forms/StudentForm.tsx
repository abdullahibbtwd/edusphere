"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "User must be at 20 must!" }),
  email: z.string().email({ message: "Invalid email Address" }),
  password: z
    .string()
    .min(8, { message: "Password must be Atleast 8 chracters long" }),
  firstname: z.string().min(1, { message: "first name is required" }),
  lastname: z.string().min(1, { message: "last name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "address is required" }),
  blood: z.string().min(1, { message: "address is required" }),
  birthday: z.date({ message: "Birthday is required" }),
  sex: z.enum(["male", "female"], { message: "sex is required" }),
  img: z.instanceof(File, { message: "image is required" }),
});

    type Inputs = z.infer<typeof schema>

const StudentForm = ({ type,data }: { type: "plus" | "edit"; data?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Create a new Student</h1>
      <span className="text-xs text-gray-600 ">Authentucation Imformation</span>
      <div className="flex justify-between flex-wrap gap-4 ">
      <InputField
        label="User name"
        name="username"
        defaultValue={data?.username}
        register={register}
        error={errors?.username}
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        defaultValue={data?.email}
        register={register}
        error={errors?.email}
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        defaultValue={data?.password}
        register={register}
        error={errors?.password}
      />
      </div>
     
      <span className="text-xs text-gray-600 ">Personal Imformation</span>
      <div className="flex justify-between flex-wrap gap-4 ">
      <InputField
        label="First name"
        name="firstname"
        type="text"
        defaultValue={data?.firstname}
        register={register}
        error={errors?.firstname}
      />
      <InputField
        label="Last Name"
        name="lastname"
        type="text"
        defaultValue={data?.lastname}
        register={register}
        error={errors?.lastname}
      />
      <InputField
        label="Phone"
        name="phone"
        type="text"
        defaultValue={data?.phone}
        register={register}
        error={errors?.phone}
      />
        <InputField
        label="Address"
        name="address"
        defaultValue={data?.address}
        register={register}
        error={errors?.address}
      />
      <InputField
        label="Blood Type"
        name="blood"
        type="text"
        defaultValue={data?.blood}
        register={register}
        error={errors?.blood}
      />
     
        <InputField
        label="Birthday"
        name="birthday"
        type="date"
        defaultValue={data?.birthday}
        register={register}
        error={errors?.birthday}
      />
     
      <div className="w-full md:w-1/4 flex flex-col gap-2 justify-center items-start">
  <label className="text-xs text-gray-500 ">Gender</label>
  <select
    {...register("sex")}
    className="ring-[1.5px] w-full ring-gray-300 p-2 rounded-md text-sm"
    defaultValue={data?.sex}
  >
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select>
  {errors.sex?.message && (
    <p className="text-[10px] text-red-800">
      {errors.sex.message.toString()}
    </p>
  )}
</div>;
      <div className="w-full md:w-1/4 flex flex-col gap-2 justify-center items-end ">
  <label htmlFor="img" className="text-xs text-gray-500 flex justify-center  gap-2 cursor-pointer">
  <Image src="/upload.png" alt="Upload icon" width={28} height={28}/>
  <span>Upload Image</span>
  </label>
  <input id="img" type="file" {...register("img")} className="hidden"/>
  {errors.img?.message && (
    <p className="text-[10px] text-red-800">
      {errors.img.message.toString()}
    </p>
  )}
</div>;
</div>
      <button className="bg-[#FAE27C] text-white py-2 px-4 w-max self-center rounded-md border-none">
        {type === "plus" ? "Create" : "edit"}
      </button>
    </form>
  );
};

export default StudentForm;
