"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Navbar = () => {

  const router = useRouter();
  const  role = 'admin'; 
  return (
    <div className="flex justify-between gap-5 p-4  w-full">
      <nav className="relative z-[20] w-full">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeInOut" }}
          className="container py-3 flex justify-between items-center"
        >
          {/* Logo Section */}
          <div className="flex px-10 items-center">
            <h1 className="font-bold text-2xl hidden md:flex">School Name </h1>
            <h1 className="font-bold text-2xl md:hidden">HCTWD</h1>
          </div>

          <div className="flex gap-4">
            <button
              className="inline-block bg-primary  text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#69a79c] cursor-pointer duration-200"
              onClick={()=> router.push(`/school/${role}`)}>
                Dashboard
              </button>
            </div>
         
     
        </motion.div>
      </nav>
    </div>
  );
};

export default Navbar;
