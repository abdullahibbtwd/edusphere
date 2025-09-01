"use client";
import { useState } from "react";
import {
  DocumentTextIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Dummy Applicants Data
const dummyApplicants = [
  {
    _id: "1",
    firstName: "Aisha",
    lastName: "Bello",
    email: "aisha@example.com",
    phone: "08012345678",
    applicationNumber: "APP001",
    applicationDate: "2024-08-10",
    program: "Secondary School",
    secondarySchoolResultStorageId: "file1",
    birthCertificateStorageId: "file2",
    nationalIdStorageId: "file3",
    generatedPdfStorageId: "file4",
  },
  {
    _id: "2",
    firstName: "John",
    lastName: "Okafor",
    email: "john@example.com",
    phone: "08123456789",
    applicationNumber: "APP002",
    applicationDate: "2024-08-12",
    program: "Secondary School",
    secondarySchoolResultStorageId: "file5",
    birthCertificateStorageId: "file6",
    nationalIdStorageId: "file7",
    generatedPdfStorageId: "file8",
  },
];

const ApplicantsList = () => {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [applicants, setApplicants] = useState(dummyApplicants);

  // Handle Admit / Reject
  const handleStatusUpdate = (studentId: string, status: "admitted" | "rejected") => {
    setApplicants((prev) =>
      prev.filter((a) => a._id !== studentId) // remove from list after action
    );
    alert(`Application ${status}`);
    setSelectedApplicant(null);
  };

  // Filter Applicants
  const filteredApplicants = applicants.filter((applicant) =>
    applicant.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-bg dark:bg-surface rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-foreground">Admission Applicants</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Application Number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full bg-surface dark:bg-bg text-foreground"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted dark:bg-muted/30">
            <tr>
              {["Applicant", "Application #", "Email", "Phone", "Program", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredApplicants.map((applicant, i) => (
              <tr
                key={applicant._id}
                className={`${
                  i % 2 === 0 ? "bg-bg dark:bg-surface" : "bg-surface dark:bg-bg"
                } hover:bg-muted/50`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground">
                        {applicant.firstName} {applicant.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Applied: {new Date(applicant.applicationDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {applicant.applicationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {applicant.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {applicant.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {applicant.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setSelectedApplicant(applicant)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <EyeIcon className="h-5 w-5 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(applicant._id, "admitted")}
                      className="text-green-600 hover:text-green-900 flex items-center"
                    >
                      <CheckIcon className="h-5 w-5 mr-1" />
                      Admit
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(applicant._id, "rejected")}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 mr-1" />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg dark:bg-surface rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">
                Documents for {selectedApplicant.firstName} {selectedApplicant.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Application #: {selectedApplicant.applicationNumber}
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentCard title="Secondary School Result" />
              <DocumentCard title="Birth Certificate" />
              <DocumentCard title="National ID" />
              <DocumentCard title="Application PDF" />
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DocumentCard = ({ title }: { title: string }) => {
  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/30">
      <div className="flex items-center mb-2">
        <DocumentTextIcon className="h-6 w-6 text-muted-foreground mr-2" />
        <h4 className="font-medium text-foreground">{title}</h4>
      </div>
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-indigo-600 hover:text-indigo-800 block truncate"
      >
        View Document
      </a>
    </div>
  );
};

export default ApplicantsList;
