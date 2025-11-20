import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/integrations/supabase/client";
import {Navbar} from "@/components/navbar/Navbar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Loader2, User, Sparkles } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast.js";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    gender: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          username: data.username || "",
          gender: data.gender || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const generateRandomAvatar = async () => {
    setGenerating(true);
    try {
      const query = `
        query {
          Page(page: 1, perPage: 50) {
            characters(sort: FAVOURITES_DESC) {
              image { large }
            }
          }
        }
      `;
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      const characters = result.data.Page.characters;
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
      setProfile((prev) => ({ ...prev, avatar_url: randomCharacter.image.large }));

      toast({ title: "Avatar Generated!", description: "Random anime character selected as your profile picture." });
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast({ title: "Error", description: "Failed to generate avatar. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          id: user.id,
          username: profile.username,
          gender: profile.gender,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      toast({ title: "Success!", description: "Profile updated successfully." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 max-w-2xl animate-fadeIn">
        <Card className="shadow-md border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>Manage your profile information and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={updateProfile} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-32 w-32 ring-4 ring-muted/40 group-hover:ring-primary/40 transition-all duration-300 rounded-xl shadow-lg">
                    <AvatarImage src={profile.avatar_url} className="rounded-xl object-cover" />
                    <AvatarFallback className="rounded-xl bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomAvatar}
                  disabled={generating}
                  className="transition-all flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Random Avatar
                    </>
                  )}
                </Button>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter your username"
                  className="transition-all focus:ring-2"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                  <SelectTrigger id="gender" className="transition-all focus:ring-2">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="transition-all focus:ring-2"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium transition-all hover:brightness-110"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
