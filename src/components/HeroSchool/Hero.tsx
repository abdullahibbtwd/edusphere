"use client";
import React, { useEffect, useState } from "react";
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
      },
    },
  };
};

const GridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Static Grid */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.07] text-gray-900 dark:text-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated Horizontal Line - Going Down */}
      <motion.div
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgb(var(--primary-rgb)/0.5)]"
      />

      {/* Animated Horizontal Line - Going Up */}
      <motion.div
        initial={{ top: "110%" }}
        animate={{ top: "-10%" }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 }}
        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgb(var(--primary-rgb)/0.5)]"
      />

      {/* Animated Vertical Line - Going Right */}
      <motion.div
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
        className="absolute top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgb(var(--primary)/0.5)]"
      />

      {/* Animated Vertical Line - Going Right (Delayed) */}
      <motion.div
        initial={{ left: "-20%" }}
        animate={{ left: "120%" }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent"
      />
    </div>
  );
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
      <div className="bg-bg overflow-hidden relative min-h-screen">
        <div className="container min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-12">
          <div className="text-center space-y-8 max-w-3xl">
            {/* Icon Container */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-3xl border border-primary/20 backdrop-blur-sm">
                <svg
                  className="w-20 h-20 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Welcome to Your School
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Your landing page is almost ready! Set up your hero section, school information,
                and customize your content to create an amazing first impression.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => window.location.href = `/${school}/management`}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 active:scale-95"
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-12 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-base">Setup Your School</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 max-w-4xl mx-auto">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Customize</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Add your branding & colors</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <div className="text-2xl mb-2">📸</div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Upload Media</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Showcase your campus</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Go Live</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Publish your page</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-bg pt-8 overflow-hidden relative">
      <GridBackground />
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[550px]">
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
        </div>
      </div>
    </section>
  );
};

export default Hero
