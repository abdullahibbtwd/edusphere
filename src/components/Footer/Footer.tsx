"use client"
import React from "react";
import { FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { motion } from "framer-motion";
import { useSchoolData } from "@/context/SchoolDataContext";

interface FooterProps {
  school: string;
}

const Footer = ({ school: _school }: FooterProps) => {
  const { schoolData } = useSchoolData();
  const description = schoolData?.content?.description || "";
  const classes: string[] = schoolData?.content?.classes || [];


  return (
    <footer className="py-20 bg-surface w-full">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 50 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="container mx-auto w-full px-6 md:px-8 lg:px-12">
        <div className="flex gap-5 flex-col md:flex-row  w-full">
          {/* first section */}
          <div className="space-y-4 w-full md:w-2/6 px-5">
            <h1 className="text-2xl font-bold">{schoolData?.name}</h1>
            <p className="text-dark">
              {description || "No description available."}
            </p>
          </div>
          {/* second section */}
          <div className="grid grid-cols-2 gap-10 w-full md:w-2/6 px-5 md:px-0">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Classes</h1>
              <div className="text-dark2">
                <ul className="space-y-2">
                  {classes.length > 0 ? (
                    classes.map((cls, idx) => (
                      <li key={idx} className="cursor-pointer hover:text-secondary duration-200">
                        {cls}
                      </li>
                    ))
                  ) : (
                    <li>No classes available.</li>
                  )}
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
