'use client';

import { useState } from 'react';
import { FiMenu, FiX, FiHome, FiInfo, FiGrid, FiTag, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ThemeButton from './ThemeButton';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
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
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, type: 'spring', stiffness: 100 } }),
  };

  return (
    <>
      <nav className="bg-surface text-text font-poppins shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span
                onClick={() => router.push('/')}
                className="text-primary cursor-pointer font-poppins tracking-widest text-2xl font-bold"
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
              <button className='px-4 hidden md:flex py-2 rounded-md bg-primary text-white cursor-pointer hover:scale-105 duration-500 ease-in-out transition-all'>

                Get Started

              </button>
            </div>
            <div className="md:hidden flex items-center gap-4">
              <button
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-white cursor-pointer hover:scale-105 duration-500 ease-in-out transition-all"
              >
                Get Started
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-primary focus:outline-none"
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
          <ThemeButton />
        </div>
      </motion.div>
    </>
  );
}
