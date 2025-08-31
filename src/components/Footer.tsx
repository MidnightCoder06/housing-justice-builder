import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import equityWorksLogo from "@/assets/equity-works-logo.png";

const Footer = () => {
  return (
    <footer className="bg-trust-navy text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={equityWorksLogo} 
                alt="Equity Works" 
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              AI-powered legal technology leveling the playing field in housing justice. 
              Empowering tenants and attorneys to defend against evictions.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Our Mission</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Housing Justice</li>
              <li>Legal Technology</li>
              <li>Community Empowerment</li>
              <li>Systemic Change</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#problem" className="hover:text-equity-gold transition-colors">The Problem</a></li>
              <li><a href="#solution" className="hover:text-equity-gold transition-colors">Our Solution</a></li>
              <li><a href="#impact" className="hover:text-equity-gold transition-colors">Impact</a></li>
              <li><a href="#team" className="hover:text-equity-gold transition-colors">Our Team</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@equityworks.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>California, USA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300">
              © 2024 Equity Works. Building technology for housing justice.
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-equity-gold text-equity-gold hover:bg-equity-gold hover:text-trust-navy">
                <ExternalLink className="h-4 w-4 mr-2" />
                Camelback Fellowship
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;