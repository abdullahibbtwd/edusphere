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
  Hash,
} from "lucide-react";

const menuItems = [
  {
    SchoolName: "School Name",
    items: [
      { icon: Home, label: "Home", href: "/school/admin", visible: ["admin"] },
      { icon: Users, label: "Teachers", href: "/school/list/teachers", visible: ["admin"] },
      { icon: School, label: "Schools Management", href: "/school/list/management", visible: ["admin"] },
      { icon: User, label: "Students", href: "/school/list/students", visible: ["admin", "teacher"] },
      { icon: UserCheck, label: "Parents", href: "/school/list/parents", visible: [] },
      { icon: BookOpen, label: "Subjects", href: "/school/list/subjects", visible: ["admin","student","teacher"] },
      { icon: Hash, label: "Levels", href: "/school/list/levels", visible: ["admin","teacher"] },
      { icon: Layers, label: "Class", href: "/school/list/class", visible: ["admin","teacher"] },
      { icon: Timer, label: "Time Table", href: "/school/list/timetable", visible: ["admin","teacher"] },
      { icon: User, label: "Applicants", href: "/school/list/applicants", visible: ["admin"] },
      { icon: Hourglass, label: "Screening Time", href: "/school/list/screenin-time", visible: ["admin"] },
      { icon: ClipboardList, label: "Exams", href: "/school/list/exams", visible: ["admin","teacher","student","parent"] },
      { icon: ClipboardList, label: "Assignments", href: "/school/list/assignments", visible: [] },
      { icon: GraduationCap, label: "Results", href: "/school/list/results", visible: ["admin","teacher","student"] },
      { icon: Users, label: "Attendance", href: "/school/list/attendance", visible: [] },
      { icon: Calendar, label: "Events", href: "/school/list/events", visible: ["admin","teacher","student"] },
      { icon: Megaphone, label: "Messages", href: "/school/list/messages", visible: [] },
      { icon: Megaphone, label: "Announcements", href: "/school/list/announcements", visible: ["admin","teacher","student"] },
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
