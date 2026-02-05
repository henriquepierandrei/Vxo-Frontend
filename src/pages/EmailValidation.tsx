import React from 'react'
import Navbar from '../components/homecomponents/Navbar'
import FormValidation from '../components/authcomponents/FormValidation'

function EmailValidation() {
  return (
     <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <FormValidation />
    </div>
  )
}

export default EmailValidation
