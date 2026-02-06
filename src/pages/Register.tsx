import React from 'react'
import Navbar from '../components/homecomponents/Navbar'
import FormRegister from '../components/authcomponents/FormRegister'
import Footer from '../components/homecomponents/Footer'

function Register() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <FormRegister />
      <Footer />
    </div>
  )
}

export default Register
