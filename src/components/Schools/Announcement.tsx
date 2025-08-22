"use client";

import { useRouter } from "next/navigation";

const announcements = [
  {
    _id: "1",
    title: "School Reopening Date",
    content:
      "The school will officially reopen for the new term on September 15th, 2025. Kindly ensure all necessary materials are ready.",
    createdAt: "2025-08-10T09:30:00Z",
  },
  {
    _id: "2",
    title: "Inter-House Sports Competition",
    content:
      "The annual inter-house sports competition is scheduled for October 2nd, 2025. All students are encouraged to participate and support their houses.",
    createdAt: "2025-08-12T11:00:00Z",
  },
  {
    _id: "3",
    title: "Examination Timetable Released",
    content:
      "The timetable for the upcoming term examinations has been released. Students should check the notice board or portal for details.",
    createdAt: "2025-08-15T14:20:00Z",
  },
  {
    _id: "4",
    title: "Parent-Teacher Meeting",
    content:
      "A Parent-Teacher meeting has been scheduled for August 25th, 2025. Parents are encouraged to attend and discuss their child’s progress.",
    createdAt: "2025-08-14T08:00:00Z",
  },
];

const Announcement = () => {
  const router = useRouter();

  return (
    <div className="bg-surface p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-[16px] font-semibold my-4 text-text font-poppins">
          Announcement
        </h1>
        <span
          className="text-xs cursor-pointer text-muted hover:text-primary font-roboto-mono"
          onClick={() => router.push("/list/announcements")}
        >
          View All
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {announcements?.slice(0, 3).map((announcement) => (
          <div
            key={announcement._id}
            className="bg-muted rounded-md p-4 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => router.push("/list/announcements")}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-medium text-text font-poppins">
                {announcement.title}
              </h2>
              <span className="text-[10px] px-1 text-muted bg-surface rounded-md font-roboto-mono">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-[10px] text-muted line-clamp-2 font-roboto-mono">
              {announcement.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcement;