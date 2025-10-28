import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Recycle, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

interface SavedAnalysis {
  id: string;
  image_url: string;
  materials: any;
  overall_analysis: string;
  created_at: string;
}

const Saved = () => {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedAnalyses();
  }, []);

  const fetchSavedAnalyses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // @ts-ignore - Table exists, types will sync automatically
      const { data, error } = await supabase
        .from("saved_analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get signed URLs for images
      const analysesWithUrls = await Promise.all(
        (data || []).map(async (analysis) => {
          const { data: urlData } = await supabase.storage
            .from("analyses")
            .createSignedUrl(analysis.image_url, 60 * 60); // 1 hour expiry

          return {
            ...analysis,
            image_url: urlData?.signedUrl || "",
          };
        })
      );

      setAnalyses(analysesWithUrls);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load saved analyses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnalysis = async (id: string, imageUrl: string) => {
    try {
      // Extract the file path from the signed URL or use the original path
      const pathMatch = imageUrl.match(/\/analyses\/(.+)\?/);
      const filePath = pathMatch ? pathMatch[1] : imageUrl;

      const { error: storageError } = await supabase.storage
        .from("analyses")
        .remove([filePath]);

      if (storageError) console.error("Storage deletion error:", storageError);

      // @ts-ignore - Table exists, types will sync automatically
      const { error: dbError } = await supabase
        .from("saved_analyses")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setAnalyses(analyses.filter((a) => a.id !== id));
      toast({
        title: "Deleted",
        description: "Analysis has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete analysis.",
        variant: "destructive",
      });
    }
  };

  const getSustainabilityColor = (rating: number) => {
    if (rating >= 4) return "bg-primary text-primary-foreground";
    if (rating >= 3) return "bg-secondary text-secondary-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading saved analyses...</p>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Saved Analyses</h1>

        {analyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't saved any analyses yet.
              </p>
              <Button onClick={() => navigate("/camera")}>
                Start Analyzing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={analysis.image_url}
                      alt="Analyzed packaging"
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-2">
                            Analysis from {new Date(analysis.created_at).toLocaleDateString()}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {analysis.overall_analysis}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAnalysis(analysis.id, analysis.image_url)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.materials.map((material: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex-1">
                              <p className="font-semibold">{material.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {material.classification}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {material.biodegradable && (
                                <Badge variant="outline">
                                  <Leaf className="w-3 h-3 mr-1" />
                                  Bio
                                </Badge>
                              )}
                              <Badge className={getSustainabilityColor(material.sustainabilityRating)}>
                                {material.sustainabilityRating}/5
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Saved;
