import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminPasswordGateProps {
  children: React.ReactNode;
}

const SESSION_KEY = "admin_authenticated";

export const AdminPasswordGate = ({ children }: AdminPasswordGateProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem(SESSION_KEY);
    if (isAuth === "true") {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setChecking(true);

    try {
      const { data, error: dbError } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_password")
        .single();

      if (dbError) throw dbError;

      if (!data || password !== data.value) {
        setError("Incorrect password");
        return;
      }

      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to verify. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleForgotPassword = async () => {
    setSendingReset(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-forgot-password");
      
      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Reset Link Sent!",
        description: "Password reset link has been sent to admin email.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send reset link. Try again later.",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl border border-border/50 shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={checking || !password}>
              {checking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Login
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingReset}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {sendingReset ? "Sending..." : "Forgot Password?"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
