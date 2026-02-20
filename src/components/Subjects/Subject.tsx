"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SchoolContent {
  softSkills?: string[];
  levelSelection?: string;
  classes?: string[];
}

// Reusable motion variants
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay },
  },
});

const popIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut", delay },
  },
});

const stagger = (staggerChildren = 0.06, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

const Subjects = ({ school }: { school: string }) => {
  const [schoolContent, setSchoolContent] = useState<SchoolContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolContent = async () => {
      try {
        const response = await fetch(`/api/schools/by-subdomain/${school}`);
        if (response.ok) {
          const schoolData = await response.json();
          setSchoolContent(schoolData.content || null);
        }
      } catch (error) {
        console.error('Error fetching school content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (school) {
      fetchSchoolContent();
    }
  }, [school]);

  // Get levels based on levelSelection
  const getLevels = () => {
    const levelSelection = schoolContent?.levelSelection || 'jss1-ss3';
    switch (levelSelection) {
      case 'jss1-3':
        return ["JSS1", "JSS2", "JSS3"];
      case 'ss1-3':
        return ["SS1", "SS2", "SS3"];
      case 'jss1-ss3':
      default:
        return ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
    }
  };

  const levels = getLevels();

  // Get classes from database - show nothing if empty
  const classes = schoolContent?.classes || [];

  // Get soft skills from database - show nothing if empty
  const softSkills = schoolContent?.softSkills || [];
  return (
    <section className="bg-bg">
      <div className="container mx-auto w-full pb-14 pt-16 px-6 md:px-8 lg:px-12">

        {/* Levels */}
        <motion.h1
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-4xl font-bold text-left pb-10 text-gray-900 dark:text-white"
        >
          School Levels
        </motion.h1>

        <motion.div
          variants={stagger(0.06, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-12"
        >
          {loading ? (
            // Loading skeleton
            levels.map((_, idx) => (
              <div key={idx} className="bg-gray-300 rounded-2xl h-20 animate-pulse"></div>
            ))
          ) : (
            levels.map((level, idx) => (
              <motion.div
                key={level}
                variants={popIn(idx * 0.03)}
                className="bg-surface rounded-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-primary hover:text-white hover:scale-105 duration-300 shadow"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{level}</span>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Classes - Only show if there are classes in database */}
        {classes.length > 0 && (
          <>
            <motion.h1
              variants={fadeUp(0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="text-4xl font-bold text-left pb-10 text-gray-900 dark:text-white"
            >
              Classes
            </motion.h1>

            <motion.div
              variants={stagger(0.06, 0.05)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12"
            >
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-gray-300 rounded-2xl h-24 animate-pulse"></div>
                ))
              ) : (
                classes.map((className, idx) => (
                  <motion.div
                    key={className}
                    variants={popIn(idx * 0.04)}
                    className="bg-surface rounded-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-primary hover:text-white hover:scale-105 duration-300 shadow"
                  >
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{className}</span>
                  </motion.div>
                ))
              )}
            </motion.div>
          </>
        )}

        {/* Soft Skills - Only show if there are soft skills in database */}
        {softSkills.length > 0 && (
          <>
            <motion.h1
              variants={fadeUp(0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="text-4xl font-bold text-left pb-10 text-gray-900 dark:text-white"
            >
              Soft Skills We Teach
            </motion.h1>

            <motion.div
              variants={stagger(0.06, 0.05)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
            >
              {softSkills.map((skill, idx) => (
                <motion.div
                  key={skill}
                  variants={popIn(idx * 0.04)}
                  className="bg-surface rounded-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-primary hover:text-white hover:scale-105 duration-300 shadow text-center"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{skill}</span>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

      </div>
    </section>
  );
};

export default Subjects;
