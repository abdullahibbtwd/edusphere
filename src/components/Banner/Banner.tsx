"use client"
import React from 'react'
import hero from "../assets/hero.png";
import { GrUserExpert } from "react-icons/gr";
import { MdOutlineAccessTime } from "react-icons/md";
import { FaBookReader } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from 'next/image';

 const FadeUp = (delay: number) => {
  return {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};
const Banner = () => {
  return (
    <div>
         <section>
      <div
        className="container bg-bg py-14 md:py-24 
      grid grid-cols-1 md:grid-cols-2 gap-8 
      space-y-6 md:space-y-0"
      >
        {/* Banner image */}
        <div className="flex justify-center items-center">
          <Image
            src={hero}
            alt=""
            className="scale-x-[-1] 
            w-[350px] md:max-w-[450px] object-cover drop-shadow
            "
          />
        </div>
        {/* Banner Text */}
        <div className="flex flex-col justify-center">
          <div className="text-center md:text-left space-y-12 ">
            <h1 className="text-3xl md:text-4xl font-bold !leading-snug">
              The Best Secondary School In Kano State
            </h1>
            <div className="flex flex-col gap-6">
                <motion.div
                variants={FadeUp(0.2)}
                initial="initial"
                whileInView={"animate"}
                 // viewport={{once:true}}
                className="flex items-center gap-4 p-6 bg-surface rounded-2xl *:
                hover:bg-white duration-300 hover:shadow-2xl
                "> 
                    <FaBookReader className="text-2xl "/>
                    <p className="text-lg">50+ Courses</p>
                </motion.div>
                <motion.div
                variants={FadeUp(0.2)}
                initial="initial"
                whileInView={"animate"}
                  //viewport={{once:true}}
                className="flex items-center gap-4 p-6 bg-surface rounded-2xl *:
                hover:bg-white duration-300 hover:shadow-2xl
                "> 
                    <GrUserExpert className="text-2xl "/>
                    <p className="text-lg">Morethan 50k Student</p>
                </motion.div>
                <motion.div
                variants={FadeUp(0.2)}
                initial="initial"
                whileInView={"animate"}
                  //viewport={{once:true}}
                className="flex items-center gap-4 p-6 bg-surface rounded-2xl *:
                hover:bg-white duration-300 hover:shadow-2xl
                "> 
                    < MdOutlineAccessTime className="text-2xl "/>
                    <p className="text-lg">Good Facilities</p>
                </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

export default Banner