// src/pages/auth/ResetPasswordPage.tsx
import ResetPasswordConfirm from '../../components/authcomponents/ResetPasswordConfirm';
import Footer from '../../components/homecomponents/Footer';
import Navbar from '../../components/homecomponents/Navbar';

function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <ResetPasswordConfirm />
      <Footer />
    </div>
  );
}

export default ResetPasswordPage;