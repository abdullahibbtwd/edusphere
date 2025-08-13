import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Text Section */}
        <motion.div
          className="flex-1 text-center "
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mt-4 md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
            About <span className=" text-primary">Us</span>
          </h2>
          <p className="text-lg font-roboto-mono text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            We are committed to building modern, user-friendly school websites
            that enhance communication between educators, students, and parents.
            Our platform is designed to be fast, secure, and customizable.
          </p>
          <p className="text-lg font-roboto-mono text-gray-600 dark:text-gray-300 leading-relaxed">
            With years of experience in web development and education technology,
            we aim to empower schools with tools that make learning management
            simple, engaging, and effective.
          </p>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <img
            src="/school2.svg"
            alt="School Illustration"
            className="max-w-full h-auto drop-shadow-lg"
          />
        </motion.div>

      </div>
    </section>
  );
};

export default About;
