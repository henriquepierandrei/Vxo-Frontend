import React from 'react'
import FormLogin from '../components/authcomponents/FormLogin'
import Navbar from '../components/homecomponents/Navbar'
import Footer from '../components/homecomponents/Footer'

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
