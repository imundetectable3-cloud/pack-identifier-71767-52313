import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Saved = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Saved Analyses</h1>
        <Card>
          <CardHeader>
            <CardTitle>Local Storage Only</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              This app now uses Perplexity AI for real-time analysis.
              Saved analyses feature has been removed as part of migrating away from Supabase.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You can take screenshots of your analysis results to save them locally.
            </p>
            <Button onClick={() => navigate("/camera")}>
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Saved;
