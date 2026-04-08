import SchoolDashboardShell from "@/components/Schools/Admin/SchoolDashboardShell";
import { SchoolDataProvider } from "@/context/SchoolDataContext";
import { getSchoolLandingData, toSchoolDataPayload } from "@/lib/school-landing";
import { notFound } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    school: string;
  }>;
}
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { school } = await params;
  const schoolData = await getSchoolLandingData(school);
  if (!schoolData) {
    notFound();
  }

  return (
    <SchoolDataProvider subdomain={school} initialData={toSchoolDataPayload(schoolData)}>
      <SchoolDashboardShell school={school}>{children}</SchoolDashboardShell>
    </SchoolDataProvider>
  );
}
