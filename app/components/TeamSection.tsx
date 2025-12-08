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

        {/* Team Members */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-primary">Meet Our Team</h3>
          <div className="flex flex-col md:flex-row justify-center items-start gap-16 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center flex-1 max-w-sm">
              <div className="mb-4">
                <img 
                  src="/HH-26612297_Brandon_Brown_1-680941e555f61.webp" 
                  alt="Brandon Brown" 
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
              </div>
              <h4 className="text-xl font-semibold mb-2">Brandon Brown</h4>
              <p className="text-muted-foreground text-center leading-relaxed">Partner, Raintree Law PC | Real Estate Attorney</p>
            </div>
            
            <div className="flex flex-col items-center text-center flex-1 max-w-sm">
              <div className="mb-4">
                <img 
                  src="/jean-leconte-internxl-headshot.jpeg" 
                  alt="Jean Leconte" 
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
              </div>
              <h4 className="text-xl font-semibold mb-2">Jean Leconte</h4>
              <p className="text-muted-foreground text-center leading-relaxed">Software Engineer (ex-Google, Microsoft, Amazon, Meta) | Author</p>
            </div>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="text-center shadow-card">
            <CardHeader>
              <Users className="h-12 w-12 text-equity-gold mx-auto mb-4" />
              <CardTitle>Community Co-Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We build with our communities, not for them. Every feature is tested and refined 
                through feedback from attorneys, tenants, and real estate professionals.
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
                We leverage AI and technology not just for efficiency and compliance, but specifically to address 
                systemic inequities in housing and legal access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;