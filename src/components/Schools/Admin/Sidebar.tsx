"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Home,
  School,
  Users,
  User,
  BookOpen,
  Calendar,
  ClipboardList,
  Hourglass,
  UserCheck,
  GraduationCap,
  Megaphone,
  UserCircle,
  LogOut,
  Layers,
  Timer,
  Hash,
} from "lucide-react";

interface SidebarProps {
  school: string;
}

const Sidebar = ({ school }: SidebarProps) => {
  const { role } = useUser();
  const pathname = usePathname();
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [dynamicSchoolName, setDynamicSchoolName] = useState<string>("");

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (school) {
        try {
          const response = await fetch(`/api/schools/by-subdomain/${school}`);
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
  }, [school]);

  const getHomeHref = () => {
    if (role === 'admin') return `/${school}/admin`;
    if (role === 'teacher') return `/${school}/teacher`;
    if (role === 'student') return `/${school}/student`;
    return `/${school}/admin`; // Fallback
  };

  const menuItems = [
    {
      SchoolName: "School Name",
      items: [
        { icon: Home, label: "Home", href: getHomeHref(), visible: ["admin", "teacher", "student"] },
        { icon: Users, label: "Teachers", href: `/${school}/list/teachers`, visible: ["admin"] },
        { icon: School, label: "Schools Management", href: `/${school}/list/management`, visible: ["admin"] },
        { icon: User, label: "Students", href: `/${school}/list/students`, visible: ["admin", "teacher"] },
        { icon: UserCheck, label: "Parents", href: `/${school}/list/parents`, visible: [] },
        { icon: BookOpen, label: "Subjects", href: `/${school}/list/subjects`, visible: ["admin", "student", "teacher"] },
        { icon: Hash, label: "Levels", href: `/${school}/list/levels`, visible: ["admin"] },
        { icon: Layers, label: "Classes", href: `/${school}/list/class`, visible: ["admin", "teacher"] },
        { icon: Timer, label: "Time Table", href: `/${school}/list/timetable`, visible: ["admin", "teacher"] },
        { icon: User, label: "Applicants", href: `/${school}/list/applicants`, visible: ["admin"] },
        { icon: Hourglass, label: "Screening Time", href: `/${school}/list/screenin-time`, visible: ["admin"] },
        { icon: ClipboardList, label: "Exams", href: `/${school}/list/exams`, visible: ["admin", "teacher", "student", "parent"] },
        { icon: ClipboardList, label: "Assignments", href: `/${school}/list/assignments`, visible: [] },
        { icon: GraduationCap, label: "Results", href: `/${school}/list/results`, visible: ["admin", "teacher", "student"] },
        { icon: Users, label: "Attendance", href: `/${school}/list/attendance`, visible: [] },
        { icon: Calendar, label: "Events", href: `/${school}/list/events`, visible: ["admin", "teacher", "student"] },
        { icon: Megaphone, label: "Messages", href: `/${school}/list/messages`, visible: [] },
        { icon: Megaphone, label: "Announcements", href: `/${school}/list/announcements`, visible: ["admin", "teacher", "student"] },
      ],
    },
    {
      title: "OTHER",
      items: [
        { icon: UserCircle, label: "Profile", href: `/${school}/list/profile`, visible: ["admin", "teacher", "student", "parent"] },
        { icon: LogOut, label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
      ],
    },
  ];

  return (
    <div className=" ">
      {menuItems.map((section, idx) => (
        <div className="flex flex-col gap-2 " key={section.title || section.SchoolName || idx}>
          {section.SchoolName ? (
            <div className="flex px-3 mt-5 items-center gap-3">
              {schoolLogo && (
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={schoolLogo}
                    alt={dynamicSchoolName || "School Logo"}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-lg font-semibold font-italic text-text">
                {dynamicSchoolName || "School Name"}
              </h2>
            </div>
          ) : (
            <div className="px-3 mt-4">
              <h2 className="text-sm text-text">{section.title}</h2>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {section.items
              .filter((item) => item.visible.includes(role))
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`flex rounded-md gap-4 items-center justify-center lg:justify-start py-2 px-3 transition-colors cursor-pointer
                      ${isActive ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >
                    <Icon size={18} />
                    <span className="hidden lg:block text-[14px]">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
