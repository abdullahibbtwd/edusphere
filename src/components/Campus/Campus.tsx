"use client"
import React from "react";
import view from "../assets/view.jpg";
import view1 from "../assets/view1.jpg";
import view2 from "../assets/view2.jpg";
import { motion } from "framer-motion";
import Image from "next/image";

const SlideLeft = (delay: number) => {
  return {
    initial: {
      opacity: 0,
      x: -50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

const Campusview = [
  {
    id: 1,
    tittle: "Outside Campus",
    image: view2,
    delay: 0.3,
  },
  {
    id: 2,
    tittle: "Inside Campus",
    image: view,
    delay: 0.2,
  },
  {
    id: 3,
    tittle: "School Ground",
    image: view1,
    delay: 0.1,
  },
];
const Campus = () => {
  return (
    <div>
      <section>
        <div className="container py-20 text-center bg-bg px-5 md:px-0">
          <motion.h1
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-4xl text-center font-bold  pb-10"
          >
            Our Campus
          </motion.h1>
          <motion.div className="grid grid-cols-1  sm:grid-col-4 md:grid-cols-3  gap-8">
            {Campusview.map((campus) => (
              <motion.div
                variants={SlideLeft(campus.delay)}
                key={campus.delay}
                initial="initial"
                whileInView={"animate"}
               // viewport={{ once: true }}
                className="h-[500px] pt-5 items-center flex flex-col gap-3 "
              >
                <div className="cursor-pointer hover:bg-white hover:scale-110 duration-300 hover:shadow-2xl">
                  {
                    <Image
                      className="h-[450px] rounded-2xl"
                      src={campus.image}
                      alt=""
                    />
                  }
                </div>
                <motion.h1 className="text-2xl font-semibold pb-3 pt-5 text-center ">
                  {campus.tittle}
                </motion.h1>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Campus;
