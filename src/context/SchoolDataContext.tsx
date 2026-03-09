"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface SchoolContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  schoolLogo?: string;
  description?: string;
  classes?: string[];
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  bannerTitle?: string;
  bannerImage?: string;
  bannerStats?: Array<{ icon: string; text: string }>;
  facilities?: Array<{ name: string; image?: string; imageUrl?: string; description?: string; order?: number }>;
  campusImages?: Array<{ id?: string; title?: string; name?: string; image?: string; imageUrl?: string; description?: string; order?: number }>;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export interface SchoolData {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  isAdmissionsOpen: boolean;
  content?: SchoolContent | null;
  levels?: Array<{ id: string; name: string; classes: Array<{ id: string; name: string }> }>;
  subjects?: Array<{ id: string; name: string }>;
  students?: Array<{ id: string }>;
}

interface SchoolDataContextValue {
  schoolData: SchoolData | null;
  loading: boolean;
}

const SchoolDataContext = createContext<SchoolDataContextValue>({ schoolData: null, loading: true });

export const SchoolDataProvider = ({ subdomain, children }: { subdomain: string; children: React.ReactNode }) => {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subdomain) return;
    fetch(`/api/schools/by-subdomain/${subdomain}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSchoolData(data))
      .catch(() => setSchoolData(null))
      .finally(() => setLoading(false));
  }, [subdomain]);

  return (
    <SchoolDataContext.Provider value={{ schoolData, loading }}>
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => useContext(SchoolDataContext);
