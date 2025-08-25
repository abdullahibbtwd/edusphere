"use client"
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { DocumentTextIcon, EyeIcon,CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

const ApplicantsList = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const applicants = useQuery(api.students.getApplicants) || [];
  const updateStatusMutation = useMutation(api.students.updateStatus);


  const handleStatusUpdate = async (
  studentId: any,
  status: "admitted" | "rejected"
) => {
  try {
    await updateStatusMutation({ studentId, status });
    toast.success(`Application ${status}`);
    setSelectedApplicant(null);
  } catch (error) {
    toast.error("Failed to update status");
    console.error(error);
  }
};

  const filteredApplicants = applicants.filter((applicant) =>
    applicant.applicationNumber.includes(searchTerm)
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Admission Applicants</h2>

      <input
        type="text"
        placeholder="Search by Application Number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplicants.map((applicant) => (
              <tr key={applicant._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Applied: {new Date(applicant.applicationDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {applicant.applicationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {applicant.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {applicant.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {applicant.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setSelectedApplicant(applicant)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <EyeIcon className="h-5 w-5 mr-1" />
                      View Documents
                    </button>
                    <button
                    onClick={() => handleStatusUpdate(applicant._id, "admitted")}
                    className="text-green-600 hover:text-green-900 flex items-center"
                    title="Admit Applicant"
                  >
                    <CheckIcon className="h-5 w-5 mr-1" />
                    Admit
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(applicant._id, "rejected")}
                    className="text-red-600 hover:text-red-900 flex items-center"
                    title="Reject Applicant"
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

      {/* Documents Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Documents for {selectedApplicant.firstName} {selectedApplicant.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                Application #: {selectedApplicant.applicationNumber}
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentCard 
                title="Secondary School Result" 
                storageId={selectedApplicant.secondarySchoolResultStorageId} 
              />
              <DocumentCard 
                title="Birth Certificate" 
                storageId={selectedApplicant.birthCertificateStorageId} 
              />
              <DocumentCard 
                title="National ID" 
                storageId={selectedApplicant.nationalIdStorageId} 
              />
              <DocumentCard 
                title="Application PDF" 
                storageId={selectedApplicant.generatedPdfStorageId} 
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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

const DocumentCard = ({ title, storageId }: { title: string; storageId: string | null }) => {
  const fileUrl = useQuery(api.files.getFileUrl, { storageId: storageId || "" });

  if (!storageId) return null;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-center mb-2">
        <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-2" />
        <h4 className="font-medium">{title}</h4>
      </div>

      {fileUrl ? (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-800 block truncate"
        >
          View Document
        </a>
      ) : (
        <p className="text-sm text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default ApplicantsList;
