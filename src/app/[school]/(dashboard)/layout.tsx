import Sidebar from "@/components/Schools/Admin/Sidebar";
import Navbar from "@/components/SuperAdmin/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    school: string;
  }>;
}
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { school } = await params;
  
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar (sticky full height) */}
      <aside className="hidden md:block w-64 bg-surface text-text shadow-lg sticky top-0 h-screen">
        <Sidebar school={school} />
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
