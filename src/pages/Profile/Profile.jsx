import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/integrations/supabase/client";
import Navbar from "@/src/components/navbar/Navbar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
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

  /* ---------- Redirect if not logged in ---------- */
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading]);

  /* ---------- Load profile ---------- */
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

  /* ---------- Avatar Generator ---------- */
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
        title: "Avatar Updated",
        description: "New anime avatar applied 💜",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to generate avatar",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  /* ---------- Save Profile ---------- */
  const updateProfile = async (e) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    if (profile.username.length > 25 || profile.bio.length > 200) {
      toast({
        title: "Limit Exceeded",
        description: "Username ≤ 25, Bio ≤ 200 characters",
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
        title: "Profile Saved",
        description: "Your changes were saved successfully ✨",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Loading Screen ---------- */
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

      {/* Main */}
      <main className="flex justify-center px-3 sm:px-6 pt-20 sm:pt-24 pb-12">

        <Card
          className="w-full max-w-md sm:max-w-xl
          bg-white/5 backdrop-blur-xl
          border border-white/10
          shadow-2xl shadow-purple-900/20
          rounded-2xl sm:rounded-3xl
          transition"
        >
          {/* Header */}
          <CardHeader className="text-center pb-3">

            <CardTitle className="text-2xl sm:text-3xl font-semibold">
              Profile Settings
            </CardTitle>

            <CardDescription className="text-white/40">
              Customize your anime identity
            </CardDescription>

          </CardHeader>

          {/* Content */}
          <CardContent>

            <form
              onSubmit={updateProfile}
              className="space-y-6 sm:space-y-8"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">

                <Avatar
                  className="h-24 w-24 sm:h-32 sm:w-32
                  rounded-xl sm:rounded-2xl
                  border border-white/10
                  shadow-lg shadow-black/40"
                >
                  <AvatarImage
                    src={profile.avatar_url || "/default-avatar.png"}
                    className="object-cover"
                  />

                  <AvatarFallback className="bg-black/40 flex items-center justify-center">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-white/40" />
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomAvatar}
                  disabled={generating}
                  className="bg-black/30 text-white border-white/10
                  hover:bg-black/50 transition"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
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
                  placeholder="Your username"
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      username: e.target.value.slice(0, 25),
                    })
                  }
                  className="bg-black/30 border-white/10 text-white
                  placeholder:text-white/30"
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
                  <SelectTrigger
                    className="bg-black/30 border-white/10 text-white"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>

                  <SelectContent className="bg-[#111] border-white/10 text-white">
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
                  value={profile.bio}
                  rows={4}
                  maxLength={200}
                  placeholder="Write something cool..."
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      bio: e.target.value.slice(0, 200),
                    })
                  }
                  className="bg-black/30 border-white/10 text-white
                  placeholder:text-white/30"
                />

                <div className="text-right text-xs text-white/40">
                  {profile.bio.length}/200
                </div>

              </div>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-11
                font-semibold text-white
                bg-gradient-to-r from-purple-600 to-purple-500
                hover:from-purple-500 hover:to-purple-400
                shadow-lg shadow-purple-600/30
                transition-all duration-200
                active:scale-95"
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
