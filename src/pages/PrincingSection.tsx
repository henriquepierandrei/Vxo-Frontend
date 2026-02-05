import React from 'react'
import Navbar from '../components/homecomponents/Navbar'
import PricingPage from '../components/PricingPlans'

function PrincingSection() {
  return (
    <div className="min-h-screen bg-[var(--background-color)] text-white overflow-x-hidden">
      <Navbar />
      <PricingPage />
    </div>
  )
}

export default PrincingSection
