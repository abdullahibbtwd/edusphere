
import { SlotManager } from "@/components/Admin/SlotManager";
import { DataTable } from "@/components/Admin/SlotsTable";

export default async function AdminDashboard() {
  // Remove preloadQuery if not needed
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Screening Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Add New Slot</h2>
          <SlotManager />
        </div>
        
        <div className="bg-surface p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Existing Slots</h2>
          <DataTable />
        </div>
      </div>
    </div>
  );
}