"use client"
import React from "react";
import { FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-20 bg-bg w-full">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 50 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="container w-full">
        <div className="flex gap-5 flex-col md:flex-row  w-full">
          {/* first section */}
          <div className="space-y-4 w-full md:w-2/6 px-5">
            <h1 className="text-2xl font-bold">School Name</h1>
            <p className="text-dark">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis error, quis iste delectus ab, tempore quo, quia architecto eos doloribus accusamus impedit ut atque vitae nemo beatae cumque harum corporis.
            </p>
          </div>
          {/* second section */}
          <div className="grid grid-cols-2 gap-10 w-full md:w-2/6 px-5 md:px-0">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Programs</h1>
              <div className="text-dark2">
                <ul className="space-y-2">
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Chew
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Dental
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    JChew
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Optics
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    MLT
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Public Health
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Links</h1>
              <div className="text-dark2">
                <ul className="space-y-2">
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Home
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Classes
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Our Campus
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Our Facilities
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Contact
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* third section */}
          <div className="space-y-4 w-full md:w-2/6 px-5">
            <h1 className="text-2xl font-bold">Get In Touch</h1>
            <div className="flex items-center   ">
              <input
                type="text"
                placeholder="email"
                className="p-3 rounded-s-xl bg-surface w-full py-3 focus:ring-0 focus:outline-none placeholder:text-dark"
              />
              <button className="bg-primary hover:scale-105 ease-in-out transition duration-500 cursor-pointer text-white font-semibold py-3 px-5 rounded-e-xl ">
                Go
              </button>

            </div>
            <div className="">
              {/* Social Icon */}
              <div className="flex space-x-5 py-2">
                <a href="#">
                  <FaInstagram className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                </a>
                <a href="#">
                  <FaWhatsapp className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />

                </a>
                <a href="#">
                  <FaYoutube className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                </a>
                <a href="#">
                  <TbWorldWww className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
