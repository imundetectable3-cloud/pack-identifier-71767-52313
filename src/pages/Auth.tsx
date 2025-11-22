import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Not Required</CardTitle>
          <CardDescription>
            This app uses Perplexity AI API for packaging analysis. No user authentication is needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            Go to Home
          </Button>
          <Button 
            onClick={() => navigate("/camera")} 
            variant="outline"
            className="w-full"
          >
            Start Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
