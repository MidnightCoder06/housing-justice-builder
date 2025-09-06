import React from "react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/equity-works-logo.png" 
            alt="Equity Works" 
            className="h-12 w-auto"
          />
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#problem" className="text-sm font-medium hover:text-primary transition-colors">
            The Problem
          </a>
          <a href="#solution" className="text-sm font-medium hover:text-primary transition-colors">
            Our Solution
          </a>
          <a href="#impact" className="text-sm font-medium hover:text-primary transition-colors">
            Impact
          </a>
          <a href="#team" className="text-sm font-medium hover:text-primary transition-colors">
            Team
          </a>
        </nav>
        <Button variant="default" size="sm">
          Request a Demo
        </Button>
      </div>
    </header>
  );
};

export default Header;