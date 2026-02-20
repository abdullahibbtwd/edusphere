"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import ThemeButton from '../ThemeButton';

interface NavbarProps {
  schoolName?: string;
  subdomain?: string;
}

import { logout } from "@/lib/client-auth";
import { useUser } from "@/context/UserContext";

const Navbar = ({ schoolName = "School Name", subdomain }: NavbarProps) => {

  const router = useRouter();
  const { user, role } = useUser();

  const [sessionSubdomain, setSessionSubdomain] = useState<string>('');
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [dynamicSchoolName, setDynamicSchoolName] = useState<string>("");

  useEffect(() => {
    if (user?.schoolSubdomain) {
      setSessionSubdomain(user.schoolSubdomain);
    }
  }, [user]);

  // Fetch school data
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (subdomain) {
        try {
          const response = await fetch(`/api/schools/by-subdomain/${subdomain}`);
          if (response.ok) {
            const data = await response.json();
            setSchoolLogo(data.content?.schoolLogo || null);
            setDynamicSchoolName(data.name || "");
          }
        } catch (error) {
          console.error('Error fetching school data:', error);
        }
      }
    };

    fetchSchoolData();
  }, [subdomain]);

  const handleLogout = async () => {
    await logout();
  };

  const handleAuthClick = () => {
    const targetSubdomain = subdomain || sessionSubdomain;
    if (targetSubdomain) {
      router.push(`/${targetSubdomain}/auth`);
    } else {
      router.push('/auth');
    }
  };

  const activeSubdomain = subdomain || sessionSubdomain;

  return (
    <nav className="relative z-[20] w-full bg-bg">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeInOut" }}
        className="container mx-auto py-3 px-4 flex justify-between items-center"
      >
        {/* Logo Section */}
        <div className="flex px-10 items-center gap-3">
          {/* Mobile: Logo only */}
          {schoolLogo && (
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
              <Image
                src={schoolLogo}
                alt={dynamicSchoolName || schoolName}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 40px, 48px"
              />
            </div>
          )}
          {/* Large screens: School name */}
          <h1 className="font-bold text-2xl hidden lg:flex">{dynamicSchoolName || schoolName}</h1>
        </div>

        <div className="flex gap-4 items-center">
          <ThemeButton />
          {role ? (
            <>
              <button
                className="inline-block bg-primary text-text font-semibold text-xs md:text-base py-2 px-4 md:px-6 rounded-lg hover:bg-primary-400 cursor-pointer duration-200"
                onClick={() => router.push(`/${activeSubdomain}/${role}`)}>
                Dashboard
              </button>
              <button
                className="inline-flex items-center justify-center bg-danger text-white font-semibold p-2 md:py-2 md:px-4 rounded-lg hover:bg-danger/80 cursor-pointer duration-200"
                onClick={handleLogout}
                title="Log Out">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                className="inline-block bg-transparent text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary/10 cursor-pointer duration-200"
                onClick={handleAuthClick}>
                Login/ Sign Up
              </button>
            </>
          )}
        </div>


      </motion.div>
    </nav>
  );
};

export default Navbar;
