import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/src/integrations/supabase/client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useToast } from "@/src/hooks/use-toast.js";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* 🔑 Forgot password state */
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Signed in successfully.",
        });

        navigate("/home");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please verify your email.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google Sign-in Failed",
        description: error.message,
      });
    }
  };

  /* 🔐 Forgot password handler */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Check your email 📩",
        description: "Password reset link sent.",
      });
      setShowForgot(false);
      setResetEmail("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a] text-white">
      <Card className="w-full max-w-sm bg-[#111] border border-white/10 rounded-xl shadow-lg shadow-black/40">
        <CardHeader className="text-center space-y-2 pb-2">
          <img src="/logo.png" alt="Logo" className="mx-auto h-16 w-auto" />

          <CardTitle className="text-2xl font-semibold text-white">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>

          <CardDescription className="text-sm text-white/40">
            {isLogin
              ? "Welcome back to AnimeRealm!"
              : "Join us and start watching anime."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <Label className="text-white/80">Username</Label>
                <Input
                  className="bg-black/40 border-white/10 text-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-white/80">Email</Label>
              <Input
                className="bg-black/40 border-white/10 text-white"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative space-y-1">
              <Label className="text-white/80">Password</Label>
              <Input
                className="bg-black/40 border-white/10 text-white pr-10"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-9 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-white/60 hover:text-white underline"
              >
                Forgot password?
              </button>
            )}

            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            Google
          </Button>

          <div className="text-center text-sm pt-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] border border-white/10 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Reset Password</h2>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <div className="flex gap-2">
                <Button className="flex-1" disabled={loading}>
                  {loading ? "Sending..." : "Send Link"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForgot(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
