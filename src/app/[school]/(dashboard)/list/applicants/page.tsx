"use client";
import { useState, useCallback, useEffect } from "react";
import {
  DocumentTextIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import generateApplicationPdf from "@/components/ApplicationPdfGenerator";

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicationNumber: string;
  applicationDate: string;
  status: 'PROGRESS' | 'ADMITTED' | 'REJECTED';
  class: {
    id: string;
    name: string;
    levelName: string;
    fullName: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

type ApplicationDetails = {
  id: string;
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
  applicationNumber: string;
  applicationDate: string;
  status: 'PROGRESS' | 'ADMITTED' | 'REJECTED';
  class: {
    id: string;
    name: string;
    levelName: string;
    fullName: string;
  };
  // Academic History
  lastSchoolAttended?: string;
  // Parent Information
  parentName: string;
  parentRelationship: string;
  parentEmail: string;
  parentPhone: string;
  parentOccupation?: string;
  parentAddress?: string;
  // File paths
  profileImagePath?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

const ApplicantsList = () => {
  const params = useParams();
  const schoolId = params.school as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingApplication, setProcessingApplication] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Fetch school settings
  const fetchSchoolSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}`);
      const data = await response.json();
      if (response.ok) {
        setIsAdmissionsOpen(data.isAdmissionsOpen);
      }
    } catch (error) {
      console.error("Failed to fetch school settings:", error);
    }
  }, [schoolId]);

  // Toggle admissions
  const handleToggleAdmissions = async () => {
    try {
      setUpdatingSettings(true);
      const newStatus = !isAdmissionsOpen;
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmissionsOpen: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmissionsOpen(newStatus);
        toast.success(newStatus ? "Admissions opened" : "Admissions closed");
      } else {
        toast.error(data.error || "Failed to update admissions status");
      }
    } catch (error) {
      toast.error("Failed to update admissions status");
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/student-applications`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications || []);
      } else {
        toast.error(data.error || 'Failed to fetch applications');
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Fetch application details
  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/student-applications/${applicationId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedApplicant(data.application);
      } else {
        toast.error(data.error || 'Failed to fetch application details');
      }
    } catch (error) {
      toast.error('Failed to fetch application details');
    }
  };

  // Handle Admit / Reject
  const handleStatusUpdate = async (applicationId: string, status: "ADMITTED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) {
      return;
    }

    try {
      setProcessingApplication(applicationId);
      const response = await fetch(`/api/schools/${schoolId}/student-applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedApplicant(null);
        fetchApplications(); // Refresh the list
      } else {
        toast.error(data.error || `Failed to ${status.toLowerCase()} application`);
      }
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} application`);
    } finally {
      setProcessingApplication(null);
    }
  };

  // Generate PDF for application
  const generatePdf = async (application: ApplicationDetails) => {
    try {
      setGeneratingPdf(application.id);

      const schoolInfo = {
        name: "Your School Name", // You can make this dynamic based on school data
        address: "School Address",
        phone: "School Phone",
        email: "School Email"
      };

      const pdfData = {
        ...application,
        level: application.class.levelName,
        classId: application.class.id,
        className: application.class.name,
      };

      await generateApplicationPdf(pdfData as any, application.applicationNumber, schoolInfo);
      toast.success('PDF generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(null);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchSchoolSettings();
  }, [fetchApplications, fetchSchoolSettings]);

  // Filter Applications
  const filteredApplications = applications.filter((application) =>
    application.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${application.firstName} ${application.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-bg dark:bg-surface rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">Admission Applicants</h2>

        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg border border-border">
          <span className="text-sm font-medium text-foreground">
            Admissions: {isAdmissionsOpen ? 'Open' : 'Closed'}
          </span>
          <button
            onClick={handleToggleAdmissions}
            disabled={updatingSettings}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${isAdmissionsOpen ? 'bg-primary' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdmissionsOpen ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Application Number, Name, or Email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full bg-surface dark:bg-bg text-foreground"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Loading applications...</div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted dark:bg-muted/30">
              <tr>
                {["Applicant", "Application #", "Email", "Phone", "Class", "Status", "Actions"].map((h) => (
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
              {filteredApplications.map((application, i) => (
                <tr
                  key={application.id}
                  className={`${i % 2 === 0 ? "bg-bg dark:bg-surface" : "bg-surface dark:bg-bg"
                    } hover:bg-muted/50`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {application.firstName} {application.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Applied: {new Date(application.applicationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {application.applicationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {application.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {application.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {application.class.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${application.status === 'ADMITTED'
                      ? 'bg-green-100 text-green-800'
                      : application.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => fetchApplicationDetails(application.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <EyeIcon className="h-5 w-5 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => generatePdf(application as any)}
                        disabled={generatingPdf === application.id}
                        className="text-blue-600 hover:text-blue-900 flex items-center disabled:opacity-50"
                        title="Generate PDF"
                      >
                        {generatingPdf === application.id ? (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                        ) : (
                          <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                        )}
                        PDF
                      </button>
                      {application.status === 'PROGRESS' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(application.id, "ADMITTED")}
                            disabled={processingApplication === application.id}
                            className="text-green-600 hover:text-green-900 flex items-center disabled:opacity-50"
                          >
                            {processingApplication === application.id ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            ) : (
                              <CheckIcon className="h-5 w-5 mr-1" />
                            )}
                            Admit
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, "REJECTED")}
                            disabled={processingApplication === application.id}
                            className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                          >
                            <XMarkIcon className="h-5 w-5 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg dark:bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">
                Application Details - {selectedApplicant.firstName} {selectedApplicant.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Application #: {selectedApplicant.applicationNumber} | Status:
                <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${selectedApplicant.status === 'ADMITTED'
                  ? 'bg-green-100 text-green-800'
                  : selectedApplicant.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {selectedApplicant.status}
                </span>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-foreground">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-foreground">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-foreground">{new Date(selectedApplicant.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-foreground">{selectedApplicant.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Religion</label>
                    <p className="text-foreground">{selectedApplicant.religion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{selectedApplicant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{selectedApplicant.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-foreground">{selectedApplicant.address}, {selectedApplicant.state}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-foreground">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Applied Class</label>
                    <p className="text-foreground">{selectedApplicant.class.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                    <p className="text-foreground">{new Date(selectedApplicant.applicationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Academic History */}
              {selectedApplicant.lastSchoolAttended && (
                <div>
                  <h4 className="text-md font-semibold mb-3 text-foreground">Academic History</h4>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground">Last School Attended</label>
                    <p className="text-foreground">{selectedApplicant.lastSchoolAttended}</p>
                  </div>
                </div>
              )}

              {/* Parent Information */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-foreground">Parent/Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground">{selectedApplicant.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                    <p className="text-foreground">{selectedApplicant.parentRelationship}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{selectedApplicant.parentEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{selectedApplicant.parentPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                    <p className="text-foreground">{selectedApplicant.parentOccupation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-foreground">{selectedApplicant.parentAddress || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-foreground">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplicant.profileImagePath && (
                    <DocumentCard title="Student Photo" path={selectedApplicant.profileImagePath} />
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => generatePdf(selectedApplicant)}
                  disabled={generatingPdf === selectedApplicant.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {generatingPdf === selectedApplicant.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  )}
                  Generate PDF
                </button>
                {selectedApplicant.status === 'PROGRESS' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplicant.id, "ADMITTED")}
                      disabled={processingApplication === selectedApplicant.id}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      {processingApplication === selectedApplicant.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                      )}
                      Admit Student
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplicant.id, "REJECTED")}
                      disabled={processingApplication === selectedApplicant.id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Reject Application
                    </button>
                  </>
                )}
              </div>
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

const DocumentCard = ({ title, path }: { title: string; path?: string }) => {
  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/30">
      <div className="flex items-center mb-2">
        <DocumentTextIcon className="h-6 w-6 text-muted-foreground mr-2" />
        <h4 className="font-medium text-foreground">{title}</h4>
      </div>
      {path ? (
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-800 block truncate"
        >
          View Document
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">No document uploaded</span>
      )}
    </div>
  );
};

export default ApplicantsList;
