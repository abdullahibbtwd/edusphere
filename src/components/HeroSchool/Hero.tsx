"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { IoIosArrowRoundForward } from "react-icons/io";
import pattern from "../assets/pattern.svg";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SchoolData {
  id: string;
  name: string;
  subdomain: string;
  content?: {
    heroTitle: string;
    heroSubtitle?: string;
    heroImage?: string;
    schoolLogo?: string;
  };
}

 const FadeUp = (delay: number) => {
  return {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        duration: 0.5,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

const Hero = ({ school }: { school: string }) => {
  const router = useRouter();
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const data = await response.json();
          setSchoolData(data);
        } else if (response.status === 404) {
          // School not found, redirect to main domain
          console.log('School not found, redirecting to main domain');
          window.location.href = '/';
          return;
        }
      } catch (error) {
        console.error('Error fetching school data:', error);
        // On error, redirect to main domain
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchSchoolData();
    }
  }, [school]);

  if (loading) {
    return (
      <div className="bg-bg overflow-hidden relative">
        <Navbar schoolName={schoolData?.name} />
        <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[550px]">
          <div className="flex flex-col md:px-20 justify-center py-14 md:py-0 relative z-20">
            <div className="text-center md:text-left space-y-10 lg:max-w-[350]">
              <div className="animate-pulse">
                <div className="h-16 bg-gray-300 rounded mb-4"></div>
                <div className="h-16 bg-gray-300 rounded mb-4"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-10 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="animate-pulse">
              <div className="w-[400px] xl:w-[500px] h-[400px] bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show setup indicator if no content exists
  if (!schoolData?.content) {
    return (
      <div className="bg-bg overflow-hidden relative">
        <Navbar schoolName={schoolData?.name} />
        <div className="container min-h-[550px] flex items-center justify-center">
          <div className="text-center space-y-6 max-w-2xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                School Landing Page Not Set Up
              </h2>
              <p className="text-yellow-700 mb-6">
                Your school&apos;s landing page content hasn&apos;t been configured yet. 
                Please go to your school management dashboard to set up your hero section, 
                about information, and other content.
              </p>
              <button
                onClick={() => window.location.href = `/${school}/management`}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to School Management
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className=" bg-bg overflow-hidden relative ">
        <Navbar schoolName={schoolData?.name} />
        <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[550px]">
          {/* School Info */}
          <div className="flex flex-col md:px-20 justify-center py-14 md:py-0 relative z-20">
            <div className="text-center md:text-left space-y-10 lg:max-w-[350]  ">
              <motion.h1
                variants={FadeUp(0.6)}
                initial="initial"
                animate="animate"
                className="text-3xl lg:text-5xl font-bold !leading-snug"
              >
                {schoolData?.content?.heroTitle || "Welcome to " + schoolData?.name}
                {schoolData?.content?.heroTitle && (
                  <span className="text-secondary"> Community</span>
                )}
              </motion.h1>
              {schoolData?.content?.heroSubtitle && (
                <motion.p
                  variants={FadeUp(0.7)}
                  initial="initial"
                  animate="animate"
                  className="text-lg text-gray-600"
                >
                  {schoolData.content.heroSubtitle}
                </motion.p>
              )}
              <motion.div
                variants={FadeUp(0.8)}
                initial="initial"
                animate="animate"
                className="flex  justify-center md:justify-start"
              >
                
                    <button
                      onClick={() => router.push(`/${school}/application`)}
                      className="bg-primary px-4 py-1.5 rounded-md cursor-pointer text-white flex flex-row items-center justify-center  gap-2 group"
                    >
                      Apply Now!
                      <IoIosArrowRoundForward className="text-xl group-hover:translate-x-2 group-hover:-rotate-45 duration-300" />
                    </button>
            
             
              </motion.div>
            </div>
          </div>

          {/* hero image */}
          <div className="flex justify-center items-center relative w-full h-[400px] xl:h-[500px]">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
              className="relative w-[400px] xl:w-[500px] h-full z-10 drop-shadow"
            >
              <Image
                src={
                  schoolData?.content?.heroImage ||
                  schoolData?.content?.schoolLogo ||
                  "/hakimi.png"
                }
                alt={`${schoolData?.name || "School"} Logo`}
                fill
                sizes="(max-width: 600px) 400px, 500px"
                className="object-cover rounded-xl"
                priority
              />
            </motion.div>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[1200px] md:w-[2000px] z-[1] hidden md:block"
            >
              <Image
                src={pattern.src}
                alt=""
                width={2000}
                height={300}
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
