"use client"
import React, { useEffect, useState } from 'react'
import { GrUserExpert } from "react-icons/gr";
import { MdOutlineAccessTime } from "react-icons/md";
import { FaBookReader } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from 'next/image';

interface BannerData {
  bannerTitle: string;
  bannerImage?: string;
  bannerStats?: Array<{
    icon: string;
    text: string;
  }>;
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
        type: "spring",
        stiffness: 100,
        duration: 0.5,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};
const Banner = ({ school }: { school: string }) => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          const content = schoolData.content;
          const hasBanner = content && (content.bannerTitle || content.bannerImage || (content.bannerStats && content.bannerStats.length > 0));
          if (!hasBanner) {
            setLoading(false);
            return;
          }
          // Live counts from same API as SchoolManagement (subjects + students arrays)
          const studentCount = schoolData.students?.length ?? 0;
          const subjectCount = schoolData.subjects?.length ?? 0;
          // Use saved bannerStats for structure; inject live student/subject counts to match SchoolManagement
          const savedStats = content.bannerStats ?? [];
          const statsWithLiveCounts = savedStats.map((stat: { icon: string; text: string }) => {
            const t = stat.text || "";
            if (stat.icon === "GrUserExpert" || t.toLowerCase().includes("students")) {
              return { icon: stat.icon, text: `${studentCount}+ Students` };
            }
            if (stat.icon === "FaBookReader" || t.toLowerCase().includes("subjects")) {
              return { icon: stat.icon, text: `${subjectCount}+ Subjects` };
            }
            return { icon: stat.icon, text: t || "Good Facilities" };
          });
          // If no saved stats, build default like SchoolManagement
          const bannerStats =
            statsWithLiveCounts.length >= 3
              ? statsWithLiveCounts
              : [
                  { icon: "GrUserExpert", text: `${studentCount}+ Students` },
                  { icon: "FaBookReader", text: `${subjectCount}+ Subjects` },
                  { icon: "MdOutlineAccessTime", text: "Good Facilities" },
                ];
          setBannerData({
            bannerTitle: content.bannerTitle ?? "",
            bannerImage: content.bannerImage ?? undefined,
            bannerStats,
          });
        }
      } catch (error) {
        console.error('Error fetching banner data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchBannerData();
    }
  }, [school]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "FaBookReader":
        return <FaBookReader className="text-2xl" />;
      case "GrUserExpert":
        return <GrUserExpert className="text-2xl" />;
      case "MdOutlineAccessTime":
        return <MdOutlineAccessTime className="text-2xl" />;
      default:
        return <FaBookReader className="text-2xl" />;
    }
  };

  // Don't render banner if no content exists
  if (!bannerData) {
    return null;
  }

  return (
    <div>
      <section>
        <div
          className="container bg-surface py-14 md:py-24 
      grid grid-cols-1 md:grid-cols-2 gap-8 
      space-y-6 md:space-y-0"
        >
          {/* Banner image */}
          {bannerData.bannerImage && (
            <div className="flex justify-center items-center">
              <Image
                src={bannerData.bannerImage}
                alt="Banner Image"
                width={450}
                height={300}
                className="scale-x-[-1] 
              w-[350px] md:max-w-[450px] object-cover drop-shadow rounded-2xl
              "
              />
            </div>
          )}
          {/* Banner Text */}
          <div className="flex flex-col justify-center p-8">
            <div className="text-center md:text-left space-y-12 ">
              <h1 className="text-3xl md:text-4xl font-bold !leading-snug">
                {loading ? "Loading..." : bannerData.bannerTitle}
              </h1>
              <div className="flex flex-col gap-6">
                {bannerData.bannerStats?.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={FadeUp(0.2)}
                    initial="initial"
                    whileInView={"animate"}
                    className="flex items-center gap-4 p-6 bg-bg rounded-2xl
                  hover:bg-primary duration-300 hover:shadow-2xl
                  ">
                    {getIconComponent(stat.icon)}
                    <p className="text-lg">{stat.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Banner