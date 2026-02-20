'use client';

import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiHome, FiInfo, FiGrid, FiTag, FiMail, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ThemeButton from './ThemeButton';
import AuthNavigation from './AuthNavigation';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/client-auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuth(false);
    setIsOpen(false);
    router.refresh();
  };

  const navLinks = [
    { name: 'Home', icon: <FiHome />, href: '#' },
    { name: 'About', icon: <FiInfo />, href: '#about' },
    { name: 'Features', icon: <FiGrid />, href: '#features' },
    { name: 'Pricing', icon: <FiTag />, href: '#pricing' },
    { name: 'Contact', icon: <FiMail />, href: '#contact' },
  ];

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: any) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, type: 'spring', stiffness: 100 } }),
  };

  return (
    <>
      <nav className="bg-surface text-text font-poppins shadow-md fixed w-full z-50">
        <div className="w-full md:max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span
                onClick={() => router.push('/')}
                className="text-primary cursor-pointer font-poppins tracking-widest text-lg sm:text-2xl font-bold"
              >
                EduSphere
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center space-x-1 hover:text-primary transition-all hover:scale-105 duration-500 ease-in-out font-roboto-mono"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}
              <ThemeButton />
            </div>
            <div>
              <AuthNavigation
                className="px-4 hidden md:flex py-2 rounded-md bg-primary text-white cursor-pointer hover:scale-105 duration-500 ease-in-out transition-all"
              />
            </div>
            <div className="md:hidden flex items-center gap-2">
              <AuthNavigation
                className="px-2.5 py-1.5 text-xs sm:text-sm rounded-md bg-primary text-white cursor-pointer hover:scale-105 duration-500 ease-in-out transition-all whitespace-nowrap"
                mobile={true}
              />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-primary focus:outline-none flex-shrink-0"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <motion.div
        className="fixed top-0 right-0 w-64 h-full bg-surface shadow-lg z-50 flex flex-col p-6"
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        variants={sidebarVariants}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="self-end mb-6 text-2xl"
        >
          <FiX />
        </button>

        <div className="flex flex-col gap-6 mt-2">
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              custom={index}
              initial="hidden"
              animate={isOpen ? 'visible' : 'hidden'}
              variants={linkVariants}
              className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
            >
              {link.icon}
              <span>{link.name}</span>
            </motion.a>
          ))}

          {isAuth && (
            <motion.button
              custom={navLinks.length}
              initial="hidden"
              animate={isOpen ? 'visible' : 'hidden'}
              variants={linkVariants}
              onClick={handleLogout}
              className="flex items-center gap-2 text-lg font-semibold text-red-500 hover:text-red-700 transition-colors w-full text-left"
            >
              <FiLogOut />
              <span>Logout</span>
            </motion.button>
          )}

          <ThemeButton />
        </div>
      </motion.div>
    </>
  );
}
