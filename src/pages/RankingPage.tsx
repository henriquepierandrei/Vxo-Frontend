import Footer from '../components/homecomponents/Footer'
import Navbar from '../components/homecomponents/Navbar'
import Ranking from '../components/rankingcomponents/Ranking'

function RankingPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <Ranking />
      <Footer />
 
    </div>
  )
}

export default RankingPage
