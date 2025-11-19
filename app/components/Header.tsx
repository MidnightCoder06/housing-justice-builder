'use client'

import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const Header = () => {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");

  const isProceedEnabled = useMemo(
    () => Boolean(name.trim() && company.trim() && password.trim()),
    [name, company, password]
  );

  const handleProceed = () => {
    if (!isProceedEnabled) return;
    setIsLoginOpen(false);
    router.push("/camelbackventures-product-demo");
  };

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
        <div className="flex items-center gap-3">
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Login
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-name">Name</Label>
                  <Input
                    id="login-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-company">Company</Label>
                  <Input
                    id="login-company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Acme Inc."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <Button
                className={cn("w-full")}
                disabled={!isProceedEnabled}
                onClick={handleProceed}
              >
                Proceed to document analysis and generation
              </Button>
            </DialogContent>
          </Dialog>

          <Button variant="default" size="sm" asChild>
            <a href="/demo">Request a Demo</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
