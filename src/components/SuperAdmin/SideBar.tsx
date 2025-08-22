"use client"
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiHome, FiLayers, FiUsers, FiActivity, FiMessageSquare } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { name: "Home", icon: <FiHome />, href: "/dashboard" },
    { name: "School & Subscription Management", icon: <FiLayers />, href: "/dashboard/subscription" },
    { name: "User Management", icon: <FiUsers />, href: "/dashboard/users" },
    { name: "System Health & Performance", icon: <FiActivity />, href: "/dashboard/system-health" },
    { name: "Support & Communication", icon: <FiMessageSquare />, href: "/dashboard/support" },
    { name: "Profile", icon: <CgProfile />, href: "/dashboard/profile" },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col">
      {links.map((link, index) => {
        const isActive = pathname === link.href;
        return (
          <button
            key={index}
            className={`flex items-center py-3 px-4 gap-3 text-left cursor-pointer w-full
              ${isActive ? "border-r-4 md:border-r-[6px] bg-muted border-primary" : "hover:bg-gray-100/90 border-white"}
            `}
            onClick={() => router.push(link.href)}
          >
            <span className="text-xl">{link.icon}</span>
            <p className="md:block hidden text-center">{link.name}</p>
          </button>
        );
      })}
    </div>
  );
}
