"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SchoolData } from "@/types/school-data";

export type { SchoolContent, SchoolData } from "@/types/school-data";

interface SchoolDataContextValue {
  schoolData: SchoolData | null;
  loading: boolean;
}

const SchoolDataContext = createContext<SchoolDataContextValue>({
  schoolData: null,
  loading: true,
});

export const SchoolDataProvider = ({
  subdomain,
  initialData,
  children,
}: {
  subdomain: string;
  /** When set (including `null`), skips client fetch. Omit to load via `/api/schools/by-subdomain`. */
  initialData?: SchoolData | null;
  children: React.ReactNode;
}) => {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(
    initialData !== undefined ? initialData : null
  );
  const [loading, setLoading] = useState(initialData === undefined);

  useEffect(() => {
    if (initialData !== undefined) return;
    if (!subdomain) return;
    fetch(`/api/schools/by-subdomain/${subdomain}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SchoolData | null) => setSchoolData(data))
      .catch(() => setSchoolData(null))
      .finally(() => setLoading(false));
  }, [subdomain, initialData]);

  return (
    <SchoolDataContext.Provider value={{ schoolData, loading }}>
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => useContext(SchoolDataContext);
