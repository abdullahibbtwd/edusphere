"use client"
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "School Name",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: (role: string) => {
          switch (role) {
            case "admin":
              return "/admin";
            case "teacher":
              return "/teacher";
            case "student":
              return "/student";
            case "parent":
              return "/parent";
            default:
              return "/";
          }
        },
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin"],
      },
      {
        icon: "/plus.png",
        label: "Schools Management",
        href: "/list/management",
        visible: ["admin"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: [],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/courses",
        visible: ["admin","student","teacher"],
      },
      {
        icon: "/class.png",
        label: "Class",
        href: "/list/departments",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Time Table",
        href: "/list/timetable",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Applicants",
        href: "/list/applicants",
        visible: ["admin"],
      },
      {
        icon: "/clock.png",
        label: "Screning Time",
        href: "/list/screenin-time",
        visible: ["admin"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: [],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: [],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin","teacher","student"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: [],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin","teacher","student"],
      },
     
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/list/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
   
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Sidebar = () => {
   const  role  = 'admin';
  return (
    <div className='mt-2 text-'>
      {
      menuItems.map((i)=>(
      <div className="flex flex-col gap-2" key={i.title}>
        <span className="hidden lg:block text-gray-400 font-light my-3">{i.title}</span>
        <div className="flex flex-col">
           {
          i.items.map(item=>{
          if(item.visible.includes(role)){
            const href = typeof item.href === 'function' ? item.href(role) : item.href;
            return(
            <Link href={href} key={item.label} 
            className="flex rounded-md  hover:bg-[#EDF9F0] gap-4 items-center justify-center lg:justify-start text-gray-500 py-1 px-2">
            <Image src={item.icon} width={17} height={17} alt="icon"/>
            <span className="hidden lg:block text-[14px]">{item.label}</span>
            </Link>
            )
        }
})}
      
       </div>
      </div>
    ))}
    </div>
  )
}

export default Sidebar