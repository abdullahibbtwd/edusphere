"use client"
import React, { useEffect, useState } from "react";
import view from "../assets/view.jpg";
import view1 from "../assets/view1.jpg";
import view2 from "../assets/view2.jpg";
import { motion } from "framer-motion";
import Image from "next/image";

interface CampusImage {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  order: number;
}

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

const Campus = ({ school }: { school: string }) => {
  const [campusImages, setCampusImages] = useState<CampusImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampusImages = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          // Use the campusImages from SchoolContent
          setCampusImages(schoolData.content?.campusImages || []);
        }
      } catch (error) {
        console.error('Error fetching campus images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchCampusImages();
    }
  }, [school]);
  // Default campus images if none exist
  const defaultCampusImages = [
    { id: '1', title: 'Outside Campus', imageUrl: view2.src, order: 0 },
    { id: '2', title: 'Inside Campus', imageUrl: view.src, order: 1 },
    { id: '3', title: 'School Ground', imageUrl: view1.src, order: 2 },
  ];

  // Convert campus images array to display format
  const displayCampusImages = campusImages.length > 0 
    ? campusImages.map((campus, index) => ({
        id: index.toString(),
        title: campus.name || campus.title,
        imageUrl: campus.image || campus.imageUrl,
        order: index
      }))
    : defaultCampusImages;

  if (loading) {
    return (
      <div>
        <section>
          <div className="container py-20 text-center bg-surface px-5 md:px-0">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-300 rounded mb-10 w-48 mx-auto"></div>
              <div className="grid grid-cols-1 sm:grid-col-4 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[500px] pt-5 flex flex-col gap-3">
                    <div className="h-[450px] bg-gray-300 rounded-2xl"></div>
                    <div className="h-8 bg-gray-300 rounded w-32 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section>
        <div className="container py-20 text-center bg-surface px-5 md:px-0">
          <motion.h1
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-4xl text-center font-bold  pb-10"
          >
            Our Campus
          </motion.h1>
          <motion.div className="grid grid-cols-1  sm:grid-col-4 md:grid-cols-3  gap-8">
            {displayCampusImages.map((campus, index) => (
              <motion.div
                variants={SlideLeft((index + 1) * 0.1)}
                key={campus.id}
                initial="initial"
                whileInView={"animate"}
                viewport={{ once: true }}
                className="h-[500px] pt-5 items-center flex flex-col gap-3 "
              >
                <div className="cursor-pointer hover:bg-white hover:scale-110 duration-300 hover:shadow-2xl">
                  <Image
                    className="h-[450px] rounded-2xl object-cover w-full"
                    src={campus.imageUrl || "/placeholder-campus.jpg"}
                    alt={campus.title}
                    width={450}
                    height={450}
                  />
                </div>
                <motion.h1 className="text-2xl font-semibold pb-3 pt-5 text-center ">
                  {campus.title}
                </motion.h1>
                {campus.description && (
                  <motion.p className="text-gray-600 text-center px-4">
                    {campus.description}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Campus;
