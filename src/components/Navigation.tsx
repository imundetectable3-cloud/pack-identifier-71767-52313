import { Home, Camera, FileText, Bookmark, LogOut, LogIn } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/auth");
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/camera", icon: Camera, label: "Camera" },
    { to: "/specifications", icon: FileText, label: "Info" },
    { to: "/saved", icon: Bookmark, label: "Saved" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-4 py-2 h-auto"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-medium">Logout</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="flex flex-col items-center gap-1 px-4 py-2 h-auto"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-xs font-medium">Login</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
