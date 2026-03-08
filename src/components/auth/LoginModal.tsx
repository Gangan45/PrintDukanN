import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import printDukanLogo from "@/assets/printdukan-logo.png";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnTo?: string;
}

export const LoginModal = ({
  isOpen,
  onClose,
  returnTo
}: LoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const redirectUrl = import.meta.env.PROD 
    ? 'https://www.printdukan.in/' 
    : `${window.location.origin}/`;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-w-[95vw] rounded-xl">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Sign In with Google</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src={printDukanLogo} 
              alt="PrintDukan" 
              className="h-14 sm:h-16 mx-auto object-contain"
            />
            <h2 className="text-lg sm:text-xl font-semibold mt-4 text-foreground">
              Welcome to PrintDukan
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to continue shopping
            </p>
          </div>

          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 sm:h-14 text-base font-medium gap-3 border-2 hover:bg-muted/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms-conditions" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
