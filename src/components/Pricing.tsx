"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      title: "Free Essentials",
      badge: "Included",
      description:
        "Good for schools that want to get started and run their daily work smoothly.",
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
      description:
        "Best for growing schools that need more space, more control, and smarter tools.",
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
      description:
        "For special actions that may be used only when needed, instead of every month.",
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
      className="relative flex min-h-[100dvh] min-h-screen flex-col overflow-hidden bg-[var(--surface)] text-[var(--text)]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary-rgb))]/12 via-transparent to-[var(--primary-400)]/10"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--primary-rgb))/18,transparent)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-center font-poppins text-4xl font-bold tracking-tight text-[var(--text)] md:text-5xl"
        >
          Pricing <span className="text-[var(--primary)]">Structure</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-text md:mb-14"
        >
          Start with the essentials for free, upgrade when your school needs more advanced
          tools, and only pay per action for a few special features that are used occasionally.
        </motion.p>

        <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`flex h-full flex-col rounded-3xl border p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.highlight
                  ? "border-[var(--primary)] bg-[var(--surface)] shadow-[0_20px_50px_-12px_rgb(var(--primary-rgb)/0.35)] ring-2 ring-[rgb(var(--primary-rgb))]/25 lg:z-[1] lg:scale-[1.02]"
                  : "border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm"
              }`}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold leading-snug text-[var(--text)] md:text-2xl">
                  {plan.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                    plan.highlight
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--bg)] text-[var(--primary)]"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>

              <p className="mb-6 min-h-[4.5rem] text-sm leading-relaxed text-text/75 md:text-base">
                {plan.description}
              </p>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-snug text-[var(--text)] md:text-[0.9375rem]">
                    <CheckCircle2
                      className="mt-0.5 size-[1.125rem] shrink-0 text-[var(--primary)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-auto w-full cursor-pointer rounded-2xl py-3.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] md:text-base ${
                  plan.highlight
                    ? "border border-[var(--primary)] bg-[var(--primary)] text-white hover:opacity-95"
                    : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mt-14 w-full md:mt-16"
        >
          <h4 className="mb-6 text-center font-poppins text-2xl font-bold text-[var(--text)] md:text-3xl">
            How It Works
          </h4>
          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg)]/40 shadow-inner backdrop-blur-sm">
            <div className="grid grid-cols-1 divide-y divide-[var(--border)] md:grid-cols-2 md:divide-x md:divide-y-0">
              {notes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 px-6 py-5 md:min-h-[5.5rem] md:items-center md:px-8 md:py-6"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary-rgb))]/15 text-sm font-bold text-[var(--primary)]"
                    aria-hidden
                  >
                    {idx + 1}
                  </span>
                  <p className="text-left text-sm leading-relaxed text-[var(--text)] md:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
