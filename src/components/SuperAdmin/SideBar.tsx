"use client"
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion"
import { FiHome, FiLayers, FiUsers, FiActivity, FiMessageSquare, FiFileText } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { name: "Home", icon: <FiHome />, href: "/dashboard" },
    { name: "School Applications", icon: <FiFileText />, href: "/dashboard/school-applications" },
    { name: "School & Subscription Management", icon: <FiLayers />, href: "/dashboard/subscription" },
    { name: "User Management", icon: <FiUsers />, href: "/dashboard/users" },
    { name: "System Health & Performance", icon: <FiActivity />, href: "/dashboard/system-health" },
    { name: "Support & Communication", icon: <FiMessageSquare />, href: "/dashboard/support" },
    { name: "Profile", icon: <CgProfile />, href: "/dashboard/profile" },
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="md:h-screen h-[90%] md:mt-0 mt-14 w-72 md:w-64 px-4 py-4 md:p-4 
           bg-surface text-text shadow-lg flex flex-col"
    >
      {/* Logo */}
      <div className="md:flex hidden items-center justify-center gap-2 h-20">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          <Image
            src="/eduspherelogo1.png"
            alt="EduSphere Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="font-poppins font-bold text-xl tracking-wide">
            <span className="text-[var(--primary)]">Edu</span>
            <span className="text-[var(--text)]">Sphere</span>
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 px-1 space-y-2 md:space-y-2.5">
        {links.map((link, index) => {
          const isActive = pathname === link.href;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <button
                className={`flex items-center w-full gap-3 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors cursor-pointer text-left
                  ${isActive ? 'bg-primary text-white' : 'hover:bg-primary/10'}
                `}
                onClick={() => router.push(link.href)}
              >
                <span className="text-xl md:text-xl flex-shrink-0">{link.icon}</span>
                <span className="font-medium text-sm md:text-base leading-tight break-words">
                  {link.name}
                </span>
              </button>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
}
