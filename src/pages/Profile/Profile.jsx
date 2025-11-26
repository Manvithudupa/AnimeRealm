import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/integrations/supabase/client";
import Navbar from "@/src/components/navbar/Navbar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
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

  const [usernameWarning, setUsernameWarning] = useState(false);
  const [bioWarning, setBioWarning] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    gender: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

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
      const characters = result.data.Page.characters;
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

      setProfile((prev) => ({
        ...prev,
        avatar_url: randomCharacter.image.large,
      }));

      toast({ title: "Avatar Generated!", description: "Your new anime avatar is set!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate avatar.", variant: "destructive" });
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
          username: profile.username.trim(),
          gender: profile.gender,
          bio: profile.bio.trim(),
          avatar_url: profile.avatar_url,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;
      toast({ title: "Saved!", description: "Your profile has been updated." });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length >= 25) setUsernameWarning(true);
    else setUsernameWarning(false);

    setProfile((prev) => ({
      ...prev,
      username: value.slice(0, 25),
    }));
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length >= 200) setBioWarning(true);
    else setBioWarning(false);

    setProfile((prev) => ({
      ...prev,
      bio: value.slice(0, 200),
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="flex justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-xl bg-[#111] border border-white/10 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold text-white">Profile Settings</CardTitle>
            <CardDescription className="text-white/40">Update your anime profile</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <form onSubmit={updateProfile} className="space-y-8">

              {/* AVATAR */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-xl border border-white/10 shadow-lg overflow-hidden">
                  <img
                    src={profile.avatar_url || "/default-avatar.png"}
                    className="h-full w-full object-cover"
                    alt="avatar"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomAvatar}
                  disabled={generating}
                  className="bg-black/30 text-white border-white/10 hover:bg-black/50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Random Avatar
                    </>
                  )}
                </Button>
              </div>

              {/* USERNAME */}
              <div className="space-y-2">
                <Label className="text-white/80">Username</Label>
                <Input
                  value={profile.username}
                  onChange={handleUsernameChange}
                  placeholder="Your username"
                  maxLength={25}
                  className="bg-black/30 text-white border-white/10 placeholder:text-white/30"
                />
                <p className={`text-xs text-right ${usernameWarning ? "text-yellow-400" : "text-white/40"}`}>
                  {profile.username.length}/25 {usernameWarning && "⚠ Max limit reached"}
                </p>
              </div>

              {/* GENDER */}
              <div className="space-y-2">
                <Label className="text-white/80">Gender</Label>
                <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                  <SelectTrigger className="bg-black/30 text-white border-white/10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* BIO */}
              <div className="space-y-2">
                <Label className="text-white/80">Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={handleBioChange}
                  placeholder="Write something cool..."
                  rows={4}
                  maxLength={200}
                  className="bg-black/30 text-white border-white/10 placeholder:text-white/30"
                />
                <p className={`text-xs text-right ${bioWarning ? "text-yellow-400" : "text-white/40"}`}>
                  {profile.bio.length}/200 {bioWarning && "⚠ Max limit reached"}
                </p>
              </div>

              {/* SAVE BUTTON */}
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 font-medium h-11"
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

export default Profile;
