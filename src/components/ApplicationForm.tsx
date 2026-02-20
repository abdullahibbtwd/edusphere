"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import generateApplicationPdf from "./ApplicationPdfGenerator";
import { uploadImage } from "@/lib/cloudinary";

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
  religion: string;
  image: File | null;
  
  // Previous Education
  primarySchoolName: string;
  primarySchoolStartDate: string;
  primarySchoolEndDate: string;
  primarySchoolGrade: string;
  primarySchoolCertificate: File | null;
  primarySchoolTestimonial: File | null;
  
  juniorSecondarySchoolName: string;
  juniorSecondarySchoolStartDate: string;
  juniorSecondarySchoolEndDate: string;
  juniorSecondarySchoolGrade: string;
  juniorSecondarySchoolCertificate: File | null;
  juniorSecondarySchoolTestimonial: File | null;
  
  // Class Selection
  level: string;
  classId: string;
  className: string;
  
  // Parent/Guardian Information
  parentName: string;
  parentRelationship: string;
  parentEmail: string;
  parentPhone: string;
  parentOccupation: string;
  parentAddress: string;
  parentIdCard: File | null;
  
  // Identification Documents
  indigeneCertificate: File | null;
  nationalIdCard: File | null;
  
  agreeTerms: boolean;
}

type Level = { id: string; name: string };
type SchoolClass = { id: string; name: string; levelId: string };

const steps = [
  "Personal Information",
  "Previous Education",
  "Class Selection",
  "Parent/Guardian Details",
  "Upload Documents",
  "Review & Submit",
];

