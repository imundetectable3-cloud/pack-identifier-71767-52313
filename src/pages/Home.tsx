import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Info, Recycle } from "lucide-react";
import heroImage from "@/assets/hero-packaging.jpg";
import Navigation from "@/components/Navigation";

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary-glow">
              <Recycle className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Pack Identifier
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload a photo of any product packaging and discover what materials it's made from. 
            Learn about sustainability, recyclability, and environmental impact.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Badge variant="secondary" className="text-base py-2 px-4">
              <Leaf className="w-4 h-4 mr-2" />
              Educational Tool
            </Badge>
            <Badge variant="secondary" className="text-base py-2 px-4">
              <Info className="w-4 h-4 mr-2" />
              Eco-Friendly
            </Badge>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle>About This Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This educational tool uses AI to help you understand the different types of packaging 
              materials used in everyday products. Learn about sustainability, recyclability, and 
              environmental impact of various packaging materials.
            </p>
            <p>
              By understanding packaging materials, we can make more informed choices and contribute 
              to a more sustainable future.
            </p>
          </CardContent>
        </Card>
      </section>

      <Navigation />
    </div>
  );
};

export default Home;
