"use client"
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSchoolData } from "@/context/SchoolDataContext";

const About = ({ school: _school }: { school: string }) => {
  const { schoolData } = useSchoolData();
  const content = schoolData?.content;
  const aboutData = content && (content.aboutTitle || content.aboutDescription || content.aboutImage)
    ? { aboutTitle: content.aboutTitle ?? "", aboutDescription: content.aboutDescription ?? "", aboutImage: content.aboutImage }
    : null;

  if (!aboutData) {
    return null;
  }

  return (
    <section className="h-max py-28 bg-surface flex items-center justify-center">
      <div className="container mx-auto w-full flex flex-col md:flex-row-reverse items-center gap-12 px-6 md:px-8 lg:px-12">

        {/* Left Text Section */}
        <motion.div
          className="flex-1 text-center "
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mt-4 md:text-6xl font-bold text-text mb-6">
            {aboutData.aboutTitle}
          </h2>
          <p className="text-lg font-roboto-mono text-text leading-relaxed mb-4">
            {aboutData.aboutDescription}
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
          <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
            <Image
              src={aboutData.aboutImage || "/school2.svg"}
              alt="School Illustration"
              fill
              className="object-cover drop-shadow-lg rounded-xl"
              sizes="(max-width: 600px) 320px, 400px"
              priority
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default About;
