import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, Home } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
      
      <div className="container mx-auto px-4 text-center text-white relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Scale className="h-8 w-8 text-equity-gold" />
            <Home className="h-8 w-8 text-equity-gold" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Leveling the Playing Field in 
            <span className="text-equity-gold"> Housing Justice</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            AI-powered legal technology that empowers tenants and their advocates 
            to defend against evictions and build housing stability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="secondary" size="lg" className="bg-equity-gold text-trust-navy hover:bg-equity-gold/90">
              Learn About Our Impact
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              View Our Solution
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold text-equity-gold mb-2">3.6M</div>
              <div className="text-sm text-gray-200">Eviction cases filed annually</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold text-equity-gold mb-2">90%</div>
              <div className="text-sm text-gray-200">Landlords with legal representation</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold text-equity-gold mb-2">&lt;10%</div>
              <div className="text-sm text-gray-200">Tenants with legal representation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;