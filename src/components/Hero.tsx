import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import SponsorCarousel from "./InfinateScroll";

const sponsors = [
  "/school.svg",
  "/school.svg",
  "/school.svg",
  "/school.svg",
  "/school.svg",
];

export default function Hero() {
  const navbarHeight = 80;

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden bg-bg text-text"
      style={{ height: `calc(100vh - ${navbarHeight}px)` }}
    >
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-br from-primary-400/20 via-accent/10 to-cta/10"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left text */}
        <div className="text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold font-poppins leading-tight"
          >
            Transform Your School{" "}
            <span className="text-primary">Digitally</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-4 text-2xl text-muted max-w-lg mx-auto md:mx-0"
          >
            EduSphere is a smart, cloud-based platform that automates everything
            from admissions to analytics. Save time, reduce errors, and focus on
            student success.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mt-6 flex gap-4 justify-center md:justify-start"
          >
            <a
              href="/get-started"
              className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-400 transition-colors"
            >
              Get Started <FiArrowRight />
            </a>
            <a
              href="/features"
              className="border border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
            >
              Learn More
            </a>
          </motion.div>
        </div>

        {/* Right illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center md:justify-end"
        >
          <img
            src="/school.svg"
            alt="School Management Illustration"
            className="w-full max-w-md"
          />
        </motion.div>
      </div>
        <div className="hidden md:flex"><SponsorCarousel/></div>
    
    </section>
  );
}
