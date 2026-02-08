// layouts/DashboardLayout.tsx
import Sidebar from "../../components/dashboardcomponents/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // ✅ Flex layout — sidebar spacer + main lado a lado, estável desde frame 1
    <div className="min-h-screen bg-[var(--color-background)] flex">

      {/* Sidebar inclui: botão mobile, aside fixed, spacer div */}
      <Sidebar />

      {/* Main Content — flex-1 preenche o espaço restante */}
      <main
        className="relative isolate min-h-screen flex-1 px-4 lg:px-6 xl:px-8 overflow-hidden"
        style={{
          paddingTop: 'clamp(1.5rem, 5vw, 5rem)',
          paddingBottom: 'clamp(1.5rem, 2vw, 2rem)',
        }}
      >
        <div className="relative max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;