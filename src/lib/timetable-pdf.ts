import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

type ScheduleEntry = {
  subject?: string;
  teacher?: string;
  className?: string | null;
  startTime?: string;
  endTime?: string;
};

type ScheduleRecord = Record<string, ScheduleEntry[]>;

/**
 * Build table body rows for PDF: one row per period.
 * For type 'class' (student/admin): cell = subject + teacher
 * For type 'teacher': cell = subject + class name
 */
function buildBodyRows(
  schedule: ScheduleRecord,
  type: "class" | "teacher"
): string[][] {
  const maxPeriods = Math.max(
    ...DAYS.map((day) => schedule[day]?.length || 0),
    1
  );
  const rows: string[][] = [];

  for (let p = 0; p < maxPeriods; p++) {
    const periodIndex = p + 1;
    const firstSlot = schedule[DAYS[0]]?.[p];
    const timeStr =
      firstSlot?.startTime && firstSlot?.endTime
        ? `${firstSlot.startTime}-${firstSlot.endTime}`
        : `Period ${periodIndex}`;

    const row: string[] = [timeStr];

    DAYS.forEach((day) => {
      const entry = schedule[day]?.[p];
      const isFree =
        !entry?.subject || entry.subject.toLowerCase() === "free";
      if (isFree) {
        row.push("Free");
      } else {
        const sub = entry!.subject || "";
        const extra =
          type === "teacher"
            ? entry!.className || ""
            : entry!.teacher || "";
        row.push(extra ? `${sub}\n${extra}` : sub);
      }
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Download timetable as PDF.
 * @param schedule - Schedule object (DAYS -> array of entries)
 * @param title - e.g. "JSS1 Alpha - First Term" or "John's Schedule - First Term"
 * @param type - 'class' shows teacher name under subject; 'teacher' shows class name under subject
 * @param schoolName - optional school name shown centered at top
 */
export function downloadTimetablePdf(
  schedule: ScheduleRecord,
  title: string,
  type: "class" | "teacher",
  schoolName?: string
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.getPageWidth();
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;
  const centerX = pageWidth / 2;

  let startY = 14;

  if (schoolName) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(schoolName, centerX, startY, { align: "center" });
    startY += 10;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, centerX, startY, { align: "center" });
  startY += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Timetable", centerX, startY, { align: "center" });
  startY += 10;

  const headers = ["Period", ...DAYS];
  const body = buildBodyRows(schedule, type);

  autoTable(doc, {
    startY,
    head: [headers],
    body,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 3,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold" },
      1: { cellWidth: (maxWidth - 22) / 5 },
      2: { cellWidth: (maxWidth - 22) / 5 },
      3: { cellWidth: (maxWidth - 22) / 5 },
      4: { cellWidth: (maxWidth - 22) / 5 },
      5: { cellWidth: (maxWidth - 22) / 5 },
    },
    margin: { left: margin },
    tableWidth: maxWidth,
  });

  const filename = `${title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}-timetable.pdf`;
  doc.save(filename);
}
