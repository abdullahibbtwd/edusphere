"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import generateApplicationPdf from "./ApplicationPdfGenerator";
import { uploadImage } from "@/lib/cloudinary";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

interface FormData {
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
  image: File | null;

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
  parentOccupation: string;
  parentAddress: string;

  agreeTerms: boolean;
}

type Level = { id: string; name: string };
type SchoolClass = { id: string; name: string; levelId: string };

const steps = [
  "Identity",
  "Contact & Details",
  "Academic",
  "Review & Submit",
];

export default function ApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const params = useParams();
  const schoolId = params.school as string;
  const { user } = useUser();

  const [activeStep, setActiveStep] = useState(0);
  const [levels, setLevels] = useState<Level[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [dynamicSchoolName, setDynamicSchoolName] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    lga: "",
    religion: "",
    image: null,

    lastSchoolAttended: "",
    level: "",
    classId: "",
    className: "",

    parentName: "",
    parentRelationship: "",
    parentEmail: "",
    parentPhone: "",
    parentOccupation: "",
    parentAddress: "",

    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate form data from user context
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Fetch levels, classes, and school info from database
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingLevels(true);

        // Fetch school details
        const schoolResponse = await fetch(`/api/schools/by-subdomain/${schoolId}`);
        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          setDynamicSchoolName(schoolData.name || "");
        }

        // Fetch levels
        const levelsResponse = await fetch(`/api/schools/${schoolId}/levels?limit=100`);
        const levelsData = await levelsResponse.json();

        if (levelsResponse.ok) {
          setLevels(levelsData.levels || []);
        } else {
          console.error('Failed to fetch levels:', levelsData.error);
        }

        // Fetch classes
        const classesResponse = await fetch(`/api/schools/${schoolId}/classes?limit=100`);
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

    fetchInitialData();
  }, [schoolId, user]);

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
      if (!formData.image) newErrors.image = true;
    }

    if (activeStep === 1) {
      if (!formData.parentName) newErrors.parentName = true;
      if (!formData.parentPhone) newErrors.parentPhone = true;
    }

    if (activeStep === 2) {
      if (!formData.level) newErrors.level = true;
      if (!formData.classId) newErrors.classId = true;
    }

    if (activeStep === 3 && !formData.agreeTerms) {
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

      const fileFields: (keyof FormData)[] = [
        'image'
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
            (dataToSubmit as any)[field] = result.imageUrl;
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
          userId: user?.userId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Generate PDF after successful submission
      try {
        const schoolInfo = {
          name: dynamicSchoolName || "Your School Name",
          address: "School Address",
          phone: "School Phone",
          email: "School Email"
        };

        // Find level name for PDF
        const selectedLevel = levels.find((l) => l.id === formData.level);
        const dataForPdf = {
          ...dataToSubmit,
          level: selectedLevel ? selectedLevel.name : (dataToSubmit as any).level,
          profileImagePath: (dataToSubmit as any).image // Use the uploaded URL
        } as any;

        await generateApplicationPdf(dataForPdf, data.application.applicationNumber, schoolInfo);
        toast.success(`Application submitted successfully! Your application number is: ${data.application.applicationNumber}`);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        toast.warning(`Application submitted successfully! Application Number: ${data.application.applicationNumber}. (PDF generation failed)`);
      }

      setFormData({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        state: "",
        lga: "",
        religion: "",
        image: null,
        lastSchoolAttended: "",
        level: "",
        classId: "",
        className: "",
        parentName: "",
        parentRelationship: "",
        parentEmail: "",
        parentPhone: "",
        parentOccupation: "",
        parentAddress: "",
        agreeTerms: false,
      });
      setActiveStep(0);
      setImagePreview(null);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };


  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (activeStep) {
              case 0:
                return (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center mb-8 p-6 bg-muted/20 rounded-2xl border border-muted/30">
                      <div className={`relative w-36 h-36 rounded-2xl overflow-hidden border-4 ${errors.image ? 'border-danger' : 'border-primary/20'} mb-4 shadow-xl transition-all duration-300 transform group hover:scale-105`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted/40 flex flex-col items-center justify-center gap-2">
                            <svg className="w-10 h-10 text-text/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider text-center px-4">Student Photo *</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
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
                        className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 text-sm font-bold transition-all shadow-lg shadow-primary/30 active:scale-95"
                      >
                        {imagePreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {errors.image && <p className="text-danger text-xs mt-3 font-bold animate-pulse">Required: Profile photo is mandatory</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-text ${errors.firstName ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                            }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-text ${errors.lastName ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                            }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Date of Birth *</label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-text ${errors.dob ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                            }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Gender *</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-text appearance-none cursor-pointer ${errors.gender ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                            }`}
                        >
                          <option value="" className="bg-surface">Select gender</option>
                          <option value="male" className="bg-surface">Male</option>
                          <option value="female" className="bg-surface">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );

              case 1:
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Student Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full p-4 bg-muted/5 border-2 border-muted/20 rounded-xl text-text/50 cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Student Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+234..."
                          className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-text"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="e.g. Lagos"
                          className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Local Government (LGA) *</label>
                        <input
                          type="text"
                          name="lga"
                          value={formData.lga}
                          onChange={handleChange}
                          className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-text"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Religion *</label>
                        <select
                          name="religion"
                          value={formData.religion}
                          onChange={handleChange}
                          className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none appearance-none cursor-pointer transition-all text-text"
                        >
                          <option value="" className="bg-surface">Select religion</option>
                          <option value="christianity" className="bg-surface">Christianity</option>
                          <option value="islam" className="bg-surface">Islam</option>
                          <option value="other" className="bg-surface">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Residential Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-text"
                      />
                    </div>

                    <div className="mt-10 pt-8 border-t border-muted/30">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-1 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-extrabold text-text tracking-tight uppercase tracking-widest">Parent / Guardian Information</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Parent Name *</label>
                          <input
                            type="text"
                            name="parentName"
                            value={formData.parentName}
                            onChange={handleChange}
                            className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-text ${errors.parentName ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                              }`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Relationship *</label>
                          <select
                            name="parentRelationship"
                            value={formData.parentRelationship}
                            onChange={handleChange}
                            className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none appearance-none cursor-pointer transition-all text-text"
                          >
                            <option value="" className="bg-surface">Select relationship</option>
                            <option value="father" className="bg-surface">Father</option>
                            <option value="mother" className="bg-surface">Mother</option>
                            <option value="guardian" className="bg-surface">Guardian</option>
                            <option value="other" className="bg-surface">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Parent Phone *</label>
                          <input
                            type="tel"
                            name="parentPhone"
                            value={formData.parentPhone}
                            onChange={handleChange}
                            className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-text ${errors.parentPhone ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                              }`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Parent Email</label>
                          <input
                            type="email"
                            name="parentEmail"
                            value={formData.parentEmail}
                            onChange={handleChange}
                            className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );

              case 2:
                return (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Last School Attended *</label>
                      <input
                        type="text"
                        name="lastSchoolAttended"
                        value={formData.lastSchoolAttended}
                        onChange={handleChange}
                        placeholder="Name of your previous school"
                        className="w-full p-4 bg-muted/10 border-2 border-muted/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-text"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Level applying for *</label>
                      {loadingLevels ? (
                        <div className="w-full p-4 bg-muted/5 border-2 border-dashed border-muted/30 rounded-xl animate-pulse text-text/40 font-medium">
                          Fetching academic levels...
                        </div>
                      ) : (
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleChange}
                          className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-text appearance-none cursor-pointer ${errors.level ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                            }`}
                        >
                          <option value="" className="bg-surface">Select level</option>
                          {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.id} className="bg-surface">
                              {lvl.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {formData.level && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-bold uppercase tracking-widest text-text/60 ml-1">Choice of Class *</label>
                        {loadingLevels ? (
                          <div className="w-full p-4 bg-muted/5 border-2 border-dashed border-muted/30 rounded-xl animate-pulse text-text/40 font-medium">
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
                            className={`w-full p-4 bg-muted/10 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-text appearance-none cursor-pointer ${errors.classId ? "border-danger bg-danger/5" : "border-muted/30 focus:border-primary"
                              }`}
                          >
                            <option value="" className="bg-surface">Select class</option>
                            {schoolClasses
                              .filter((c) => c.levelId === formData.level)
                              .map((c) => (
                                <option key={c.id} value={c.id} className="bg-surface">
                                  {c.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </motion.div>
                    )}
                  </div>
                );

              case 3:
                return (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-1 bg-primary rounded-full"></div>
                      <h2 className="text-xl font-extrabold text-text uppercase tracking-widest">Review Application</h2>
                    </div>

                    <div className="bg-muted/10 border-2 border-muted/20 rounded-2xl overflow-hidden backdrop-blur-sm">
                      <div className="p-6 bg-primary/5 flex items-center gap-6 border-b border-muted/20">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Student" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted/40">
                            <svg className="w-10 h-10 text-text/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h3 className="text-2xl font-black text-text tracking-tight">{formData.firstName} {formData.lastName}</h3>
                          <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{formData.gender} • {formData.dob}</p>
                        </div>
                      </div>

                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <section className="space-y-3">
                          <p className="text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Contact Details</p>
                          <div className="space-y-2">
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Email:</span> <span className="text-text">{formData.email}</span></p>
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Phone:</span> <span className="text-text">{formData.phone || 'N/A'}</span></p>
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Location:</span> <span className="text-text">{formData.state}, {formData.lga}</span></p>
                          </div>
                        </section>

                        <section className="space-y-3">
                          <p className="text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Academic Choice</p>
                          <div className="space-y-2">
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Level:</span> <span className="text-text">{levels.find((lvl) => lvl.id === formData.level)?.name}</span></p>
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Class:</span> <span className="text-text">{formData.className}</span></p>
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Prev School:</span> <span className="text-text">{formData.lastSchoolAttended}</span></p>
                          </div>
                        </section>

                        <section className="space-y-3 md:col-span-2">
                          <p className="text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Parent / Guardian</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Name:</span> <span className="text-text">{formData.parentName} ({formData.parentRelationship})</span></p>
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Phone:</span> <span className="text-text">{formData.parentPhone}</span></p>
                            <p className="text-sm font-medium flex justify-between"><span className="text-text/50">Email:</span> <span className="text-text">{formData.parentEmail || 'N/A'}</span></p>
                          </div>
                        </section>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-surface/40 border-2 border-muted/20 rounded-2xl backdrop-blur-sm">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-1">
                          <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            animate={{
                              backgroundColor: formData.agreeTerms ? "var(--primary)" : "var(--surface)",
                              borderColor: formData.agreeTerms ? "var(--primary)" : "var(--muted-foreground)",
                            }}
                            className="w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-colors duration-300"
                          >
                            <AnimatePresence>
                              {formData.agreeTerms && (
                                <motion.svg
                                  initial={{ opacity: 0, pathLength: 0 }}
                                  animate={{ opacity: 1, pathLength: 1 }}
                                  exit={{ opacity: 0, pathLength: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <motion.path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={4}
                                    d="M5 13l4 4L19 7"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                        <span className="text-sm text-text/70 leading-relaxed font-medium group-hover:text-text transition-colors">
                          I certify that the information provided is correct. I understand that false information may lead to disqualification from the admission process.
                        </span>
                      </label>
                      {errors.agreeTerms && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-danger text-xs mt-4 font-black flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-danger rounded-full animate-ping"></span>
                          Please confirm the accuracy of your details.
                        </motion.p>
                      )}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-surface/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 dark:border-white/5 transition-all duration-300">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2 drop-shadow-sm">
          {dynamicSchoolName ? dynamicSchoolName : "School Application"}
        </h1>
        <p className="text-text/60 text-sm md:text-base font-medium">Please fill in the details below to complete your application</p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between mb-12 relative max-w-3xl mx-auto px-4">
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-muted/30 -z-0"></div>
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center relative z-10 w-1/4">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: i <= activeStep ? "var(--primary)" : "var(--surface)",
                borderColor: i <= activeStep ? "var(--primary)" : "var(--muted)",
                scale: i === activeStep ? 1.2 : 1,
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${i <= activeStep ? "text-white shadow-lg shadow-primary/20" : "text-text/40"
                }`}
            >
              {i < activeStep ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="font-bold">{i + 1}</span>
              )}
            </motion.div>
            <p className={`text-[10px] md:text-xs mt-3 text-center font-bold uppercase tracking-widest ${i <= activeStep ? "text-primary" : "text-text/30"}`}>
              {step}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-muted/20">
          {activeStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-8 py-3 bg-muted/20 text-text rounded-xl hover:bg-muted/30 font-bold transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {activeStep === steps.length - 1 ? (
            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="group flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
            >
              Next Step
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}