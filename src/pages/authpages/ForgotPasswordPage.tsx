// src/pages/auth/ForgotPasswordPage.tsx
import RequestPasswordReset from '../../components/authcomponents/RequestPasswordReset';
import Footer from '../../components/homecomponents/Footer';
import Navbar from '../../components/homecomponents/Navbar';

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <RequestPasswordReset />
      <Footer />
    </div>
  );
}

export default ForgotPasswordPage;