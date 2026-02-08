// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/UserContext";

// ✅ Importar os wrappers
import { DashboardWithLinks, DashboardWithoutLinks } from "./components/DashboardWrappers";

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
import LogsPremium from "./pages/dashboardpages/LogsPremium";
import DashboardLinks from "./pages/dashboardpages/DashboardLinks";
import DashboardSocial from "./pages/dashboardpages/DashboardSocial";
import DashboardCustomization from "./pages/dashboardpages/DashboardCustomization";
import DashboardInventory from "./pages/dashboardpages/DashboardInventory";
import DashboardTags from "./pages/dashboardpages/DashboardTags";
import DashboardAssets from "./pages/dashboardpages/DashboardAssets";
import DashboardStart from "./pages/dashboardpages/DashboardStart";
import DashboardStore from "./pages/dashboardpages/DashboardStore";

import TitleManager from "./types/TitleManager";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ProfileProvider>
            <TitleManager />

            <div className="min-h-screen transition-colors duration-300">
              <main>
                <Routes>
                  {/* ========== ROTAS PÚBLICAS ========== */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/validate-email" element={<EmailValidation />} />
                  <Route path="/plans" element={<PrincingSection />} />
                  <Route path="/ranking" element={<RankingPage />} />

                  {/* ========== DASHBOARD SEM LINKS PROVIDER ========== */}
                  <Route
                    path="/dashboard"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardStart />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/start"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardStart />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/settings"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardSettings />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/tags"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardTags />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/logs"
                    element={
                      <DashboardWithoutLinks>
                        <LogsPremium />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/store"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardStore />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/assets"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardAssets />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/inventory"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardInventory />
                      </DashboardWithoutLinks>
                    }
                  />

                  <Route
                    path="/dashboard/customization"
                    element={
                      <DashboardWithoutLinks>
                        <DashboardCustomization />
                      </DashboardWithoutLinks>
                    }
                  />

                  {/* ========== DASHBOARD COM LINKS PROVIDER ========== */}
                  <Route
                    path="/dashboard/links"
                    element={
                      <DashboardWithLinks>
                        <DashboardLinks />
                      </DashboardWithLinks>
                    }
                  />

                  <Route
                    path="/dashboard/socialmedia"
                    element={
                      <DashboardWithLinks>
                        <DashboardSocial />
                      </DashboardWithLinks>
                    }
                  />

                  {/* ========== FALLBACK ========== */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>
            </div>
          </ProfileProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;