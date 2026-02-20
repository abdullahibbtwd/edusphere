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
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar (Fixed width) */}
      <aside className="hidden md:block w-64 bg-surface text-text shadow-lg h-full border-r border-gray-200 dark:border-gray-700">
        <Sidebar school={school} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar (Fixed at top of content area) */}
        <header className="z-10 bg-bg/80 backdrop-blur-md sticky top-0">
          <Navbar />
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
