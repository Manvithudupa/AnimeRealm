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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

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
                <Label className="text-white/80" htmlFor="username">
                  Username
                </Label>
                <Input
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                  id="username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-white/80" htmlFor="email">
                Email
              </Label>
              <Input
                className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-white/80" htmlFor="password">
                Password
              </Label>
              <Input
                className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              className="w-full bg-white text-black hover:bg-white/90 transition"
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111] px-2 text-white/40">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full bg-black/40 border-white/10 text-white hover:bg-black/60"
            onClick={handleGoogleSignIn}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-4 h-4 mr-2"
              alt=""
            />
            Google
          </Button>

          <div className="text-center text-sm pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/70 hover:text-white underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
