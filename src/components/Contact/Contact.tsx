"use client"
import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { motion } from "framer-motion";

interface ContactData {
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
}

const Contact = ({ school }: { school: string }) => {
  const [contactData, setContactData] = useState<ContactData>({
    contactAddress: "",
    contactPhone: "",
    contactEmail: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          if (schoolData.content) {
            setContactData({
              contactAddress: schoolData.content.contactAddress,
              contactPhone: schoolData.content.contactPhone,
              contactEmail: schoolData.content.contactEmail,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchContactData();
    }
  }, [school]);
  return (
    <section className="bg-bg py-10">
      <h1 className="text-3xl text-center pt-3 md:text-4xl font-bold !leading-snug">
        Contact Us
      </h1>
      <div
        className="container mx-auto w-full py-14 flex flex-col md:flex-row gap-5 px-6 md:px-8 lg:px-12"
      >
        {/* Contact text */}
        <div className="flex items-center cursor-pointer w-full md:w-1/2">
          <div className="flex flex-col gap-6 w-full md:px-15">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}

              //viewport={{once:true}}
              className="flex items-center gap-4 p-6 bg-bg rounded-2xl *:
                hover:bg-[#f4f4f4] duration-300 hover:shadow-2xl
                "
            >
              <FaLocationDot />
              <p>{loading ? "Loading..." : contactData.contactAddress}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}
              //viewport={{once:true}}
              className="flex items-center gap-4 p-6 bg-bg rounded-2xl *:
                hover:bg-[#f4f4f4] duration-300 hover:shadow-2xl
                "
            >
              <FaPhone />
              <p>{loading ? "Loading..." : contactData.contactPhone}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}
              //viewport={{once:true}}
              className="flex items-center gap-4 p-6 bg-bg rounded-2xl *:
                hover:bg-[#f4f4f4] duration-300 hover:shadow-2xl
                "
            >
              <MdOutlineEmail />
              <p>{loading ? "Loading..." : contactData.contactEmail}</p>
            </motion.div>
          </div>
        </div>
        {/* Contaact Input */}
        <div className="flex items-center justify-center w-full md:w-1/2 ">
          <div className="flex flex-col gap-6 w-full">
            <motion.input
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}
              // viewport={{once:true}}
              className="border-solid rounded-md border-2 border-[#f4f4f]  py-3 px-2 w-full"
              type="text"
              placeholder="Name"
            />
            <motion.input
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}
              // viewport={{once:true}}
              className="border-solid border-2 rounded-md border-[#f4f4f] py-3 px-2  w-full"
              type="email"
              placeholder="Email"
            />
            <motion.textarea
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}
              //viewport={{once:true}}
              className="border-solid border-2 rounded-md border-[#f4f4f]  py-3 px-2 w-full"
              placeholder="Message"
              name=""
              id=""
            ></motion.textarea>
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, duration: 0.5, delay: 0.2 }}
              //viewport={{once:true}}
              className="bg-primary py-3 rounded-md cursor-pointer hover:scale-105  ease-in-out duration-500 transition"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
