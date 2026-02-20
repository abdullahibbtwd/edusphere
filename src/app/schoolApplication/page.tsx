"use client"

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from "next-themes";
import { getStateNames, getLGAsByState } from '@/data/nigerianStatesLGAs';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const SchoolApplicationForm = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Check if user has existing application
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [canResubmit, setCanResubmit] = useState(false);
  const [maxApplications, setMaxApplications] = useState(3);

  // Check for existing application on mount
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const response = await fetch('/api/school-application/my-application');
        if (response.ok) {
          const data = await response.json();
          if (data.application) {
            setExistingApplication(data.application);
          }
          setTotalApplications(data.totalApplications || 0);
          setCanResubmit(data.canResubmit || false);
          setMaxApplications(data.maxApplications || 3);
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingApplication();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    state: '',
    lga: '',
    address: '',
    schoolType: '',
    educationLevel: '',
    rcNumber: '',
    waecNecoNumber: '',
    nemisId: '',
    stateApprovalNumber: '',
    principalName: '',
    schoolEmail: '',
    officialPhone: '',
    establishmentYear: '',
    totalStudents: '',
    totalTeachers: '',
    facilities: [] as string[],
    accreditation: '',
    additionalInfo: ''
  });

  // Get available LGAs based on selected state
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);

  useEffect(() => {
    if (formData.state) {
      setAvailableLGAs(getLGAsByState(formData.state));
      // Reset LGA when state changes
      setFormData(prev => ({ ...prev, lga: '' }));
    } else {
      setAvailableLGAs([]);
    }
  }, [formData.state]);

  // Subdomain validation state
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: ''
  });

  // Validation state for identification numbers
  const [identificationError, setIdentificationError] = useState('');

  const facilityOptions = [
    "Science Laboratory",
    "Computer Lab",
    "Library",
    "Sports Facilities",
    "Art Room",
    "Music Room",
    "Cafeteria",
    "Auditorium",
    "School Bus",
    "Wi-Fi Connectivity"
  ];

  // Debounced subdomain validation
  const checkSubdomainAvailability = useCallback(async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({
        checking: false,
        available: null,
        message: ''
      });
      return;
    }

    setSubdomainStatus(prev => ({ ...prev, checking: true }));

    try {
      const response = await fetch('/api/check-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubdomainStatus({
          checking: false,
          available: data.available,
          message: data.message || (data.error || '')
        });
      } else {
        setSubdomainStatus({
          checking: false,
          available: false,
          message: data.error || 'Error checking subdomain'
        });
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainStatus({
        checking: false,
        available: false,
        message: 'Error checking subdomain availability'
      });
    }
  }, []);

  // Debounce subdomain checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.subdomain) {
        checkSubdomainAvailability(formData.subdomain);
      }
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [formData.subdomain, checkSubdomainAvailability]);

  // Validate identification numbers
  useEffect(() => {
    if (!formData.nemisId && !formData.stateApprovalNumber) {
      setIdentificationError('At least one identification number (NEMIS ID or State Approval Number) is required');
    } else {
      setIdentificationError('');
    }
  }, [formData.nemisId, formData.stateApprovalNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacilityChange = (facility: string) => {
    setFormData(prev => {
      if (prev.facilities.includes(facility)) {
        return {
          ...prev,
          facilities: prev.facilities.filter(f => f !== facility)
        };
      } else {
        return {
          ...prev,
          facilities: [...prev.facilities, facility]
        };
      }
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if subdomain is available before submitting
    if (subdomainStatus.available !== true) {
      setSubmitMessage('Please ensure your subdomain is available before submitting.');
      return;
    }

    // Check identification requirement
    if (!formData.nemisId && !formData.stateApprovalNumber) {
      setSubmitMessage('Please provide at least one identification number (NEMIS ID or State Approval Number).');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/school-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          schoolType: formData.schoolType.toUpperCase(),
          educationLevel: formData.educationLevel.toUpperCase().replace(' ', '_')
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refetch the application to show status view
        const statusResponse = await fetch('/api/school-application/my-application');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.application) {
            setExistingApplication(statusData.application);
          }
        }
      } else {
        setSubmitMessage(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Loading state
  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  // If user has existing application, show status (unless rejected and can resubmit)
  if (existingApplication && !(existingApplication.status === 'REJECTED' && canResubmit)) {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-8 px-4">
        <div className="max-w-4xl mx-auto bg-[var(--surface)] rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--primary)] p-6 text-white">
            <h1 className="text-2xl font-bold">Your School Application</h1>
            <p className="opacity-90">Application Status</p>
          </div>

          {/* Status content */}
          <div className="p-6 md:p-8">
            {/* Status Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${getStatusColor(existingApplication.status)}`}>
                {getStatusIcon(existingApplication.status)}
                <span className="ml-2 font-semibold text-lg">{existingApplication.status}</span>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center mb-8">
              {existingApplication.status === 'PENDING' && (
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Application Under Review</h2>
                  <p className="text-[var(--text)] opacity-70">
                    Your application is currently being reviewed by our team. We&apos;ll notify you once a decision has been made.
                  </p>
                </div>
              )}
              {existingApplication.status === 'APPROVED' && (
                <div>
                  <h2 className="text-xl font-semibold text-green-600 mb-2">Application Approved!</h2>
                  <p className="text-[var(--text)] opacity-70">
                    Congratulations! Your school application has been approved. You will receive further instructions via email.
                  </p>
                </div>
              )}
              {existingApplication.status === 'REJECTED' && (
                <div>
                  <h2 className="text-xl font-semibold text-red-600 mb-2">Application Not Approved</h2>
                  <p className="text-[var(--text)] opacity-70">
                    Unfortunately, your application was not approved. You have submitted {totalApplications} out of {maxApplications} applications.
                  </p>
                  {totalApplications < maxApplications && (
                    <p className="text-[var(--text)] opacity-70 mt-2">
                      You can submit up to {maxApplications - totalApplications} more application(s).
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Application Details */}
            <div className="bg-[var(--bg)] rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4 border-b border-[var(--border)] pb-2">
                Application Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text)] opacity-70">School Name</p>
                  <p className="font-medium text-[var(--text)]">{existingApplication.schoolName}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)] opacity-70">Subdomain</p>
                  <p className="font-medium text-[var(--primary)]">{existingApplication.subdomain}.edusphere.com</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)] opacity-70">Location</p>
                  <p className="font-medium text-[var(--text)]">{existingApplication.state}, {existingApplication.lga}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)] opacity-70">School Type</p>
                  <p className="font-medium text-[var(--text)]">{existingApplication.schoolType}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)] opacity-70">Education Level</p>
                  <p className="font-medium text-[var(--text)]">{existingApplication.educationLevel.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)] opacity-70">Submitted On</p>
                  <p className="font-medium text-[var(--text)]">
                    {new Date(existingApplication.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {existingApplication.reviewedAt && (
                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text)] opacity-70">Reviewed On</p>
                  <p className="font-medium text-[var(--text)]">
                    {new Date(existingApplication.reviewedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center gap-4">
              {existingApplication.status === 'REJECTED' && canResubmit && (
                <button
                  onClick={() => {
                    setExistingApplication(null);
                    setCanResubmit(false);
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit New Application
                </button>
              )}
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--surface)] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--primary)] p-6 text-white">
          <h1 className="text-2xl font-bold">School Application Form</h1>
          <p className="opacity-90">Please provide accurate information about your school</p>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Details */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4 border-b border-[var(--border)] pb-2">
                School Details
              </h2>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="schoolName" className="block text-sm font-medium text-[var(--text)] mb-2">
                School Name *
              </label>
              <input
                id="schoolName"
                name="schoolName"
                type="text"
                value={formData.schoolName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Enter school name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="subdomain" className="block text-sm font-medium text-[var(--text)] mb-2">
                School Subdomain *
              </label>
              <div className="relative">
                <input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-bg border text-[var(--text)] focus:outline-none focus:ring-2 pr-12 ${subdomainStatus.available === true
                    ? 'border-green-500 focus:ring-green-500'
                    : subdomainStatus.available === false
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[var(--border)] focus:ring-[var(--primary)]'
                    }`}
                  placeholder="your-school-name"
                  required
                  pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
                  title="Only lowercase letters, numbers, and hyphens. Cannot start or end with hyphen."
                />
                {subdomainStatus.checking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--primary)]"></div>
                  </div>
                )}
                {!subdomainStatus.checking && subdomainStatus.available === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!subdomainStatus.checking && subdomainStatus.available === false && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm">
                <span className="text-[var(--text)] opacity-70">
                  This will be your school's URL:
                </span>
                <span className="font-mono text-[var(--primary)]">
                  {formData.subdomain ? `${formData.subdomain}.edusphere.com` : 'your-school-name.edusphere.com'}
                </span>
              </div>
              {subdomainStatus.message && (
                <div className={`mt-2 text-sm ${subdomainStatus.available === true
                  ? 'text-green-600'
                  : subdomainStatus.available === false
                    ? 'text-red-600'
                    : 'text-[var(--text)] opacity-70'
                  }`}>
                  {subdomainStatus.message}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-[var(--text)] mb-2">
                State *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                <option value="">Select state</option>
                {getStateNames().map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lga" className="block text-sm font-medium text-[var(--text)] mb-2">
                Local Government Area *
              </label>
              <select
                id="lga"
                name="lga"
                value={formData.lga}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
                disabled={!formData.state}
              >
                <option value="">Select LGA</option>
                {availableLGAs.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
              {!formData.state && (
                <p className="mt-1 text-xs text-[var(--text)] opacity-60">Please select a state first</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-[var(--text)] mb-2">
                Street Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Street address, building number, etc."
                required
              />
            </div>

            <div>
              <label htmlFor="schoolType" className="block text-sm font-medium text-[var(--text)] mb-2">
                School Type *
              </label>
              <select
                id="schoolType"
                name="schoolType"
                value={formData.schoolType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                <option value="">Select school type</option>
                <option value="Public">Public School</option>
                <option value="Private">Private School</option>
              </select>
            </div>

            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-[var(--text)] mb-2">
                Education Level *
              </label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                <option value="">Select education level</option>
                <option value="Junior Secondary">Junior Secondary</option>
                <option value="Senior Secondary">Senior Secondary</option>
              </select>
            </div>

            <div>
              <label htmlFor="establishmentYear" className="block text-sm font-medium text-[var(--text)] mb-2">
                Year of Establishment *
              </label>
              <input
                id="establishmentYear"
                name="establishmentYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.establishmentYear}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Year"
                required
              />
            </div>

            <div>
              <label htmlFor="rcNumber" className="block text-sm font-medium text-[var(--text)] mb-2">
                RC Number (Optional)
              </label>
              <input
                id="rcNumber"
                name="rcNumber"
                type="text"
                value={formData.rcNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Registration certificate number"
              />
            </div>

            {/* Identification Numbers Section */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-2 border-b border-[var(--border)] pb-2">
                School Identification
              </h2>
              <p className="text-sm text-[var(--text)] opacity-70 mb-4">
                Please provide at least one of the following identification numbers *
              </p>
              {identificationError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {identificationError}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="nemisId" className="block text-sm font-medium text-[var(--text)] mb-2">
                NEMIS School ID
              </label>
              <input
                id="nemisId"
                name="nemisId"
                type="text"
                value={formData.nemisId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Nigeria Education Management Information System ID"
              />
            </div>

            <div>
              <label htmlFor="stateApprovalNumber" className="block text-sm font-medium text-[var(--text)] mb-2">
                State Ministry of Education Approval Number
              </label>
              <input
                id="stateApprovalNumber"
                name="stateApprovalNumber"
                type="text"
                value={formData.stateApprovalNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="State Ministry approval number"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="waecNecoNumber" className="block text-sm font-medium text-[var(--text)] mb-2">
                WAEC/NECO Center Number (Optional)
              </label>
              <input
                id="waecNecoNumber"
                name="waecNecoNumber"
                type="text"
                value={formData.waecNecoNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Examination center number"
              />
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4 border-b border-[var(--border)] pb-2">
                Contact Information
              </h2>
            </div>

            <div>
              <label htmlFor="principalName" className="block text-sm font-medium text-[var(--text)] mb-2">
                Principal&apos;s Name *
              </label>
              <input
                id="principalName"
                name="principalName"
                type="text"
                value={formData.principalName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Principal's full name"
                required
              />
            </div>

            <div>
              <label htmlFor="officialPhone" className="block text-sm font-medium text-[var(--text)] mb-2">
                Official Phone Number *
              </label>
              <input
                id="officialPhone"
                name="officialPhone"
                type="tel"
                value={formData.officialPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="School's official phone number"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="schoolEmail" className="block text-sm font-medium text-[var(--text)] mb-2">
                School Email Address *
              </label>
              <input
                id="schoolEmail"
                name="schoolEmail"
                type="email"
                value={formData.schoolEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="official@school.com"
                required
              />
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4 border-b border-[var(--border)] pb-2">
                Additional Information
              </h2>
            </div>

            <div>
              <label htmlFor="totalStudents" className="block text-sm font-medium text-[var(--text)] mb-2">
                Total Number of Students
              </label>
              <input
                id="totalStudents"
                name="totalStudents"
                type="number"
                min="0"
                value={formData.totalStudents}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Approximate number"
              />
            </div>

            <div>
              <label htmlFor="totalTeachers" className="block text-sm font-medium text-[var(--text)] mb-2">
                Total Number of Teachers
              </label>
              <input
                id="totalTeachers"
                name="totalTeachers"
                type="number"
                min="0"
                value={formData.totalTeachers}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Approximate number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Facilities Available
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facilityOptions.map((facility) => (
                  <label key={facility} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.facilities.includes(facility)}
                      onChange={() => handleFacilityChange(facility)}
                      className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="ml-2 text-sm text-[var(--text)]">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="accreditation" className="block text-sm font-medium text-[var(--text)] mb-2">
                Accreditation
              </label>
              <input
                id="accreditation"
                name="accreditation"
                type="text"
                value={formData.accreditation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="e.g., WAEC, NECO, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-[var(--text)] mb-2">
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={4}
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Any other information you'd like to provide"
              ></textarea>
            </div>
          </div>

          {/* Submit message */}
          {submitMessage && (
            <div className={`mt-4 p-4 rounded-lg ${submitMessage.includes('successfully')
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
              {submitMessage}
            </div>
          )}

          {/* Form actions */}
          <div className="mt-8 flex justify-between">
            <button
              type="submit"
              disabled={isSubmitting || subdomainStatus.available !== true || !!identificationError}
              className={`px-6 py-3 rounded-lg font-medium transition-opacity ${isSubmitting || subdomainStatus.available !== true || !!identificationError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[var(--primary)] hover:opacity-90'
                } text-white`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolApplicationForm;