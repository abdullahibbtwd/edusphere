
// export default GenratePdf;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// import logo from "./assets/logo.png"; // Assuming logo is imported and used elsewhere if needed

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lga: string;
  screeningDate: string;
  screeningTime: string;
  programName:string; 
  screeningLocation: string;
  // Academic Information
  highSchool: string;
  graduationYear: string;
  gpa: string;
  satScore: string;
  actScore: string;
  previousCollege: boolean;
  collegeCourses: string;
  studentName: string;
  secondarySchool: string;
  examType: string;
  examYear: string;
  subject1Name: string;
  subject1Grade: string;
  subject2Name: string;
  subject2Grade: string;
  subject3Name: string;
  subject3Grade: string;
  subject4Name: string;
  subject4Grade: string;
  subject5Name: string;
  subject5Grade: string;
  subject6Name: string;
  subject6Grade: string;
  subject7Name: string;
  subject7Grade: string;
  subject8Name: string;
  subject8Grade: string;
  subject9Name: string;
  subject9Grade: string;

  // Program Selection
  program: string;
  concentration: string;
  startTerm: string;

  // Health Information
  allergies: string;
  medications: string;
  conditions: string;
  emergencyContact: string;
  emergencyPhone: string;

  // Documents
  transcriptFile: File | null;
  secondarySchoolResultFile: File | null;
  birthCertificateFile: File | null;
  nationalIdFile: File | null;
  primaryCertificateFile: File | null;
  recommendationLetters: number;
  personalStatementFile: File | null;

  // Terms
  agreeTerms: boolean;
}