export default function ApplicationForm() {
  const params = useParams();
  const schoolId = params.school as string;
  
  const [activeStep, setActiveStep] = useState(0);
  const [levels, setLevels] = useState<Level[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    lga: "",
    religion: "",
    image: null,
    
    primarySchoolName: "",
    primarySchoolStartDate: "",
    primarySchoolEndDate: "",
    primarySchoolGrade: "",
    primarySchoolCertificate: null,
    primarySchoolTestimonial: null,
    
    juniorSecondarySchoolName: "",
    juniorSecondarySchoolStartDate: "",
    juniorSecondarySchoolEndDate: "",
    juniorSecondarySchoolGrade: "",
    juniorSecondarySchoolCertificate: null,
    juniorSecondarySchoolTestimonial: null,
    
    level: "",
    classId: "",
    className: "",
    
    parentName: "",
    parentRelationship: "",
    parentEmail: "",
    parentPhone: "",
    parentOccupation: "",
    parentAddress: "",
    parentIdCard: null,
    
    indigeneCertificate: null,
    nationalIdCard: null,
    
    agreeTerms: false,
  });
  
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch levels and classes from database
  useEffect(() => {
    const fetchLevelsAndClasses = async () => {
      try {
        setLoadingLevels(true);
        
        // Fetch levels
        const levelsResponse = await fetch(`/api/schools/${schoolId}/levels`);
        const levelsData = await levelsResponse.json();
        
        if (levelsResponse.ok) {
          setLevels(levelsData.levels || []);
        } else {
          console.error('Failed to fetch levels:', levelsData.error);
        }
        
        // Fetch classes
        const classesResponse = await fetch(`/api/schools/${schoolId}/classes`);
        const classesData = await classesResponse.json();
        
        if (classesResponse.ok) {
          setSchoolClasses(classesData.classes || []);
        } else {
          console.error('Failed to fetch classes:', classesData.error);
        }
        
      } catch (error) {
        console.error('Error fetching levels and classes:', error);
      } finally {
        setLoadingLevels(false);
      }
    };

    if (schoolId) {
      fetchLevelsAndClasses();
    }
  }, [schoolId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      
      // Reset class selection when level changes
      if (name === "level") {
        newData.classId = "";
        newData.className = "";
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (activeStep === 0) {
      if (!formData.firstName) newErrors.firstName = true;
      if (!formData.lastName) newErrors.lastName = true;
      if (!formData.email) newErrors.email = true;
      if (!formData.dob) newErrors.dob = true;
      if (!formData.gender) newErrors.gender = true;
    }
    
    if (activeStep === 2) {
      if (!formData.level) newErrors.level = true;
      if (!formData.classId) newErrors.classId = true;
    }
    
    if (activeStep === 3) {
      if (!formData.parentName) newErrors.parentName = true;
      if (!formData.parentRelationship) newErrors.parentRelationship = true;
      if (!formData.parentEmail) newErrors.parentEmail = true;
      if (!formData.parentPhone) newErrors.parentPhone = true;
    }
    
    if (activeStep === 5 && !formData.agreeTerms) {
      newErrors.agreeTerms = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
        setErrors((prev) => ({ ...prev, agreeTerms: true }));
        return;
    }

    setLoading(true);

    try {
        const dataToSubmit = { ...formData };

        // Define all file fields
        const fileFields: (keyof FormData)[] = [
            'image',
            'primarySchoolCertificate',
            'primarySchoolTestimonial',
            'juniorSecondarySchoolCertificate',
            'juniorSecondarySchoolTestimonial',
            'parentIdCard',
            'indigeneCertificate',
            'nationalIdCard'
        ];

        // Create a list of promises for each file upload
        const uploadPromises = fileFields.map(async (field) => {
            const file = formData[field];
            if (file instanceof File) {
                try {
                    // Create a new FormData object for the file
                    const fileFormData = new FormData();
                    fileFormData.append('file', file);
                    
                    // Call the new API route to handle the upload
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: fileFormData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to upload ${field}`);
                    }

                    const result = await response.json();
                    
                    // Replace the File object with the returned URL
                    (dataToSubmit as any)[field] = result.url;
                } catch (uploadError) {
                    console.error(`Error uploading ${field}:`, uploadError);
                    throw new Error(`Failed to upload ${field}`);
                }
            } else {
                (dataToSubmit as any)[field] = null;
            }
        });

        // Wait for all uploads to finish
        await Promise.all(uploadPromises);

        // Submit the form data with Cloudinary URLs to your main API
        const response = await fetch(`/api/schools/${schoolId}/student-applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...dataToSubmit,
                schoolId: schoolId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit application');
        }

        // Generate PDF after successful submission
        try {
            const schoolInfo = {
                name: "Your School Name",
                address: "School Address",
                phone: "School Phone",
                email: "School Email"
            };
            await generateApplicationPdf(dataToSubmit, data.applicationNumber, schoolInfo);
            alert(`✅ Application submitted successfully! Your application number is: ${data.applicationNumber}\n📄 Application PDF has been downloaded.`);
        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            alert(`✅ Application submitted successfully! Your application number is: ${data.applicationNumber}\n⚠️ PDF generation failed, but your application was saved.`);
        }

        // Reset form or redirect
        setFormData({
            firstName: "",
            lastName: "",
            dob: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            lga: "",
            religion: "",
            image: null,
            primarySchoolName: "",
            primarySchoolStartDate: "",
            primarySchoolEndDate: "",
            primarySchoolGrade: "",
            primarySchoolCertificate: null,
            primarySchoolTestimonial: null,
            juniorSecondarySchoolName: "",
            juniorSecondarySchoolStartDate: "",
            juniorSecondarySchoolEndDate: "",
            juniorSecondarySchoolGrade: "",
            juniorSecondarySchoolCertificate: null,
            juniorSecondarySchoolTestimonial: null,
            level: "",
            classId: "",
            className: "",
            parentName: "",
            parentRelationship: "",
            parentEmail: "",
            parentPhone: "",
            parentOccupation: "",
            parentAddress: "",
            parentIdCard: null,
            indigeneCertificate: null,
            nationalIdCard: null,
            agreeTerms: false,
        });
        setActiveStep(0);
        setImagePreview(null);

    } catch (error) {
        console.error('Error submitting application:', error);
        alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to submit application'}`);
    } finally {
        setLoading(false);
    }
};


  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 mb-2">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="">No Image</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Upload Photo
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Other Name</label>
                <input
                  type="text"
                  name="otherName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LGA</label>
                <input
                  type="text"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Religion</label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select religion</option>
                <option value="christianity">Christianity</option>
                <option value="islam">Islam</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-medium">Primary School Information (Optional)</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Primary School Name</label>
              <input
                type="text"
                name="primarySchoolName"
                value={formData.primarySchoolName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="primarySchoolStartDate"
                  value={formData.primarySchoolStartDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="primarySchoolEndDate"
                  value={formData.primarySchoolEndDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Final Grade</label>
              <input
                type="text"
                name="primarySchoolGrade"
                value={formData.primarySchoolGrade}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., A-"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary School Certificate</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'primarySchoolCertificate')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary School Testimonial</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'primarySchoolTestimonial')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div className="border-b pb-2 mt-8">
              <h3 className="text-lg font-medium">Junior Secondary School Information (Optional)</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Junior Secondary School Name</label>
              <input
                type="text"
                name="juniorSecondarySchoolName"
                value={formData.juniorSecondarySchoolName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="juniorSecondarySchoolStartDate"
                  value={formData.juniorSecondarySchoolStartDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="juniorSecondarySchoolEndDate"
                  value={formData.juniorSecondarySchoolEndDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Final Grade</label>
              <input
                type="text"
                name="juniorSecondarySchoolGrade"
                value={formData.juniorSecondarySchoolGrade}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., B+"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">JSS Certificate</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'juniorSecondarySchoolCertificate')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">JSS Testimonial</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'juniorSecondarySchoolTestimonial')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Level *</label>
              {loadingLevels ? (
                <div className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100">
                  Loading levels...
                </div>
              ) : (
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.level ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select level</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {formData.level && (
              <div>
                <label className="block text-sm font-medium mb-1">Class *</label>
                {loadingLevels ? (
                  <div className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100">
                    Loading classes...
                  </div>
                ) : (
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      const selected = schoolClasses.find(
                        (c) => c.id === classId
                      );
                      setFormData((prev) => ({
                        ...prev,
                        classId,
                        className: selected?.name || "",
                      }));
                    }}
                    className={`w-full p-2 border rounded-lg ${
                      errors.classId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select class</option>
                    {schoolClasses
                      .filter((c) => c.levelId === formData.level)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Parent/Guardian Name *</label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.parentName ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Relationship *</label>
              <select
                name="parentRelationship"
                value={formData.parentRelationship}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.parentRelationship ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select relationship</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.parentEmail ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.parentPhone ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Occupation</label>
              <input
                type="text"
                name="parentOccupation"
                value={formData.parentOccupation}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="parentAddress"
                value={formData.parentAddress}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Parent/Guardian ID Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'parentIdCard')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-medium">Identification Documents</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Indigene Certificate</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'indigeneCertificate')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">National ID Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'nationalIdCard')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Review Application</h2>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Name:</p>
                  <p>{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="font-medium">Date of Birth:</p>
                  <p>{formData.dob}</p>
                </div>
                <div>
                  <p className="font-medium">Gender:</p>
                  <p>{formData.gender}</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{formData.email}</p>
                </div>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p>{formData.phone}</p>
                </div>
                <div>
                  <p className="font-medium">Religion:</p>
                  <p>{formData.religion}</p>
                </div>
              </div>
            </div>
            
            {(formData.primarySchoolName || formData.juniorSecondarySchoolName) && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2">Previous Education</h3>
                {formData.primarySchoolName && (
                  <div className="mb-4">
                    <h4 className="font-medium">Primary School:</h4>
                    <p>{formData.primarySchoolName}</p>
                    <p>{formData.primarySchoolStartDate} to {formData.primarySchoolEndDate}</p>
                    <p>Final Grade: {formData.primarySchoolGrade}</p>
                  </div>
                )}
                {formData.juniorSecondarySchoolName && (
                  <div>
                    <h4 className="font-medium">Junior Secondary School:</h4>
                    <p>{formData.juniorSecondarySchoolName}</p>
                    <p>{formData.juniorSecondarySchoolStartDate} to {formData.juniorSecondarySchoolEndDate}</p>
                    <p>Final Grade: {formData.juniorSecondarySchoolGrade}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-2">Class Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Level:</p>
                  <p>{levels.find((lvl) => lvl.id === formData.level)?.name || formData.level}</p>
                </div>
                <div>
                  <p className="font-medium">Class:</p>
                  <p>{formData.className || schoolClasses.find((c) => c.id === formData.classId)?.name || formData.classId}</p>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-2">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Name:</p>
                  <p>{formData.parentName}</p>
                </div>
                <div>
                  <p className="font-medium">Relationship:</p>
                  <p>{formData.parentRelationship}</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{formData.parentEmail}</p>
                </div>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p>{formData.parentPhone}</p>
                </div>
                <div>
                  <p className="font-medium">Occupation:</p>
                  <p>{formData.parentOccupation}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span>I agree that all information provided is correct and complete. I understand that providing false information may lead to disqualification of this application.</span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-sm mt-1">You must agree before submitting</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">
        (School Name) Application Form
      </h1>

      {/* Stepper */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-surface -z-10"></div>
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                i <= activeStep 
                  ? "bg-primary border-primary-400 text-white" 
                  : "bg-bg text-text"
              }`}
            >
              {i + 1}
            </div>
            <p className={`text-xs mt-2 text-center max-w-24 ${i <= activeStep ? "text-primary font-medium" : "text-text"}`}>
              {step}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStepContent()}

        <div className="flex justify-between pt-6">
          {activeStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 bg-gray-300 text-text rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors ml-auto"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
}