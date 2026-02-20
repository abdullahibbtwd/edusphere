"use client"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface AboutData {
  aboutTitle: string;
  aboutDescription: string;
  aboutImage?: string;
}

const About = ({ school }: { school: string }) => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          if (schoolData.content && (schoolData.content.aboutTitle || schoolData.content.aboutDescription || schoolData.content.aboutImage)) {
            setAboutData({
              aboutTitle: schoolData.content.aboutTitle,
              aboutDescription: schoolData.content.aboutDescription,
              aboutImage: schoolData.content.aboutImage
            });
          }
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchAboutData();
    }
  }, [school]);

  // Don't render about section if no content exists
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
            {loading ? "Loading..." : aboutData.aboutTitle}
          </h2>
          <p className="text-lg font-roboto-mono text-text leading-relaxed mb-4">
            {loading ? "Loading..." : aboutData.aboutDescription}
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
