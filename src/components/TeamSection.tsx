import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, Heart, Lightbulb } from "lucide-react";

const TeamSection = () => {
  return (
    <section id="team" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Our Team & Vision
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We bring together legal expertise, lived experience, and technology innovation 
            to create lasting change in housing justice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <Card className="shadow-elegant hover:shadow-card transition-all duration-300">
            <CardHeader>
              <Scale className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Legal Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our co-founder is a real estate lawyer who has witnessed firsthand the challenges 
                facing pro bono attorneys in eviction defense. This direct legal experience shapes 
                every aspect of our compliance algorithms and attorney-facing features.
              </p>
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  "I've seen how paperwork bottlenecks limit the number of families attorneys can help. 
                  Technology should eliminate these barriers, not create new ones."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-card transition-all duration-300">
            <CardHeader>
              <Heart className="h-12 w-12 text-destructive mb-4" />
              <CardTitle className="text-2xl">Lived Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our other co-founder grew up in a low-income community where evictions were a constant 
                reality. Watching neighbors displaced and families destabilized drives our commitment 
                to early intervention and tenant-centered design.
              </p>
              <div className="bg-destructive/5 p-4 rounded-lg">
                <p className="text-sm font-medium text-destructive">
                  "Every eviction affects an entire community. Children change schools, families lose 
                  support networks, and neighborhoods lose their stability."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="text-center shadow-card">
            <CardHeader>
              <Users className="h-12 w-12 text-equity-gold mx-auto mb-4" />
              <CardTitle>Community Co-Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We build with our communities, not for them. Every feature is tested and refined 
                through feedback from attorneys, tenants, and property professionals.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-card">
            <CardHeader>
              <Lightbulb className="h-12 w-12 text-impact-gray mx-auto mb-4" />
              <CardTitle>Innovation with Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We leverage AI and technology not just for efficiency, but specifically to address 
                systemic inequities in housing and legal access.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-hero rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            Why the Camelback Fellowship?
          </h3>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg leading-relaxed">
              Our mission aligns perfectly with Camelback's focus on systemic inequities and conscious technology. 
              We're not just building a legal tech platform - we're creating tools that directly address 
              housing displacement affecting communities of color and low-income families.
            </p>
            <p className="text-lg leading-relaxed">
              The fellowship's 16-week accelerator model provides exactly what we need: structured support 
              to scale our impact, connect with like-minded entrepreneurs, and access the mentorship necessary 
              to grow from early-stage to sustainable social enterprise.
            </p>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 mt-8">
              <p className="text-equity-gold font-semibold text-lg">
                "We're ready to join a community of entrepreneurs who understand that technology's highest 
                purpose is creating equity and justice for those who need it most."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;