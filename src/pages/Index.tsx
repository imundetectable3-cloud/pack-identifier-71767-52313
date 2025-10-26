import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Leaf, Recycle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-packaging.jpg";

interface Material {
  type: string;
  classification: string;
  recyclability: string;
  biodegradable: boolean;
  commonUses: string;
  sustainabilityRating: number;
  environmentalImpact: string;
}

interface AnalysisResult {
  materials: Material[];
  overallAnalysis: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-packaging", {
        body: { imageBase64: selectedImage },
      });

      if (error) {
        throw error;
      }

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Packaging materials have been identified successfully.",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSustainabilityColor = (rating: number) => {
    if (rating >= 4) return "bg-primary text-primary-foreground";
    if (rating >= 3) return "bg-secondary text-secondary-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex gap-4 justify-center">
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

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Upload Packaging Photo
            </CardTitle>
            <CardDescription>
              Take a photo or upload an image of product packaging to analyze its materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload image</p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WEBP (max 10MB)
                </p>
              </label>
            </div>

            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Selected packaging"
                  className="w-full rounded-lg shadow-md"
                />
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Packaging"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results Section */}
      {analysis && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Overall Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.overallAnalysis}</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {analysis.materials.map((material, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{material.type}</CardTitle>
                        <CardDescription className="mt-1">
                          {material.classification}
                        </CardDescription>
                      </div>
                      <Badge className={getSustainabilityColor(material.sustainabilityRating)}>
                        {material.sustainabilityRating}/5
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Recycle className="w-4 h-4 text-primary" />
                        Recyclability
                      </h4>
                      <p className="text-sm text-muted-foreground">{material.recyclability}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-primary" />
                        Biodegradable
                      </h4>
                      <Badge variant={material.biodegradable ? "default" : "secondary"}>
                        {material.biodegradable ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Common Uses</h4>
                      <p className="text-sm text-muted-foreground">{material.commonUses}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Environmental Impact</h4>
                      <p className="text-sm text-muted-foreground">{material.environmentalImpact}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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
    </div>
  );
};

export default Index;
