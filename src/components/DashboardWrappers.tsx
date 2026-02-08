// components/DashboardWrappers.tsx
import type { ReactNode } from "react";
import { LinksProvider } from "../contexts/LinksContext";
import { ProtectedRoute } from "./ProtectedRoute";
import DashboardLayout from "../pages/dashboardpages/DashboardLayout";

interface Props {
  children: ReactNode;
}

// components/DashboardWrappers.tsx
export const DashboardWithoutLinks = ({ children }: Props) => {
  return (
    // ✅ Layout renderiza SEMPRE — sidebar já ocupa 280px desde o início
    <DashboardLayout>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </DashboardLayout>
  );
};

export const DashboardWithLinks = ({ children }: Props) => {
  return (
    <DashboardLayout>
      <ProtectedRoute>
        <LinksProvider>
          {children}
        </LinksProvider>
      </ProtectedRoute>
    </DashboardLayout>
  );
};