import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Shield, Zap, Target, CheckCircle, Users } from "lucide-react";

const SolutionSection = () => {
  return (
    <section id="solution" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            AI-Powered Legal Technology for Housing Justice
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our platform addresses eviction notice compliance issues that reset entire legal processes, 
            costing thousands in delays and lost time while helping level the playing field.
          </p>
        </div>

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
                  <span className="text-sm">Batch processing for law firms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center shadow-card">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Tenant Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Early intervention tools for tenants at the first sign of trouble, 
                before ever reaching court.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card">
            <CardHeader>
              <Target className="h-12 w-12 text-equity-gold mx-auto mb-4" />
              <CardTitle>Precise Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Modular compliance logic for complex jurisdictions like Los Angeles 
                and San Francisco with layered ordinances.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card">
            <CardHeader>
              <Users className="h-12 w-12 text-impact-gray mx-auto mb-4" />
              <CardTitle>Attorney Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reduces paperwork bottlenecks, allowing pro bono attorneys 
                to handle more eviction defense cases effectively.
              </p>
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