import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/ThemeProvider";
import Navbar from "./components/homecomponents/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailValidation from "./pages/EmailValidation";
import PrincingSection from "./pages/PrincingSection";
import RankingPage from "./pages/RankingPage";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/validate-email" element={<EmailValidation />} />
              <Route path="/plans" element={<PrincingSection />} />
              <Route path="/ranking" element={<RankingPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
