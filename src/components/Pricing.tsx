import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      title: "Free Plan",
      price: "₦0",
      description: "Register your school for free, start managing students instantly.",
      features: [
        "Full student & teacher management",
        "Automated timetable creation",
        "Digital report card generation",
        "No analytics dashboard",
      ],
      highlight: false,
    },
    {
      title: "Premium Plan",
      price: "₦5,000 / month",
      description: "Unlock full analytics dashboard and advanced tools.",
      features: [
        "Everything in Free Plan",
        "Full analytics dashboard",
        "Download analytics as PDF",
        "Advanced performance reports",
      ],
      highlight: true,
    },
  ];

  const extraCharges = [
    { action: "View Report Sheet (per student)", price: "₦500" },
    { action: "Download Analytics as PDF", price: "₦5,000" },
    { action: "Unlock Result Viewing Button", price: "₦10,000" },
  ];

  return (
    <section
      id="pricing"
      className="h-max flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 text-white px-6 py-16 md:py-24"
    >
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl mt-4 md:mt-0 font-bold mb-2 text-center"
      >
        Pricing <span className="text-primary">Plans</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-lg text-muted mb-8 text-center max-w-2xl"
      >
        Start for free, then pay only for the features you need to unlock your
        school’s full potential.
      </motion.p>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`rounded-2xl p-8 border transition-all ${
              plan.highlight
                ? "border-primary bg-gray-50 dark:bg-gray-900/10"
                : "border-border bg-gray-50 dark:bg-gray-900"
            } shadow-lg hover:shadow-xl`}
          >
            <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
            <p className="text-4xl font-bold text-primary mb-4">{plan.price}</p>
            <p className="text-muted mb-6">{plan.description}</p>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary">✔</span> {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-xl font-semibold cursor-pointer  transition-all duration-500 ease-in-out ${
                plan.highlight
                  ? "bg-white text-primary hover:bg-gray-300"
                  : "border border-white text-white hover:bg-gray-100/10 hover:text-white"
              }`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      {/* Extra Charges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mt-6 max-w-3xl w-full"
      >
        <h4 className="text-2xl font-bold mb-4 text-center">
          Pay-per-Feature Options
        </h4>
        <div className="bg-gray-900/10 border border-border rounded-2xl overflow-hidden shadow-lg">
          {extraCharges.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center px-6 py-4 border-b border-border last:border-none"
            >
              <span>{item.action}</span>
              <span className="font-semibold text-primary">{item.price}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
