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
    // Check if already authenticated via Supabase session with admin role
    const checkAuth = async () => {
      const isAuth = sessionStorage.getItem(SESSION_KEY);
      if (isAuth === "true") {
        // Verify we still have a valid Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthenticated(true);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setChecking(true);

    try {
      // Call edge function to verify password and get admin session
      const { data, error: fnError } = await supabase.functions.invoke("admin-login", {
        body: { password },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        setError(data.error === "Invalid password" ? "Incorrect password" : data.error);
        return;
      }

      if (data?.session) {
        // Set the admin session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        sessionStorage.setItem(SESSION_KEY, "true");
        setAuthenticated(true);
      } else {
        setError("Login failed. Try again.");
      }
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
      const { data, error } = await supabase.functions.invoke("send-admin-password");
      
      if (error) throw error;
      
      toast({
        title: "Password Sent!",
        description: "Password has been sent to d***@gmail.com",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send password. Try again later.",
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
