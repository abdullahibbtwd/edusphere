import { motion } from "framer-motion";

export default function Features() {
  return (
    <section
      className="relative flex items-center justify-center bg-bg text-text h-max md:h-screen px-6 lg:px-12 py-8"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins leading-tight">
            Why Choose <span className="text-primary">EduSphere</span>
          </h2>
          <p className="mt-4 text-lg text-text max-w-xl mx-auto md:mx-0 leading-relaxed">
            EduSphere is a smart, cloud-based school management platform that gives 
            each school its own branded subdomain and an automated system from 
            admissions to timetable creation, result generation, and performance analytics.
            <br /><br />
            Teachers simply input student scores, and the system instantly calculates 
            grades, generates digital report cards, and updates the analytics dashboard 
            in real time.
            <br /><br />
            School leaders see live data on class performance, subject trends, and student 
            progress enabling them to take quick, data-driven action to improve results.
            <br /><br />
            With EduSphere, schools save time, reduce errors, and operate like a modern 
            digital institution from day one.
          </p>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center md:justify-end"
        >
          <img
            src="/feature.svg"
            alt="EduSphere Features"
            className="w-full max-w-md"
          />
        </motion.div>
      </div>
    </section>
  );
}
