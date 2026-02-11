// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/UserContext";

// ✅ Layouts (NOVOS)
import DashboardLayout from "./pages/dashboardpages/DashboardLayout";
import { ProtectedLayout } from "./components/layouts/ProtectedLayout";
import { LinksLayout } from "./components/layouts/LinksLayout";

// Páginas de autenticação
import Login from "./pages/authpages/Login";
import Register from "./pages/authpages/Register";
import EmailValidation from "./pages/authpages/EmailValidation";

// Páginas públicas
import PrincingSection from "./pages/homepages/PrincingSection";
import RankingPage from "./pages/homepages/RankingPage";
import Home from "./pages/homepages/Home";

// Páginas do Dashboard
import DashboardSettings from "./pages/dashboardpages/DashboardSettings";
import DashboardLogs from "./pages/dashboardpages/DashboardLogs";
import DashboardLinks from "./pages/dashboardpages/DashboardLinks";
import DashboardSocial from "./pages/dashboardpages/DashboardSocial";
import DashboardCustomization from "./pages/dashboardpages/DashboardCustomization";
import DashboardInventory from "./pages/dashboardpages/DashboardInventory";
import DashboardTags from "./pages/dashboardpages/DashboardTags";
import DashboardAssets from "./pages/dashboardpages/DashboardAssets";
import DashboardStart from "./pages/dashboardpages/DashboardStart";
import DashboardStore from "./pages/dashboardpages/DashboardStore";

import TitleManager from "./types/TitleManager";
import { StoreLayout } from "./components/layouts/StoreLayout";
import { InventoryProvider } from "./contexts/InventoryContext";
import DashboardEmbeds from "./pages/dashboardpages/DashboardEmbeds";
import Unauthorized from "./pages/Unauthorized";
import RequiresPremium from "./components/guards/RequirePremium";
import DashboardRoulette from "./pages/dashboardpages/DashboardRoulette";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ProfileProvider>
            <TitleManager />
            <InventoryProvider>
              <Routes>
                {/* ========== ROTAS PÚBLICAS ========== */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/validate-email" element={<EmailValidation />} />
                <Route path="/plans" element={<PrincingSection />} />

                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />


                {/* ========== DASHBOARD - ROTAS ANINHADAS ========== */}
                {/* 
                ✅ ESTRUTURA:
                /dashboard/* → DashboardLayout (MONTA 1x, NUNCA REMONTA)
                  └─ ProtectedLayout (verifica auth)
                      └─ Páginas individuais (só isso muda!)
              */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route element={<ProtectedLayout />}>

                    {/* /dashboard → DashboardStart */}
                    <Route index element={<DashboardStart />} />

                    {/* Rotas SEM LinksProvider */}
                    <Route path="start" element={<DashboardStart />} />
                    <Route path="embeds" element={<RequiresPremium><DashboardEmbeds /></RequiresPremium>} />
                    <Route path="settings" element={<DashboardSettings />} />
                    <Route path="tags" element={<DashboardTags />} />
                    <Route path="logs" element={<DashboardLogs />} />
                    <Route element={<StoreLayout />}>
                      <Route path="store" element={<DashboardStore />} />
                    </Route>                  <Route path="assets" element={<DashboardAssets />} />
                    <Route path="inventory" element={<DashboardInventory />} />
                    <Route path="customization" element={<DashboardCustomization />} />
                    <Route path="roulette" element={<DashboardRoulette />} />

                    {/* Rotas COM LinksProvider */}
                    <Route element={<LinksLayout />}>
                      <Route path="links" element={<DashboardLinks />} />
                      <Route path="socialmedia" element={<DashboardSocial />} />
                    </Route>

                  </Route>
                </Route>

                {/* ========== FALLBACK ========== */}
                <Route path="*" element={<Navigate to="/login" replace />} />

                
              </Routes>
            </InventoryProvider>

          </ProfileProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;