"use client";

import React from "react";
import { motion } from "framer-motion";

const levels = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

const classes = [
  { section: "A", name: "Science" },
  { section: "B", name: "Commerce" },
  { section: "C", name: "Arts" },
  { section: "D", name: "Geography" },
];

const softSkills = [
  "Carpentry",
  "Coding",
  "Fashion Design",
  "Electrical Work",
  "Graphics Design",
  "Catering",
  "Photography",
  "Videography",
];

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

const Subjects = () => {
  return (
    <section className="bg-surface px-10">
      <div className="container md:pl-10 pb-14 pt-16">

        {/* Levels */}
        <motion.h1
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-4xl font-bold text-left pb-10 text-text"
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
          {levels.map((level, idx) => (
            <motion.div
              key={level}
              variants={popIn(idx * 0.03)}
              className="bg-surface rounded-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-primary hover:text-surface hover:scale-105 duration-300 shadow"
            >
              <span className="text-lg font-semibold text-text">{level}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Classes */}
        <motion.h1
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-4xl font-bold text-left pb-10 text-text"
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
          {classes.map((cls, idx) => (
            <motion.div
              key={cls.section}
              variants={popIn(idx * 0.04)}
              className="bg-surface rounded-2xl flex flex-col gap-1 items-center justify-center p-6 cursor-pointer hover:bg-primary hover:text-surface hover:scale-105 duration-300 shadow"
            >
              <span className="text-lg font-semibold text-text">
                Class {cls.section}
              </span>
              <span className="text-sm opacity-80">{cls.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Soft Skills */}
        <motion.h1
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-4xl font-bold text-left pb-10 text-text"
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
              className="bg-surface rounded-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-primary hover:text-surface hover:scale-105 duration-300 shadow text-center"
            >
              <span className="text-lg font-semibold text-text">{skill}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Subjects;
