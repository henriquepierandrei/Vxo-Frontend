import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/ThemeProvider";
import Navbar from "./components/homecomponents/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailValidation from "./pages/EmailValidation";
import PrincingSection from "./pages/PrincingSection";
import RankingPage from "./pages/RankingPage";
import DashboardLayout from "./pages/DashboardLayout";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300 dark:bg-black">
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/validate-email" element={<EmailValidation />} />
              <Route path="/plans" element={<PrincingSection />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/dashboard" element={<DashboardLayout><div></div></DashboardLayout>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
