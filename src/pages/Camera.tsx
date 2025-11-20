import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera as CameraIcon, Recycle, Leaf, Save, ThumbsUp, ThumbsDown, Package, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { MaterialAnalysisView } from "@/components/MaterialAnalysisView";

interface Material {
  type: string;
  chemicalFormula: string;
  chemicalStructureImage: string | null;
  fssaiLimits: string[] | string;
  bisLimits: string[] | string;
  thickness: string;
  gsm: string;
  foodApplications: string[] | string;
}

interface AnalysisResult {
  materials: Material[];
}

const Camera = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
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
    setIsLoadingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setIsLoadingCamera(false);
        };
      }
      setIsCameraMode(true);
      setSelectedImage(null);
      setAnalysis(null);
    } catch (error: any) {
      setIsLoadingCamera(false);
      toast({
        title: "Camera Error",
        description: error?.message || "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    // Ensure video metadata is loaded
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      video.play().then(() => {
        requestAnimationFrame(() => capturePhoto());
      }).catch(() => {
        toast({
          title: "Camera not ready",
          description: "Please wait a moment and try again.",
        });
      });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setSelectedImage(imageData);
      setIsCameraMode(false);

      // Stop all tracks
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;

      toast({
        title: "Photo Captured",
        description: "Image captured successfully. Click Analyze to proceed.",
      });
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !selectedImage.startsWith("data:image")) {
      toast({
        title: "No image",
        description: "Please capture or upload a valid image before analyzing.",
        variant: "destructive",
      });
      return;
    }

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
        description: error?.message || "Failed to analyze the image. Please try again.",
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

      // Use untyped client to avoid missing types during generation
      const sb = supabase as unknown as SupabaseClient;

      // Save analysis to database
      const { error: dbError } = await sb
        .from("saved_analyses")
        .insert([{
          user_id: session.user.id,
          image_url: fileName,
          materials: analysis.materials,
          overall_analysis: 'Food packaging analysis',
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

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-background pb-20 flex flex-col">
      <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto">
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
                <div className="relative w-full h-56 sm:h-64 bg-muted rounded-lg overflow-hidden animate-fade-in">
                  {isLoadingCamera && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 z-10 animate-fade-in">
                      <div className="relative">
                        <CameraIcon className="w-12 h-12 text-muted-foreground animate-pulse" />
                        <div className="absolute inset-0 animate-ping">
                          <CameraIcon className="w-12 h-12 text-primary/30" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                        Initializing camera...
                      </p>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={capturePhoto} 
                    className="flex-1" 
                    size="lg"
                    disabled={isLoadingCamera}
                  >
                    Capture Photo
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCameraMode(false);
                      setIsLoadingCamera(false);
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
              <div className="space-y-4 animate-fade-in">
                <img
                  src={selectedImage}
                  alt="Selected packaging"
                  className={`${
                    analysis
                      ? "w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border mx-auto"
                      : "w-full max-w-md max-h-96 object-contain rounded-lg shadow-md mx-auto"
                  }`}
                />
                <div className="flex gap-2">
                  {!analysis ? (
                    <>
                      <Button
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className="flex-1 hover-scale"
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
                    <div className="flex gap-2 w-full justify-center">
                      <Button
                        onClick={saveAnalysis}
                        disabled={isSaving}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedImage(null);
                          setAnalysis(null);
                          setFeedback(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        New Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-4 animate-fade-in">
            <MaterialAnalysisView materials={analysis.materials} />
            <div className="flex justify-center gap-2">
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
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Camera;
