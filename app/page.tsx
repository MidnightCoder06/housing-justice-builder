import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import ImpactSection from './components/ImpactSection'
import TeamSection from './components/TeamSection'
import Footer from './components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ImpactSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  )
} 