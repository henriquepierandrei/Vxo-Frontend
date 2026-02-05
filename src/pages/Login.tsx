import React from 'react'
import FormLogin from '../components/authcomponents/FormLogin'
import Navbar from '../components/homecomponents/Navbar'

function Login() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <FormLogin />
    </div>
  )
}

export default Login
