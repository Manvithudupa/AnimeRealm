import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/src/integrations/supabase/client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useToast } from "@/src/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    toast({
      title: "Password updated ✅",
      description: "Please sign in again with your new password.",
    });

    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4">
      <Card className="w-full max-w-sm bg-[#111] border border-white/10">
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
