"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const menuItems = [
  {
    SchoolName: "School Name",
    items: [
      { icon: Home, label: "Home", href: "/admin", visible: ["admin"] },
      { icon: Users, label: "Teachers", href: "/list/teachers", visible: ["admin"] },
      { icon: School, label: "Schools Management", href: "/list/management", visible: ["admin"] },
      { icon: User, label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: UserCheck, label: "Parents", href: "/list/parents", visible: [] },
      { icon: BookOpen, label: "Subjects", href: "/list/subjects", visible: ["admin","student","teacher"] },
      { icon: Layers, label: "Class", href: "/list/class", visible: ["admin","teacher"] },
      { icon: Timer, label: "Time Table", href: "/list/timetable", visible: ["admin","teacher"] },
      { icon: User, label: "Applicants", href: "/list/applicants", visible: ["admin"] },
      { icon: Hourglass, label: "Screening Time", href: "/list/screenin-time", visible: ["admin"] },
      { icon: ClipboardList, label: "Exams", href: "/list/exams", visible: ["admin","teacher","student","parent"] },
      { icon: ClipboardList, label: "Assignments", href: "/list/assignments", visible: [] },
      { icon: GraduationCap, label: "Results", href: "/list/results", visible: ["admin","teacher","student"] },
      { icon: Users, label: "Attendance", href: "/list/attendance", visible: [] },
      { icon: Calendar, label: "Events", href: "/list/events", visible: ["admin","teacher","student"] },
      { icon: Megaphone, label: "Messages", href: "/list/messages", visible: [] },
      { icon: Megaphone, label: "Announcements", href: "/list/announcements", visible: ["admin","teacher","student"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: UserCircle, label: "Profile", href: "/list/profile", visible: ["admin","teacher","student","parent"] },
      { icon: LogOut, label: "Logout", href: "/logout", visible: ["admin","teacher","student","parent"] },
    ],
  },
];

const Sidebar = () => {
  const role = "admin";
  const pathname = usePathname();

  return (
    <div className=" ">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2 " key={section.title}>
         {section.SchoolName ?(
          <div className="px-3 mt-5">
            <h2 className="text-lg font-semibold font-italic text-text">{section.SchoolName}</h2>
          </div>
         ): <div className="px-3 mt-4">
            <h2 className="text-sm  text-text">{section.title}</h2>
          </div>}
          
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              if (item.visible.includes(role)) {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    className={`flex rounded-md gap-4 items-center justify-center lg:justify-start py-2 px-3 transition-colors cursor-pointer
                      ${isActive ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >
                    <Icon size={18} />
                    <span className="hidden lg:block text-[14px]">{item.label}</span>
                  </Link>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
