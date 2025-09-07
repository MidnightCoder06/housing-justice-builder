import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Home, Scale, Heart } from "lucide-react";

const ImpactSection = () => {
  return (
    <section id="impact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Measuring Our Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our platform addresses critical inefficiencies in housing law while working toward 
            systemic change that keeps families in their homes and communities stable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300 bg-primary/5">
            <CardHeader className="pb-4">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold text-primary mb-2">$1000s</CardTitle>
              <CardTitle className="text-lg">Cost Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Prevented delays and legal fees from defective notices that reset entire processes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300 bg-equity-gold/10">
            <CardHeader className="pb-4">
              <Scale className="h-12 w-12 text-equity-gold mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold text-equity-gold mb-2">100%</CardTitle>
              <CardTitle className="text-lg">Legal Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                AI-powered scanning ensures notices meet all state and local requirements
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300 bg-impact-gray/10">
            <CardHeader className="pb-4">
              <Home className="h-12 w-12 text-impact-gray mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold text-impact-gray mb-2">Faster</CardTitle>
              <CardTitle className="text-lg">Case Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Cost-effective processing and automated workflows reduce attorney workload bottlenecks
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300 bg-destructive/10">
            <CardHeader className="pb-4">
              <Heart className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold text-destructive mb-2">Early</CardTitle>
              <CardTitle className="text-lg">Intervention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Tenant-facing tools provide help at first sign of trouble, before court dates
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Breaking Cycles of Housing Instability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By reducing barriers to defense and ensuring proper legal procedures, our platform helps 
                families remain in their homes and breaks cycles of displacement that devastate communities.
              </p>
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  "Housing stability is the foundation for educational success, economic mobility, 
                  and community strength. Technology can be a powerful equalizer in legal proceedings."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Systemic Change Through Technology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our approach addresses both immediate compliance needs and long-term systemic inequities 
                by making legal technology accessible to both sides of housing disputes.
              </p>
              <div className="bg-equity-gold/10 p-4 rounded-lg">
                <p className="text-sm font-medium text-trust-navy">
                  "True equity in housing justice requires scalable tools that work for everyone - 
                  tenants, attorneys, and property owners alike."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;