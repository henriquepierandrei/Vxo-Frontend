import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/ThemeProvider";
import DashboardLayout from "./pages/dashboardpages/DashboardLayout";
import Login from "./pages/authpages/Login";
import Register from "./pages/authpages/Register";
import EmailValidation from "./pages/authpages/EmailValidation";
import PrincingSection from "./pages/homepages/PrincingSection";
import RankingPage from "./pages/homepages/RankingPage";
import Home from "./pages/homepages/Home";
import DashboardSettings from "./pages/dashboardpages/DashboardSettings";
import LogsPremium from "./pages/dashboardpages/LogsPremium";
import DashboardLinks from "./pages/dashboardpages/DashboardLinks";
import DashboardSocial from "./pages/dashboardpages/DashboardSocial";
import DashboardCustomization from "./pages/dashboardpages/DashboardCustomization";
import DashboardInventory from "./pages/dashboardpages/DashboardInventory";
import DashboardTags from "./pages/dashboardpages/DashboardTags";
import DashboardAssets from "./pages/dashboardpages/DashboardAssets";
import DashboardStart from "./pages/dashboardpages/DashboardStart";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300">
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/validate-email" element={<EmailValidation />} />
              <Route path="/plans" element={<PrincingSection />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/dashboard" element={<DashboardLayout><div></div></DashboardLayout>} />

              <Route path="/dashboard/start" element={<DashboardLayout><DashboardStart /></DashboardLayout>} />


              <Route path="/dashboard/settings" element={<DashboardLayout><DashboardSettings /></DashboardLayout>} />
              <Route path="/dashboard/tags" element={<DashboardLayout><DashboardTags /></DashboardLayout>} />
              <Route path="/dashboard/logs" element={<DashboardLayout><LogsPremium /></DashboardLayout>} />
              <Route path="/dashboard/inventory" element={<DashboardLayout><DashboardInventory /></DashboardLayout>} />
              <Route path="/dashboard/links" element={<DashboardLayout><DashboardLinks /></DashboardLayout>} />
              <Route path="/dashboard/socialmedia" element={<DashboardLayout><DashboardSocial /></DashboardLayout>} />
              <Route path="/dashboard/assets" element={<DashboardLayout><DashboardAssets /></DashboardLayout>} />


              <Route path="/dashboard/customization" element={<DashboardLayout><DashboardCustomization /></DashboardLayout>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
