import FeaturesSection from "../../components/homecomponents/FeaturesSection"
import Footer from "../../components/homecomponents/Footer"
import HeroSection from "../../components/homecomponents/HeroSection"
import Navbar from "../../components/homecomponents/Navbar"
import SocialProofSection from "../../components/homecomponents/SocialProofSection"


function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <br />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default Home
