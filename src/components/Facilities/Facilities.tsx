"use client"
import Image from "next/image";
import comlab from "../assets/comlab.jpeg";
import lab from "../assets/lab.jpeg";
import library from "../assets/library.jpg";
import { motion } from "framer-motion";

const Facilitiesdata = [
  {
    id: 1,
    tittle: "Library",
    image: library,
    delay: 0.1,
  },
  {
    id: 2,
    tittle: "Laboratory",
    image: lab,
    delay: 0.2,
  },
  {
    id: 3,
    tittle: "Computer Lab",
    image: comlab,
    delay: 0.3,
  },
];

const SlideLeft = (delay:number) => {
  return {
    initial: {
      opacity: 0,
      x: 50,
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

const Facilities = () => {
  return (
    <section>
      <div className="container pb-12 pt-16 text-center bg-surface px-5 md:px-0">
        <motion.h1
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-4xl text-center font-bold pb-10"
        >
          Our Facilities
        </motion.h1>
        <motion.div className="grid grid-cols-1  sm:grid-col-4 md:grid-cols-3  gap-8">
          {Facilitiesdata.map((facility) => (
            <motion.div
              variants={SlideLeft(facility.delay)}
              initial="initial"
              whileInView={"animate"}
              key={facility.id}
              viewport={{ once: true }}
              className="h-[500px]   items-center flex flex-col gap-3 "
            >
              <div className="cursor-pointer hover:bg-white hover:scale-110 duration-300 hover:shadow-2xl">
                {
                  <Image
                    className="h-[400px] rounded-2xl"
                    src={facility.image}
                    alt=""
                  />
                }
              </div>
              <motion.h1 className="text-2xl font-semibold  text-center pb-3 pt-5">
                {facility.tittle}
              </motion.h1>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Facilities;
