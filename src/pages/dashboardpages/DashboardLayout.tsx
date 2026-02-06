// layouts/DashboardLayout.tsx
import Sidebar from "../../components/dashboardcomponents/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;