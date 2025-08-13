'use client';

import { motion } from 'framer-motion';
import { FiHome, FiLayers, FiUsers, FiActivity, FiMessageSquare } from 'react-icons/fi';
import { useRouter, usePathname } from 'next/navigation';
import { CgProfile } from "react-icons/cg";
export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { name: 'Home', icon: <FiHome />, href: '/dashboard' },
    { name: 'School & Subscription Management', icon: <FiLayers />, href: '/dashboard/subscription' },
    { name: 'User Management', icon: <FiUsers />, href: '/dashboard/users' },
    { name: 'System Health & Performance', icon: <FiActivity />, href: '/dashboard/system-health' },
    { name: 'Support & Communication', icon: <FiMessageSquare />, href: '/dashboard/support' },
    { name: 'Profile', icon: <CgProfile />, href: '/dashboard/profile' },
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="md:h-screen h-[90%] md:mt-0 mt-14 w-max md:w-71  p-4 bg-surface text-text shadow-lg fixed top-0 left-0 flex flex-col"
    >
      {/* Logo */}
      <div className="md:flex hidden items-center justify-center h-20 border-b border-border">
        <span
          className="text-primary font-poppins text-2xl font-bold cursor-pointer"
          onClick={() => router.push('/admin/home')}
        >
          EduSphere
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 px-2 space-y-2">
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
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg  transition-colors cursor-pointer text-left
                  ${isActive ? 'bg-primary text-white' : 'hover:bg-primary/10'}
                `}
                onClick={() => router.push(link.href)}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium hidden sm:inline-block">{link.name}</span>
              </button>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
}
