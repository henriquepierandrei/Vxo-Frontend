import FormLogin from "../../components/authcomponents/FormLogin"
import Footer from "../../components/homecomponents/Footer"
import Navbar from "../../components/homecomponents/Navbar"


function Login() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <FormLogin />
      <Footer />
    </div>
  )
}

export default Login
