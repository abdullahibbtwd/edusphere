"use client";
import FormModel from "@/components/FormModel";

// Timetable type
type Timetable = {
  _id: string;
  className: string; // SS1A - SS3D
  term: string; // First Term, Second Term, Third Term
};

// Dummy Data (example)
const dummyTimetables: Timetable[] = [
  { _id: "1", className: "SS1A", term: "First Term" },
  { _id: "2", className: "SS1A", term: "Second Term" },
  { _id: "3", className: "SS1A", term: "Third Term" },
  { _id: "4", className: "SS1B", term: "First Term" },
  { _id: "5", className: "SS1B", term: "Second Term" },
  { _id: "6", className: "SS1B", term: "Third Term" },
  { _id: "4", className: "SS1C", term: "First Term" },
  { _id: "5", className: "SS1C", term: "Second Term" },
  { _id: "6", className: "SS1C", term: "Third Term" },
  { _id: "4", className: "SS1D", term: "First Term" },
  { _id: "5", className: "SS1D", term: "Second Term" },
  { _id: "6", className: "SS1D", term: "Third Term" },
  { _id: "7", className: "SS2A", term: "First Term" },
  { _id: "8", className: "SS2A", term: "Second Term" },
  { _id: "9", className: "SS2A", term: "Third Term" },
  { _id: "7", className: "SS2B", term: "First Term" },
  { _id: "8", className: "SS2B", term: "Second Term" },
  { _id: "9", className: "SS2B", term: "Third Term" },
  { _id: "7", className: "SS2C", term: "First Term" },
  { _id: "8", className: "SS2C", term: "Second Term" },
  { _id: "9", className: "SS2C", term: "Third Term" },
  { _id: "7", className: "SS2D", term: "First Term" },
  { _id: "8", className: "SS2D", term: "Second Term" },
  { _id: "9", className: "SS2D", term: "Third Term" },
  { _id: "7", className: "SS3A", term: "First Term" },
  { _id: "8", className: "SS3A", term: "Second Term" },
  { _id: "9", className: "SS3A", term: "Third Term" },
  { _id: "7", className: "SS3B", term: "First Term" },
  { _id: "8", className: "SS3B", term: "Second Term" },
  { _id: "9", className: "SS3B", term: "Third Term" },
  { _id: "7", className: "SS3C", term: "First Term" },
  { _id: "8", className: "SS3C", term: "Second Term" },
  { _id: "9", className: "SS3C", term: "Third Term" },
  { _id: "7", className: "SS3D", term: "First Term" },
  { _id: "8", className: "SS3D", term: "Second Term" },
  { _id: "9", className: "SS3D", term: "Third Term" },
 
];

// Group timetables by className
const groupByClass = (data: Timetable[]) => {
  return data.reduce((acc: Record<string, Timetable[]>, item) => {
    if (!acc[item.className]) acc[item.className] = [];
    acc[item.className].push(item);
    return acc;
  }, {});
};

const TimetablePage = () => {
  const grouped = groupByClass(dummyTimetables);

  return (
    <div className="flex flex-col gap-8 p-4">
      {Object.keys(grouped).map((className) => (
        <div
          key={className}
          className="bg-surface rounded-lg shadow-md p-4 text-text"
        >
          {/* Class Header */}
          <h2 className="font-bold text-primary mb-4">{className}</h2>

          {/* Terms Table */}
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-primary text-white text-sm">
                <th className="p-2 text-left">Term</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grouped[className].map((timetable) => (
                <tr
                  key={timetable._id}
                  className="border-b border-muted even:bg-bg odd:bg-surface hover:bg-primary/10 text-[13px]"
                >
                  <td className="p-2">{timetable.term}</td>
                  <td className="p-2 flex gap-2">
                    <FormModel table="timetable" type="edit" data={timetable} />
                    <FormModel
                      table="timetable"
                      type="delete"
                      id={timetable._id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TimetablePage;