const GenratePdf = (
  data: FormData,
  applicationNumber: string
): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add school logo and header
  // doc.addImage(logo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text("HAKIMI COLLEGE", 105, 20, { align: "center" });
  doc.setFontSize(14);
  doc.text("OFFICE OF ADMISSIONS", 105, 27, { align: "center" });
  doc.setFontSize(12);
  doc.text("APPLICATION FOR ADMISSION", 105, 34, { align: "center" });

  // Add line below header
  doc.setDrawColor(247, 186, 52); // Gold color
  doc.setLineWidth(1);
  doc.line(15, 40, 195, 40);

  // Add application date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Application Date: ${new Date().toLocaleDateString()}`, 15, 47);
  doc.text(`Application Number: ${applicationNumber}`, 120, 47);

  // --- Initializing currentY early and safely ---
  // Start currentY after the header and application details
  let currentY = 55; // A safe starting point after the fixed header content

  // Section 1: Personal Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("1. PERSONAL INFORMATION", 15, currentY + 5);
  currentY += 10; // Adjust currentY for the section title

  const personalInfo = [
    ["Full Name:", `${data.firstName} ${data.lastName}`],
    ["Date of Birth:", data.dob],
    ["Gender:", data.gender],
    ["Email:", data.email],
    ["Phone:", data.phone],
    [
      "Address:",
      `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.lga}`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: personalInfo,
    theme: "grid",
    headStyles: {
      fillColor: [247, 186, 52],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15 },
  });
  currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table

  // Section 2: Academic Background
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    "2. ACADEMIC BACKGROUND",
    15,
    currentY + 15
  );
  currentY += 20; // Adjust currentY for the section title

  // Secondary School Information
  const academicInfo = [
    ["Secondary School:", data.secondarySchool],
    ["Exam Type:", data.examType],
    ["Exam Year:", data.examYear],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: academicInfo,
    theme: "grid",
    headStyles: {
      fillColor: [247, 186, 52],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15 },
  });
  currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table

  // Subjects Table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Examination Subjects and Grades:",
    15,
    currentY + 10
  );
  currentY += 15; // Adjust currentY for the subjects title

  const subjects = [];
  for (let i = 1; i <= 9; i++) {
    const subjectName = data[`subject${i}Name` as keyof FormData];
    const subjectGrade = data[`subject${i}Grade` as keyof FormData];
    if (subjectName && subjectGrade) {
      subjects.push([subjectName, subjectGrade]);
    }
  }

  // Only generate the table if there are subjects to display
  if (subjects.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [["Subject", "Grade"]],
      body: subjects,
      theme: "grid",
      headStyles: {
        fillColor: [247, 186, 52],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 30 },
      },
      margin: { left: 15 },
    });
    currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table
  } else {
    // If no subjects, just move currentY down a bit
    currentY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No examination subjects provided.", 15, currentY);
    currentY += 10;
  }


  // Previous College Information if applicable
  if (data.previousCollege) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Previous College Information:",
      15,
      currentY + 10
    );
    currentY += 15; // Adjust currentY for the previous college title

    autoTable(doc, {
      startY: currentY,
      body: [[data.collegeCourses || "N/A"]], // Added N/A fallback
      theme: "grid",
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: "middle",
      },
      margin: { left: 15 },
    });
    currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table
  }

  // Section 3: Program Selection
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. PROGRAM SELECTION", 15, currentY + 15);
  currentY += 20; // Adjust currentY for the section title

  const programInfo = [
    ["Department:", data.program],
    ["Program:", data.programName || "N/A"],
    ["Start Term:", data.startTerm],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: programInfo,
    theme: "grid",
    headStyles: {
      fillColor: [247, 186, 52],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15 },
  });
  currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table

  // Section 4: Health Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. HEALTH INFORMATION", 15, currentY + 15);
  currentY += 20; // Adjust currentY for the section title

  const healthInfo = [
    ["Allergies:", data.allergies || "None"],
    ["Medications:", data.medications || "None"],
    ["Medical Conditions:", data.conditions || "None"],
    ["Emergency Contact:", `${data.emergencyContact || "N/A"} (${data.emergencyPhone || "N/A"})`], // Added N/A fallbacks
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: healthInfo,
    theme: "grid",
    headStyles: {
      fillColor: [247, 186, 52],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15 },
  });
  currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table

  // Section 5: Documents
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("5. DOCUMENTS ATTACHED", 15, currentY + 15);
  currentY += 20; // Adjust currentY for the section title

  const documentsInfo = [
    [
      "Secondary School Result:",
      data.secondarySchoolResultFile?.name || "Not provided",
    ],
    ["Birth Certificate:", data.birthCertificateFile?.name || "Not provided"],
    ["National ID:", data.nationalIdFile?.name || "Not provided"],
    [
      "Primary Certificate:",
      data.primaryCertificateFile?.name || "Not provided",
    ],
    ["Transcript:", data.transcriptFile?.name || "Not provided"],
    ["Personal Statement:", data.personalStatementFile?.name || "Not provided"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Document", "File Name"]],
    body: documentsInfo,
    theme: "grid",
    headStyles: {
      fillColor: [247, 186, 52],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15 },
  });
  currentY = (doc as any).lastAutoTable.finalY; // Update currentY after table

  // Footer and Signature
  currentY += 20; // Add some space after the last table

  // Handle page overflow before signature
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // Signature content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'I certify that the information provided in this application is complete and accurate to the best of my knowledge.',
    15,
    currentY + 10
  );

  // Signature line
  doc.setFont("helvetica", "bold");
  doc.text(
    `Applicant Signature: ${data.firstName} ${data.lastName}`,
    15,
    currentY + 25
  );
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, currentY + 25);

  // Prepare for screening details
  currentY += 40; // Increase currentY to make space for screening details
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  if (data.screeningDate) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SCREENING DETAILS", 15, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Your admission screening has been scheduled for:`,
      15,
      currentY + 10
    );

    doc.setFont("helvetica", "bold");
    doc.text(`Date: ${data.screeningDate}`, 15, currentY + 20);
    doc.text(`Time: ${data.screeningTime}`, 15, currentY + 30);
    doc.text(`Department: ${data.program}`, 15, currentY + 40);
    doc.text(`Program: ${data.programName || "N/A"}`, 15, currentY + 50);
    doc.text(`Venue: ${data.screeningLocation}`, 15, currentY + 60);

    doc.setFont("helvetica", "normal");
    doc.text(
      "Please bring this document and a valid ID to your screening session.",
      15,
      currentY + 70
    );
  }

  // Save the PDF
  doc.save(`HAKIMI_Application_${data.firstName}_${data.lastName}.pdf`);
  return new Promise((resolve) => {
    const pdfBlob = doc.output("blob");
    resolve(pdfBlob);
  });
};

export default GenratePdf;