import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Shield, Zap, Target, CheckCircle, Users } from "lucide-react";

const SolutionSection = () => {
  return (
    <section id="solution" className="py-20 bg-background">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <Bot className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">AI-Powered Compliance Scanning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Upload eviction notices and instantly scan them for compliance with state and 
                local rent control ordinances, tenant protection laws, and notice formatting requirements.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm">California state law compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm">Local rent control ordinances</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm">Tenant protection law alignment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <Zap className="h-12 w-12 text-equity-gold mb-4" />
              <CardTitle className="text-2xl">Guided Notice Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Generate compliant eviction notices from scratch through guided workflows, 
                ensuring proper formatting and legal requirements are met.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-equity-gold" />
                  <span className="text-sm">Step-by-step guidance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-equity-gold" />
                  <span className="text-sm">Jurisdiction-specific customization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-equity-gold" />
                  <span className="text-sm">Cost-effective processing for law firms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="bg-gradient-accent rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-trust-navy">
            Built Through Co-Creation
          </h3>
          <p className="text-lg text-trust-navy/80 max-w-3xl mx-auto leading-relaxed">
            Our platform is developed through ongoing collaboration with landlord-side attorneys, 
            property owners, property managers, pro bono attorneys, and tenant communities. 
            Every feature is shaped by real-world feedback and tested with the people we serve.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;