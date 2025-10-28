import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera as CameraIcon, Recycle, Leaf, Save, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

interface Material {
  type: string;
  classification: string;
  plasticResinCode?: number | null;
  layerComposition?: string | null;
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

const Camera = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
        setIsCameraMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraMode(true);
      setSelectedImage(null);
      setAnalysis(null);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setSelectedImage(imageData);
        setIsCameraMode(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-packaging", {
        body: { imageBase64: selectedImage },
      });

      if (error) throw error;

      setAnalysis(data);
      setFeedback(null);
      toast({
        title: "Analysis Complete",
        description: "Packaging materials have been identified successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = async () => {
    if (!analysis || !selectedImage) return;

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save analyses.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Upload image to storage
      const fileName = `${session.user.id}/${Date.now()}.jpg`;
      const base64Data = selectedImage.split(",")[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());

      const { error: uploadError } = await supabase.storage
        .from("analyses")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Save analysis to database
      // @ts-ignore - Table exists, types will sync automatically
      const { error: dbError } = await supabase
        .from("saved_analyses")
        .insert([{
          user_id: session.user.id,
          image_url: fileName,
          materials: analysis.materials,
          overall_analysis: analysis.overallAnalysis,
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Analysis Saved",
        description: "Your analysis has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedback = async (type: 'positive' | 'negative') => {
    setFeedback(type);
    toast({
      title: type === 'positive' ? "Thanks for the feedback!" : "Feedback noted",
      description: type === 'positive' 
        ? "Your positive feedback helps improve our AI." 
        : "We'll use this to improve our analysis accuracy.",
    });
  };

  const getSustainabilityColor = (rating: number) => {
    if (rating >= 4) return "bg-primary text-primary-foreground";
    if (rating >= 3) return "bg-secondary text-secondary-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Camera/Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CameraIcon className="w-5 h-5 text-primary" />
              Capture or Upload
            </CardTitle>
            <CardDescription>
              Take a photo or upload an image of product packaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCameraMode && !selectedImage && (
              <div className="space-y-4">
                <Button onClick={startCamera} className="w-full" size="lg">
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
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
              </div>
            )}

            {isCameraMode && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1" size="lg">
                    Capture Photo
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCameraMode(false);
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                      }
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {selectedImage && !isCameraMode && (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Selected packaging"
                  className="w-full max-w-md mx-auto max-h-96 object-contain rounded-lg shadow-md"
                />
                <div className="flex gap-2">
                  {!analysis ? (
                    <>
                      <Button
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className="flex-1"
                        size="lg"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Packaging"}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedImage(null);
                          setAnalysis(null);
                          setFeedback(null);
                        }}
                        variant="outline"
                        size="lg"
                      >
                        Clear
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={saveAnalysis}
                        disabled={isSaving}
                        className="flex-1"
                        size="lg"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedImage(null);
                          setAnalysis(null);
                          setFeedback(null);
                        }}
                        variant="outline"
                        size="lg"
                      >
                        New Analysis
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Overall Analysis</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={feedback === 'positive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFeedback('positive')}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={feedback === 'negative' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleFeedback('negative')}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.overallAnalysis}</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {analysis.materials.map((material, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl break-words">{material.type}</CardTitle>
                    <CardDescription className="mt-1 break-words">
                      {material.classification}
                    </CardDescription>
                  </div>
                  <Badge className={`${getSustainabilityColor(material.sustainabilityRating)} shrink-0`}>
                    {material.sustainabilityRating}/5
                  </Badge>
                </div>
              </CardHeader>
                  <CardContent className="space-y-4">
                    {material.plasticResinCode && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="font-semibold mb-1 text-blue-700 dark:text-blue-300">
                          Plastic Resin Code
                        </h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          #{material.plasticResinCode}
                        </p>
                      </div>
                    )}

                    {material.layerComposition && (
                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                          Layer Composition
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {material.layerComposition}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (Outside to Inside)
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Recycle className="w-4 h-4 text-primary" />
                        Recyclability
                      </h4>
                      <p className="text-sm text-muted-foreground break-words">{material.recyclability}</p>
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
                      <p className="text-sm text-muted-foreground break-words">{material.commonUses}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Environmental Impact</h4>
                      <p className="text-sm text-muted-foreground break-words">{material.environmentalImpact}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Camera;
