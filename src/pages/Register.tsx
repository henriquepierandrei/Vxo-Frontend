import React from 'react'
import Navbar from '../components/homecomponents/Navbar'
import FormRegister from '../components/authcomponents/FormRegister'

function Register() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <FormRegister />
    </div>
  )
}

export default Register
