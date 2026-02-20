import Announcement from "@/components/Announcement";
import BigCalendar from "@/components/BigCalender";
import Perfomance from "@/components/Perfomance";
import Image from "next/image";
import Link from "next/link";

const StudentPage = () => {
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row ">
      {/* Left */}
      <div className="w-full xl:w-2/3 ">
        {/* Top */}
        <div className=" flex flex-col lg:flex-row gap-4">
          {/* User info Card */}
          <div className="bg-[#C3EBFA] py-6 px-4 rounded-md flex-1 flex gap-3">
            <div className="w-1/3 flex items-center" >
              <Image
                src="https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="photo"
                width={120}
                height={120}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-3">
              <h1 className="text-xl font-semibold">Abbdullahi bashir</h1>
              <p className="text-sm text-gray-500 ">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full lg:w-full 2xl:w-1/3 md:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>A+</span>
                </div>
                <div className="w-full lg:w-full 2xl:w-1/3 md:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>January 2025</span>
                </div>
                <div className="w-full lg:w-full 2xl:w-1/3 md:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>abb@gmail.com</span>
                </div>
                <div className="w-full lg:w-full 2xl:w-1/3 md:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>1223345666776</span>
                </div>
              </div>
            </div>
          </div>
          {/*small Cards */}
          <div className="flex-1 flex gap-3 justify-between flex-wrap">
            {/* Cards */}
            <div className="w-full bg-white p-4 rounded-md  md:w-[48%] xl:w-[45%] 2xl:w-[48%] flex gap-4 items-center">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 "
              />
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl font-semibold">94%</h1>
                <span className="text-xs text-gray-700">Attendace</span>
              </div>
            </div>
            <div className="w-full bg-white p-4 rounded-md  md:w-[48%] xl:w-[45%] 2xl:w-[48%] flex gap-4 items-center">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 "
              />
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl font-semibold">6</h1>
                <span className="text-xs text-gray-700">Grade</span>
              </div>
            </div>
            <div className="w-full bg-white p-4 rounded-md  md:w-[48%] xl:w-[45%] 2xl:w-[48%] flex gap-4 items-center">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 "
              />
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl font-semibold">6A</h1>
                <span className="text-xs text-gray-700">Class Name</span>
              </div>
            </div>
            <div className="w-full bg-white p-4 rounded-md  md:w-[48%] xl:w-[45%] 2xl:w-[48%] flex gap-4 items-center">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 "
              />
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl font-semibold">6</h1>
                <span className="text-xs text-gray-700">Grade</span>
              </div>
            </div>
          </div>
        </div>
        {/* bottom */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
            <h1>Student&apos;s Schedule</h1>
            <BigCalendar/>
        </div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 gap-4 flex flex-col">
      <div className="bg-white p-4 rounded-md ">
            <h1 className="text-xl font-semibold">Shortcuts</h1>
            <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link className="p-3 rounded-md bg-[#EDF9F0]" href='/'>Student&apos;s Classes</Link>  
            <Link className="p-3 rounded-md bg-[#C3EBFA]" href='/'>Student&apos;s Teachers</Link>  
            <Link className="p-3 rounded-md bg-[#FEFCEB]" href='/'>Student&apos;s Lessons</Link>  
            <Link className="p-3 rounded-md bg-[#CFCEFF]" href='/'>Student&apos;s Exams</Link>  
            <Link className="p-3 rounded-md bg-[#CFCEFF]" href='/'>Student&apos;s Assignment</Link>  

            </div>
          
            
      </div>
       <Perfomance/>
        <Announcement/>
      </div>
    </div>
  );
};

export default StudentPage;
