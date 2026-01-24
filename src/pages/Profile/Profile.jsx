import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/integrations/supabase/client";
import Navbar from "@/src/components/navbar/Navbar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
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

  /* Redirect if not logged in */
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading]);

  /* Load profile */
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

  /* Generate random avatar */
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      const characters = result.data.Page.characters;
      const randomCharacter =
        characters[Math.floor(Math.random() * characters.length)];

      setProfile((prev) => ({
        ...prev,
        avatar_url: randomCharacter.image.large,
      }));

      toast({
        title: "Avatar updated",
        description: "A new avatar has been applied to your profile.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Avatar generation failed",
        description: "Unable to generate an avatar at this time.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  /* Save profile */
  const updateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    if (profile.username.length > 25 || profile.bio.length > 200) {
      toast({
        title: "Validation error",
        description:
          "Username must be 25 characters or less. Bio must be 200 characters or less.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          username: profile.username,
          gender: profile.gender,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* Loading screen */
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
        <Card
          className={`w-full max-w-xl bg-[#111] border border-white/10 shadow-2xl rounded-2xl transition-all ${
            loading ? "opacity-90 pointer-events-none" : ""
          }`}
        >
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold">
              Profile Settings
            </CardTitle>
            <CardDescription className="text-white/40">
              Manage your public profile information
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={updateProfile} className="space-y-8">

              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 rounded-xl border border-white/10 shadow-lg">
                  <AvatarImage
                    src={profile.avatar_url || "/default-avatar.png"}
                    className="rounded-xl object-cover"
                  />
                  <AvatarFallback className="bg-black/40 flex items-center justify-center">
                    <User className="h-16 w-16 text-white/40" />
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  onClick={generateRandomAvatar}
                  disabled={generating}
                  className={`bg-white/10 border border-white/10 text-white
                    hover:bg-white/20 transition-all
                    ${generating ? "animate-pulse cursor-not-allowed" : ""}`}
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Avatar
                    </>
                  )}
                </Button>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={profile.username}
                  maxLength={25}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      username: e.target.value.slice(0, 25),
                    })
                  }
                  className="bg-black/30 border-white/10 text-white"
                />
                <div className="text-right text-xs text-white/40">
                  {profile.username.length}/25
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) =>
                    setProfile({ ...profile, gender: value })
                  }
                >
                  <SelectTrigger className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  maxLength={200}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      bio: e.target.value.slice(0, 200),
                    })
                  }
                  className="bg-black/30 border-white/10 text-white"
                />
                <div className="text-right text-xs text-white/40">
                  {profile.bio.length}/200
                </div>
              </div>

              {/* Save */}
              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-11 font-semibold text-white
                  bg-gradient-to-r from-purple-600 to-purple-500
                  hover:from-purple-500 hover:to-purple-400
                  shadow-lg shadow-purple-500/30
                  transition-all
                  ${loading ? "animate-pulse cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
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
