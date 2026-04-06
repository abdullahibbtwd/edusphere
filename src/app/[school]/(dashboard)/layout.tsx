import SchoolDashboardShell from "@/components/Schools/Admin/SchoolDashboardShell";
import { SchoolDataProvider } from "@/context/SchoolDataContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    school: string;
  }>;
}
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { school } = await params;

  return (
    <SchoolDataProvider subdomain={school}>
      <SchoolDashboardShell school={school}>{children}</SchoolDashboardShell>
    </SchoolDataProvider>
  );
}
