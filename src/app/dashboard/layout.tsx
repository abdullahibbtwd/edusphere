"use client";
import React from "react";
import SideBar from "@/components/SuperAdmin/SideBar"
import Navbar from "@/components/SuperAdmin/Navbar";
const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
        <Navbar/>
      <div className="flex w-full">
        <SideBar />
        {children}
      </div>
    </div>
  );
};

export default Layout;