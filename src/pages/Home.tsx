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
            PackScan
          </h1>
        </div>
      </section>

      {/* Packaging Types Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Packaging Material Guide</h2>
        
        {/* Plastics Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Plastic Types (Resin Codes)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-blue-500">1</Badge>
                  PET/PETE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Water bottles, soft drink bottles, food jars
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-blue-600">2</Badge>
                  HDPE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Milk jugs, detergent bottles, shampoo bottles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-yellow-600">3</Badge>
                  PVC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pipes, medical tubing, some food wraps
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-blue-400">4</Badge>
                  LDPE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Plastic bags, squeeze bottles, bread bags
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-purple-500">5</Badge>
                  PP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yogurt containers, bottle caps, straws
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-red-500">6</Badge>
                  PS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Foam cups, food containers, packing peanuts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-gray-500">7</Badge>
                  Other
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mixed plastics, polycarbonate, bioplastics
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Other Packaging Types */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Other Packaging Materials</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  Boxes, cartons, wrapping paper. Biodegradable and highly recyclable.
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
                  Metal (Aluminum/Steel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Cans, foils, tins. Energy-efficient to recycle, infinitely recyclable.
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
                  Tetra paks, chip bags. Multiple layers (plastic/foil/paper) make recycling difficult.
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
                  Biodegradable/Compostable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  PLA, bagasse, plant fibers. Breaks down naturally under composting conditions.
                </p>
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Eco-Friendly</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Recycle className="w-5 h-5 text-amber-500" />
                  </div>
                  Composite/Mixed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Aseptic cartons, bubble wrap. Mixed materials difficult to separate and recycle.
                </p>
                <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">Limited Recycling</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Navigation />
    </div>
  );
};

export default Home;
