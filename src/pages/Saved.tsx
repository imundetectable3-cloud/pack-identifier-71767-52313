import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

interface Material {
  type: string;
  structure: string;
  fssaiRegulation: string;
  bisStandards: string;
  thickness: string;
  gsm: string;
}

interface SavedAnalysis {
  id: string;
  image_url: string;
  materials: Material[];
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

      const sb = supabase as unknown as SupabaseClient;
      const { data, error } = await sb
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

      const sb = supabase as unknown as SupabaseClient;
      const { error: dbError } = await sb
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
                        {analysis.materials.map((material, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-muted/50 space-y-2"
                          >
                            <p className="font-semibold">{material.type}</p>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <p><span className="font-medium">Structure:</span> {material.structure}</p>
                              <p><span className="font-medium">FSSAI:</span> {material.fssaiRegulation}</p>
                              <p><span className="font-medium">BIS:</span> {material.bisStandards}</p>
                              <p><span className="font-medium">Thickness:</span> {material.thickness}</p>
                              <p><span className="font-medium">GSM:</span> {material.gsm}</p>
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
