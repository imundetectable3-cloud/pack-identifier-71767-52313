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

      {/* Packaging Types Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Common Packaging Types</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Recycle className="w-5 h-5 text-blue-500" />
                </div>
                Plastic (PET/HDPE)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Bottles, containers, bags. Widely recyclable but petroleum-based.
              </p>
              <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">Recyclable</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
                Cardboard/Paper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Boxes, cartons. Biodegradable and highly recyclable.
              </p>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Eco-Friendly</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Recycle className="w-5 h-5 text-purple-500" />
                </div>
                Glass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Jars, bottles. 100% recyclable and reusable indefinitely.
              </p>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Highly Sustainable</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Recycle className="w-5 h-5 text-orange-500" />
                </div>
                Metal (Aluminum)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Cans, foils. Energy-efficient to recycle, infinitely recyclable.
              </p>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Recyclable</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Info className="w-5 h-5 text-red-500" />
                </div>
                Multi-Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Tetra paks, chip bags. Multiple materials make recycling difficult.
              </p>
              <Badge className="bg-red-500/20 text-red-700 dark:text-red-300">Hard to Recycle</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <Leaf className="w-5 h-5 text-teal-500" />
                </div>
                Biodegradable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Plant-based plastics, compostable materials. Breaks down naturally.
              </p>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Eco-Friendly</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      <Navigation />
    </div>
  );
};

export default Home;
