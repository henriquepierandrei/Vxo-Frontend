// layouts/DashboardLayout.tsx
import Sidebar from "../../components/dashboardcomponents/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <Sidebar />

      {/* Main Content - Ajustado para responsividade */}
      <main className="
        flex-1 
        min-w-0
        w-full
        pt-20 pb-6 px-4
        lg:pt-6 lg:pb-8 lg:px-6 xl:px-8
        overflow-x-hidden
      ">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;