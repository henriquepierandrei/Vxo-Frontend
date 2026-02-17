import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/UserContext";
import { InventoryProvider } from "./contexts/InventoryContext";

// ==================== LAYOUTS ====================
import DashboardLayout from "./pages/dashboardpages/DashboardLayout";
import { ProtectedLayout } from "./components/layouts/ProtectedLayout";
import { LinksLayout } from "./components/layouts/LinksLayout";
import { StoreLayout } from "./components/layouts/StoreLayout";

// ==================== GUARDS ====================
import RequiresPremium from "./components/guards/RequirePremium";

// ==================== AUTH PAGES ====================
import Login from "./pages/authpages/Login";
import Register from "./pages/authpages/Register";
import EmailValidation from "./pages/authpages/EmailValidation";

// ==================== PUBLIC PAGES ====================
import Home from "./pages/homepages/Home";
import PrincingSection from "./pages/homepages/PrincingSection";
import RankingPage from "./pages/homepages/RankingPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// ==================== DASHBOARD PAGES ====================
import DashboardStart from "./pages/dashboardpages/DashboardStart";
import DashboardLinks from "./pages/dashboardpages/DashboardLinks";
import DashboardSocial from "./pages/dashboardpages/DashboardSocial";
import DashboardEmbeds from "./pages/dashboardpages/DashboardEmbeds";
import DashboardCustomization from "./pages/dashboardpages/DashboardCustomization";
import DashboardInventory from "./pages/dashboardpages/DashboardInventory";
import DashboardAssets from "./pages/dashboardpages/DashboardAssets";
import DashboardStore from "./pages/dashboardpages/DashboardStore";
import DashboardTags from "./pages/dashboardpages/DashboardTags";
import DashboardLogs from "./pages/dashboardpages/DashboardLogs";
import DashboardSettings from "./pages/dashboardpages/DashboardSettings";
// import DashboardRoulette from "./pages/dashboardpages/DashboardRoulette";

// ==================== UTILITIES ====================
import TitleManager from "./types/TitleManager";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ProfileProvider>
            <InventoryProvider>
              <TitleManager />
              
              <Routes>
                {/* ==================== PUBLIC ROUTES ==================== */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/validate" element={<EmailValidation />} />
                <Route path="/plans" element={<PrincingSection />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ==================== DASHBOARD ROUTES ==================== */}
                {/*
                  ESTRUTURA:
                  /dashboard/* → DashboardLayout (wrapper principal)
                    └─ ProtectedLayout (verificação de autenticação)
                        └─ Páginas individuais ou layouts específicos
                */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route element={<ProtectedLayout />}>
                    
                    {/* Dashboard home */}
                    <Route index element={<DashboardStart />} />
                    <Route path="start" element={<DashboardStart />} />

                    {/* Páginas simples (sem providers adicionais) */}
                    <Route path="settings" element={<DashboardSettings />} />
                    <Route path="logs" element={<DashboardLogs />} />
                    <Route path="tags" element={<DashboardTags />} />
                    <Route path="assets" element={<DashboardAssets />} />
                    <Route path="inventory" element={<DashboardInventory />} />
                    <Route path="customization" element={<DashboardCustomization />} />
                    
                    {/* Páginas premium */}
                    <Route 
                      path="embeds" 
                      element={
                        <RequiresPremium>
                          <DashboardEmbeds />
                        </RequiresPremium>
                      } 
                    />

                    {/* Páginas futuras */}
                    {/* <Route path="roulette" element={<DashboardRoulette />} /> */}

                    {/* Store (com StoreLayout) */}
                    <Route element={<StoreLayout />}>
                      <Route path="store" element={<DashboardStore />} />
                    </Route>

                    {/* Links e Social Media (com LinksLayout) */}
                    <Route element={<LinksLayout />}>
                      <Route path="links" element={<DashboardLinks />} />
                      <Route path="socialmedia" element={<DashboardSocial />} />
                    </Route>

                  </Route>
                </Route>

                {/* ==================== 404 NOT FOUND ==================== */}
                <Route path="*" element={<NotFound />} />
                
              </Routes>
              
            </InventoryProvider>
          </ProfileProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;