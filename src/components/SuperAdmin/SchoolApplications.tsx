"use client"

import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SchoolApplication {
  id: string;
  schoolName: string;
  subdomain: string;
  state: string;
  lga: string;
  address: string;
  principalName: string;
  schoolEmail: string;
  officialPhone: string;
  schoolType: string;
  educationLevel: string;
  establishmentYear: string;
  rcNumber?: string | null;
  nemisId?: string | null;
  stateApprovalNumber?: string | null;
  waecNecoNumber?: string | null;
  totalStudents?: number;
  totalTeachers?: number;
  facilities: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const SchoolApplications = () => {
  const [applications, setApplications] = useState<SchoolApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<SchoolApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
        search: searchTerm
      });

      // Use admin endpoint that returns decrypted data
      const response = await fetch(`/api/admin/school-applications?${params}`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/school-application/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reviewedBy: 'admin-user-id' // This should come from auth context
        }),
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--text)]">School Applications</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)] opacity-50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by school name, principal, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-[var(--surface)] rounded-lg shadow-lg overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--bg)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  School
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-[var(--bg)] transition-colors">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[var(--text)]">
                        {application.schoolName}
                      </div>
                      <div className="text-xs text-[var(--primary)]">
                        {application.subdomain}.edusphere.com
                      </div>
                      <div className="text-xs text-[var(--text)] opacity-70">
                        {application.schoolType} • {application.educationLevel.replace('_', ' ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-[var(--text)]">
                      {application.state}
                    </div>
                    <div className="text-xs text-[var(--text)] opacity-70">
                      {application.lga}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-[var(--text)]">
                      {application.principalName}
                    </div>
                    <div className="text-xs text-[var(--text)] opacity-70">
                      {application.schoolEmail}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status}</span>
                      </span>
                      <div className="text-xs text-[var(--text)] opacity-70">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-1.5 text-[var(--primary)] hover:bg-[var(--bg)] rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {application.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'APPROVED')}
                            className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="bg-[var(--surface)] rounded-lg shadow-lg p-4 border border-[var(--border)]">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--text)]">{application.schoolName}</h3>
                  <p className="text-sm text-[var(--primary)]">{application.subdomain}.edusphere.com</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span className="ml-1">{application.status}</span>
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text)] opacity-70">Type:</span>
                  <span className="text-[var(--text)]">{application.schoolType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text)] opacity-70">Location:</span>
                  <span className="text-[var(--text)]">{application.state}, {application.lga}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text)] opacity-70">Principal:</span>
                  <span className="text-[var(--text)]">{application.principalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text)] opacity-70">Submitted:</span>
                  <span className="text-[var(--text)]">{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => setSelectedApplication(application)}
                  className="flex-1 px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  View Details
                </button>
                {application.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'APPROVED')}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-md hover:bg-[var(--bg)] disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-md hover:bg-[var(--bg)] disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border)]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text)]">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-[var(--text)] opacity-70 hover:opacity-100 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* School Information */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">School Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[var(--text)] opacity-70">Name</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.schoolName}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Subdomain</p>
                      <p className="font-medium text-[var(--primary)]">{selectedApplication.subdomain}.edusphere.com</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">State</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.state}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">LGA</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.lga}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[var(--text)] opacity-70">Address</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.address}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Type</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.schoolType}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Education Level</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.educationLevel.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Established</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.establishmentYear}</p>
                    </div>
                  </div>
                </div>

                {/* Identification Numbers */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">Identification Numbers (Decrypted)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[var(--text)] opacity-70">RC Number</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.rcNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">NEMIS ID</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.nemisId || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">State Approval Number</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.stateApprovalNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">WAEC/NECO Number</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.waecNecoNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[var(--text)] opacity-70">Principal Name</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.principalName}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">School Email</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.schoolEmail}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Official Phone</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.officialPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">School Statistics</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[var(--text)] opacity-70">Students</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.totalStudents || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Teachers</p>
                      <p className="font-medium text-[var(--text)]">{selectedApplication.totalTeachers || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                {selectedApplication.facilities.length > 0 && (
                  <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">Facilities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {selectedApplication.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          <span className="text-[var(--text)]">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Status */}
                <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">Application Status</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="ml-2">{selectedApplication.status}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-[var(--text)] opacity-70">Submitted</p>
                      <p className="font-medium text-[var(--text)]">{new Date(selectedApplication.submittedAt).toLocaleString()}</p>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div>
                        <p className="text-[var(--text)] opacity-70">Reviewed</p>
                        <p className="font-medium text-[var(--text)]">{new Date(selectedApplication.reviewedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'PENDING' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'APPROVED')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolApplications;
