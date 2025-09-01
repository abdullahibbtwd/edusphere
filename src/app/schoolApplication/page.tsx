"use client"

import { useState } from 'react';
import { useTheme } from "next-themes";

const SchoolApplicationForm = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Form state
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    pmbNumber: '',
    rcNumber: '',
    schoolType: '',
    principalName: '',
    phoneNumber: '',
    email: '',
    website: '',
    establishmentYear: '',
    ownershipType: '',
    curriculum: '',
    totalStudents: '',
    totalTeachers: '',
    facilities: [] as string[],
    accreditation: '',
    additionalInfo: ''
  });

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
          submittedBy: 'temp-user-id', // This should come from auth context
          schoolType: formData.schoolType.toUpperCase().replace(' ', '_'),
          ownershipType: formData.ownershipType.toUpperCase(),
          curriculum: formData.curriculum.toUpperCase()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage("Application submitted successfully! We will review your application and get back to you soon.");
        // Reset form
        setFormData({
          schoolName: '',
          address: '',
          pmbNumber: '',
          rcNumber: '',
          schoolType: '',
          principalName: '',
          phoneNumber: '',
          email: '',
          website: '',
          establishmentYear: '',
          ownershipType: '',
          curriculum: '',
          totalStudents: '',
          totalTeachers: '',
          facilities: [],
          accreditation: '',
          additionalInfo: ''
        });
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

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--surface)] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--primary)] p-6 text-white">
          <h1 className="text-2xl font-bold">School Application Form</h1>
          <p className="opacity-90">Please provide accurate information about your school</p>
        </div>

        {/* Progress indicator */}
        {/* <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {['School Details', 'Contact Info', 'Additional Info'].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-bg text-[var(--text)]'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-[var(--text)]">{step}</span>
                {index < 2 && <div className="w-16 h-1 bg-bg mx-4"></div>}
              </div>
            ))}
          </div>
        </div> */}

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
              <label htmlFor="address" className="block text-sm font-medium text-[var(--text)] mb-2">
                School Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Full school address"
                required
              />
            </div>

            <div>
              <label htmlFor="pmbNumber" className="block text-sm font-medium text-[var(--text)] mb-2">
                PMB Number
              </label>
              <input
                id="pmbNumber"
                name="pmbNumber"
                type="text"
                value={formData.pmbNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="PMB number if available"
              />
            </div>

            <div>
              <label htmlFor="rcNumber" className="block text-sm font-medium text-[var(--text)] mb-2">
                RC Number
              </label>
              <input
                id="rcNumber"
                name="rcNumber"
                type="text"
                value={formData.rcNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Registration number"
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
                <option value="International">International School</option>
                <option value="Faith-based">Faith-based School</option>
              </select>
            </div>

            <div>
              <label htmlFor="ownershipType" className="block text-sm font-medium text-[var(--text)] mb-2">
                Ownership Type *
              </label>
              <select
                id="ownershipType"
                name="ownershipType"
                value={formData.ownershipType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                <option value="">Select ownership type</option>
                <option value="Government">Government Owned</option>
                <option value="Private">Privately Owned</option>
                <option value="Religious">Religious Organization</option>
                <option value="Community">Community Owned</option>
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
              <label htmlFor="curriculum" className="block text-sm font-medium text-[var(--text)] mb-2">
                Curriculum *
              </label>
              <select
                id="curriculum"
                name="curriculum"
                value={formData.curriculum}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                <option value="">Select curriculum</option>
                <option value="National">National Curriculum</option>
                <option value="British">British Curriculum</option>
                <option value="American">American Curriculum</option>
                <option value="IB">International Baccalaureate</option>
                <option value="Montessori">Montessori</option>
                <option value="Other">Other</option>
              </select>
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
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-[var(--text)] mb-2">
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="School phone number"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="School email address"
                required
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[var(--text)] mb-2">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="https://example.com"
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
            <div className={`mt-4 p-4 rounded-lg ${
              submitMessage.includes('successfully') 
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
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-opacity ${
                isSubmitting 
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