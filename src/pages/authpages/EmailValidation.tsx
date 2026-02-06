import FormValidation from "../../components/authcomponents/FormValidation"
import Footer from "../../components/homecomponents/Footer"
import Navbar from "../../components/homecomponents/Navbar"


function EmailValidation() {
  return (
     <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <FormValidation />
      <Footer />
    </div>
  )
}

export default EmailValidation
