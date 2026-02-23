"use client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  religion: string;

  // Academic Information
  lastSchoolAttended: string;
  level: string;
  classId: string;
  className: string;

  // Parent/Guardian Information
  parentName: string;
  parentRelationship: string;
  parentEmail: string;
  parentPhone: string;
  parentOccupation?: string;
  parentAddress?: string;

  // File paths (optional)
  profileImagePath?: string;

  agreeTerms: boolean;
}

interface SchoolInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

const generateApplicationPdf = async (
  data: ApplicationData,
  applicationNumber: string,
  schoolInfo: SchoolInfo
): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add school header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(schoolInfo.name.toUpperCase(), 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text("OFFICE OF ADMISSIONS", 105, 28, { align: "center" });
  doc.setFontSize(12);
  doc.text("STUDENT APPLICATION FORM", 105, 35, { align: "center" });

  // Add line below header
  doc.setDrawColor(59, 130, 246); // Blue color
  doc.setLineWidth(1);
  doc.line(15, 42, 195, 42);

  // Add application details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Application Date: ${new Date().toLocaleDateString()}`, 15, 50);
  doc.text(`Application Number: ${applicationNumber}`, 120, 50);

  // Add student photo if exists
  if (data.profileImagePath) {
    try {
      const base64Image = await getBase64ImageFromURL(data.profileImagePath);
      doc.addImage(base64Image, "JPEG", 165, 12, 30, 30);

      // Add a border frame for the photo
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(165, 12, 30, 30);
    } catch (e) {
      console.warn("Could not add image to PDF:", e);
    }
  }

  let currentY = 65;

  // Section 1: Personal Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("1. PERSONAL INFORMATION", 15, currentY);
  currentY += 10;

  const personalInfo = [
    ["Full Name:", `${data.firstName} ${data.lastName}`.trim()],
    ["Date of Birth:", new Date(data.dob).toLocaleDateString()],
    ["Gender:", data.gender.charAt(0).toUpperCase() + data.gender.slice(1)],
    ["Email:", data.email],
    ["Phone:", data.phone],
    ["Religion:", data.religion.charAt(0).toUpperCase() + data.religion.slice(1)],
    ["Address:", `${data.address}, ${data.state}`],
    ["LGA:", data.lga],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: personalInfo,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
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
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: Academic Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. ACADEMIC INFORMATION", 15, currentY);
  currentY += 10;

  const academicInfo = [
    ["Applied Level:", data.level.toUpperCase()],
    ["Applied Class:", data.className],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: academicInfo,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
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
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 3: Academic History
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. ACADEMIC HISTORY", 15, currentY);
  currentY += 10;

  const historyInfo = [
    ["Last School Attended:", data.lastSchoolAttended || "None"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: historyInfo,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
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
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 4: Parent/Guardian Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. PARENT/GUARDIAN INFORMATION", 15, currentY);
  currentY += 10;

  const parentInfo = [
    ["Name:", data.parentName],
    ["Relationship:", data.parentRelationship.charAt(0).toUpperCase() + data.parentRelationship.slice(1)],
    ["Email:", data.parentEmail],
    ["Phone:", data.parentPhone],
    ["Occupation:", data.parentOccupation || "Not provided"],
    ["Address:", data.parentAddress || "Not provided"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: parentInfo,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
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
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Handle page overflow before signature
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // Signature section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const certText = 'I certify that the information provided in this application is complete and accurate to the best of my knowledge.';
  const splitText = doc.splitTextToSize(certText, 180);
  doc.text(splitText, 15, currentY);

  currentY += 15;

  // Signature line
  doc.setFont("helvetica", "bold");
  doc.text(
    `Applicant Signature: ${data.firstName} ${data.lastName}`,
    15,
    currentY + 20
  );
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, currentY + 20);

  // Parent signature
  doc.text(
    `Parent/Guardian Signature: ${data.parentName}`,
    15,
    currentY + 35
  );
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, currentY + 35);

  // Footer
  currentY += 50;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text("This application will be reviewed by the admissions committee.", 15, currentY);
  doc.text("You will be notified of the admission decision via email.", 15, currentY + 5);
  doc.text(`Application Number: ${applicationNumber}`, 15, currentY + 15);

  // Save the PDF
  const fileName = `${schoolInfo.name.replace(/\s+/g, '_')}_Application_${data.firstName}_${data.lastName}.pdf`;
  doc.save(fileName);

  return new Promise((resolve) => {
    const pdfBlob = doc.output("blob");
    resolve(pdfBlob);
  });
};

export default generateApplicationPdf;
