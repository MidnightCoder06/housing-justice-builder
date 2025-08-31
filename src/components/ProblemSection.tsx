import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, FileText, Clock } from "lucide-react";

const ProblemSection = () => {
  return (
    <section id="problem" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            The Housing Justice Crisis
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every year, millions of families face eviction not because the law is against them, 
            but because they cannot navigate complex legal processes or access adequate representation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl">Inequitable Representation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                90% of landlords have attorneys while fewer than 10% of tenants do, 
                creating a massive power imbalance in eviction proceedings.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-4">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Disproportionate Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Black and Latino renters, especially Black women with children, 
                experience the highest eviction rates nationwide.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-4">
              <FileText className="h-12 w-12 text-equity-gold mx-auto mb-4" />
              <CardTitle className="text-2xl">Complex Paperwork</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Families lose their homes navigating complex paperwork, 
                missing filing deadlines, and struggling with legal procedures.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-4">
              <Clock className="h-12 w-12 text-impact-gray mx-auto mb-4" />
              <CardTitle className="text-2xl">Overburdened Attorneys</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pro bono attorneys struggle to keep up with demand, 
                limiting how many eviction defense cases they can handle.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Our Team's Personal Connection
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              One of our co-founders is a real estate lawyer who has witnessed firsthand how 
              overburdened pro bono attorneys struggle with eviction defense demand. Another 
              co-founder grew up in a low-income community where evictions were a constant reality, 
              watching neighbors displaced and families destabilized.
            </p>
            <p className="text-lg font-medium text-primary">
              These experiences revealed the urgent need for scalable tools that can help 
              both attorneys and tenants level the playing field.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;