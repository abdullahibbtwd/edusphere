import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      title: "Free Essentials",
      badge: "Included",
      description: "Good for schools that want to get started and run their daily work smoothly.",
      features: [
        "Register your school and get your own school page",
        "Manage students and teachers in one place",
        "Set up levels, classes, subjects, and teacher assignments",
        "Handle admissions, announcements, and school events",
        "Set up fees, record payments, and issue receipts",
        "Manage results and let students view them",
        "Up to 20 requests per minute for each school user",
      ],
      highlight: false,
    },
    {
      title: "Upgrade Plans",
      badge: "Scale Up",
      description: "Best for growing schools that need more space, more control, and smarter tools.",
      features: [
        "Support for more students and more staff",
        "Better finance and performance insights",
        "More control over your school website and branding",
        "Screening setup for admission applicants",
        "More advanced result publishing and promotion settings",
        "Faster school-wide timetable and exam setup",
        "Higher request limits for each school user",
      ],
      highlight: true,
    },
    {
      title: "Pay Per Action",
      badge: "Usage Based",
      description: "For special actions that may be used only when needed, instead of every month.",
      features: [
        "Sending bulk fee reminder messages",
        "Generating applicant PDFs or summaries",
        "Re-generating school timetables",
        "Generating or re-generating exam timetables",
        "Extra receipt generation or downloads",
        "Student result viewing",
        "Special result release or publishing actions",
      ],
      highlight: false,
    },
  ];

  const notes = [
    "The free plan covers the main tools most schools need every day.",
    "Upgrade plans are for schools that are growing and need more advanced features.",
    "Pay-per-action is useful for one-off tasks, so schools only pay when they use them.",
    "Schools on higher plans get more request capacity than the free plan.",
  ];

  return (
    <section
      id="pricing"
      className="flex h-max flex-col items-center justify-center bg-surface px-6 py-16 md:py-24"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-4 mb-2 text-center text-4xl font-bold text-[var(--text)] md:mt-0 md:text-5xl"
      >
        Pricing <span className="text-[var(--primary)]">Structure</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-10 max-w-3xl text-center text-lg text-[var(--muted)]"
      >
        Start with the essentials for free, upgrade when your school needs more advanced tools,
        and only pay per action for a few special features that are used occasionally.
      </motion.p>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`rounded-3xl p-8 transition-all ${
              plan.highlight
                ? "border border-[var(--primary)] bg-[var(--surface)] shadow-xl"
                : "border border-[var(--border)] bg-[var(--surface)] shadow-lg"
            } hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-2xl font-bold text-[var(--text)]">{plan.title}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  plan.highlight
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg)] text-[var(--primary)]"
                }`}
              >
                {plan.badge}
              </span>
            </div>

            <p className="mb-6 min-h-16 text-[var(--muted)]">{plan.description}</p>

            <ul className="mb-8 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--text)]">
                  <span className="mt-0.5 text-[var(--primary)]">✔</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full cursor-pointer rounded-2xl py-3 font-semibold transition-all duration-300 ${
                plan.highlight
                  ? "border border-[var(--primary)] bg-[var(--primary)] text-white hover:opacity-90"
                  : "border border-[var(--border)] text-text hover:bg-bg"
              }`}
            >
              {plan.title === "Free Essentials"
                ? "Start Free"
                : plan.title === "Upgrade Plans"
                ? "Explore Upgrades"
                : "Choose Usage Billing"}
            </button>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mt-8 w-full max-w-4xl"
      >
          <h4 className="mb-4 text-center text-2xl font-bold text-text">
          How It Works
        </h4>
        <div className="overflow-hidden rounded-3xl bg-surface shadow-lg">
          {notes.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 px-6 py-4 last:border-none"
            >
              <span className="text-primary">•</span>
              <span className="text-text">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
