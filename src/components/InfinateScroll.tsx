import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";


const Logo = [
  {
    id: 1,
    img: "/logo1.png",
  },
  {
    id: 2,
   img: "/logo2.jpg",
  },
  {
    id: 3,
   img:  "/logo3.jpg",
  },
  {
    id: 4,
  img:  "/logo4.png",
  },
  {
    id: 5,
  img:  "/logo5.jpg",
  },
];
const sliderVariants = {
  initial: {
    x: 0,
  },
  animate: {
    x: "-100%",
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 15,
      ease: "linear",
    },
  },
};

const InfinateCarousel = () => {
  return (
    <div className="max-w-7xl py-4 flex flex-col items-center justify-center mx-auto">
      <p className="md:text-[24px]  font-bold font-poppins text-[12px] text-gray-600 ">
       Join 20+ Schools
      </p>
      <div className="flex gap-2 lg:gap-24">
        <motion.div
          initial="initial"
          animate="animate"
          variants={sliderVariants}
          className="flex justify-between flex-shrink-0  items-center py-2 w-full "
        >
          {Logo.map((log) => (
            <div className="p-2" key={log.id}>
             <Image width={120} height={120} className="w-full h-full object-cover" src={log.img} alt="" />
            </div>
          ))}
        </motion.div>
        <motion.div
          initial="initial"
          animate="animate"
          variants={sliderVariants}
          className="flex justify-between  flex-shrink-0 items-center py-2 w-full "
        >
          {Logo.map((log) => (
            <div className="p-2" key={log.id}>
              <Image width={120} height={120} className="w-full h-full object-cover" src={log.img} alt="" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default InfinateCarousel;