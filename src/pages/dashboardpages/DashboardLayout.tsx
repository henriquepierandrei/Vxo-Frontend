// pages/dashboardpages/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/dashboardcomponents/Sidebar";

const DashboardLayout = () => {
  // ❌ REMOVA: { children }: { children: React.ReactNode }
  // ✅ Agora não recebe mais children
  
  console.log("🟢 DashboardLayout montou"); // Debug - remova depois
  
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <Sidebar/>

      <main
        className="relative isolate min-h-screen flex-1 px-4 lg:px-6 xl:px-8 overflow-hidden"
        style={{
          paddingTop: 'clamp(1.5rem, 5vw, 5rem)',
          paddingBottom: 'clamp(1.5rem, 2vw, 2rem)',
        }}
      >
        <div className="relative max-w-[1600px] mx-auto w-full">
          {/* ✅ OUTLET - renderiza a rota filha */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;