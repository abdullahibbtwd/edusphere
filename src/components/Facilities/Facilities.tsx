"use client"
import Image from "next/image";
import comlab from "../assets/comlab.jpeg";
import lab from "../assets/lab.jpeg";
import library from "../assets/library.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Facility {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  order: number;
}

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

const Facilities = ({ school }: { school: string }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          // Use the facilities array from the SchoolContent table
          setFacilities(schoolData.content?.facilities || []);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchFacilities();
    }
  }, [school]);
  if (loading) {
    return (
      <section>
        <div className="container pb-12 pt-16 text-center bg-surface px-5 md:px-0">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-10 w-64 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-col-4 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] flex flex-col gap-3">
                  <div className="h-[400px] bg-gray-300 rounded-2xl"></div>
                  <div className="h-8 bg-gray-300 rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default facilities if none exist
  const defaultFacilities = [
    { id: '1', name: 'Library', imageUrl: library.src, description: '', order: 0 },
    { id: '2', name: 'Laboratory', imageUrl: lab.src, description: '', order: 1 },
    { id: '3', name: 'Computer Lab', imageUrl: comlab.src, description: '', order: 2 },
  ];

  // Convert facilities array to display format
  const displayFacilities = facilities.length > 0 
    ? facilities.map((facility, index) => {
        if (typeof facility === "string") {
          return {
            id: index.toString(),
            name: facility,
            imageUrl: "/placeholder-facility.jpg",
            description: "",
            order: index
          };
        } else {
          return {
            id: index.toString(),
            name: facility.name,
            imageUrl: facility.image || facility.imageUrl,
            description: facility.description,
            order: index
          };
        }
      })
    : defaultFacilities;

  return (
    <section>
      <div className="container pb-12 pt-16 text-center bg-bg px-5 md:px-0">
        <motion.h1
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-4xl text-center font-bold pb-10"
        >
          Our Facilities
        </motion.h1>
        <motion.div className="grid grid-cols-1  sm:grid-col-4 md:grid-cols-3  gap-8">
          {displayFacilities.map((facility, index) => (
            <motion.div
              variants={SlideLeft((index + 1) * 0.1)}
              initial="initial"
              whileInView={"animate"}
              key={facility.id}
              viewport={{ once: true }}
              className="h-[500px]   items-center flex flex-col gap-3 "
            >
              <div className="cursor-pointer hover:bg-white hover:scale-110 duration-300 hover:shadow-2xl">
                <Image
                  className="h-[400px] rounded-2xl object-cover w-full"
                  src={facility.imageUrl || "/placeholder-facility.jpg"}
                  alt={facility.name}
                  width={400}
                  height={400}
                />
              </div>
              <motion.h1 className="text-2xl font-semibold  text-center pb-3 pt-5">
                {facility.name}
              </motion.h1>
              {facility.description && (
                <motion.p className="text-gray-600 text-center px-4">
                  {facility.description}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Facilities;
