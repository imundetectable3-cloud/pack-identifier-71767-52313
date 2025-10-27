import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recycle, Leaf, Package, Droplets } from "lucide-react";
import Navigation from "@/components/Navigation";

const Specifications = () => {
  const materials = [
    {
      icon: Package,
      name: "Plastic (PET)",
      recyclable: true,
      biodegradable: false,
      description: "Commonly used for beverage bottles. Highly recyclable but takes hundreds of years to decompose naturally.",
      tips: "Rinse before recycling. Check local recycling guidelines.",
    },
    {
      icon: Package,
      name: "Cardboard",
      recyclable: true,
      biodegradable: true,
      description: "Made from paper pulp. Easily recyclable and biodegradable. One of the most eco-friendly packaging options.",
      tips: "Remove any plastic coating or tape before recycling.",
    },
    {
      icon: Droplets,
      name: "Glass",
      recyclable: true,
      biodegradable: false,
      description: "Infinitely recyclable without loss of quality. Heavy and energy-intensive to transport.",
      tips: "Can be recycled endlessly. Clean and sort by color when possible.",
    },
    {
      icon: Package,
      name: "Aluminum",
      recyclable: true,
      biodegradable: false,
      description: "Lightweight and highly recyclable. Recycling saves 95% of the energy needed to produce new aluminum.",
      tips: "Rinse cans and crush to save space. Highly valuable for recycling.",
    },
    {
      icon: Leaf,
      name: "Biodegradable Plastics",
      recyclable: false,
      biodegradable: true,
      description: "Made from plant-based materials. Breaks down under specific conditions but not always in regular composting.",
      tips: "Check if your local facility accepts compostable materials.",
    },
    {
      icon: Package,
      name: "Styrofoam (EPS)",
      recyclable: false,
      biodegradable: false,
      description: "Lightweight but problematic. Rarely recyclable and takes over 500 years to decompose.",
      tips: "Try to avoid when possible. Some facilities accept for special recycling.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary-glow/5">
          <CardHeader>
            <CardTitle className="text-2xl">Packaging Materials Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              Learn about different packaging materials, their environmental impact, and how to properly dispose of them.
              Understanding these materials helps us make better choices for our planet.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Recycle className="w-3 h-3" />
                Recyclable
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Leaf className="w-3 h-3" />
                Biodegradable
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {materials.map((material, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <material.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {material.recyclable && (
                      <Badge variant="outline" className="gap-1">
                        <Recycle className="w-3 h-3" />
                      </Badge>
                    )}
                    {material.biodegradable && (
                      <Badge variant="outline" className="gap-1">
                        <Leaf className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{material.description}</p>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Recycling Tips:</p>
                  <p className="text-sm text-muted-foreground">{material.tips}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle>General Recycling Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>• Always rinse containers before recycling to prevent contamination</p>
            <p>• Remove labels and caps when required by your local facility</p>
            <p>• Never mix different types of materials in the same recycling bin</p>
            <p>• Flatten cardboard boxes to save space</p>
            <p>• Check your local recycling guidelines as they vary by location</p>
            <p>• When in doubt, choose reusable options over single-use packaging</p>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Specifications;
