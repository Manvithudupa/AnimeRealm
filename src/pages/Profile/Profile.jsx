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
  }, [user, authLoading, navigate]);

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
      console.error("Load profile error:", error);
    }
  };

  /* ---------- Generate Gender-Based Avatar ---------- */
  const generateRandomAvatar = async () => {
    // Check if gender is selected
    if (!profile.gender) {
      toast({
        title: "Gender Required",
        description: "Please select your gender first to generate an avatar",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Map gender to AniList gender filter
      let genderFilter = "";
      
      if (profile.gender === "male") {
        genderFilter = "Male";
      } else if (profile.gender === "female") {
        genderFilter = "Female";
      } else {
        // For non-binary or prefer-not-to-say, get random from both
        genderFilter = Math.random() > 0.5 ? "Male" : "Female";
      }

      // Fetch multiple pages to get more main characters
      const pagesToFetch = [1, 2, 3]; // First 3 pages have the most popular characters
      const allCharacters = [];

      for (const page of pagesToFetch) {
        const query = `
          query {
            Page(page: ${page}, perPage: 50) {
              characters(sort: FAVOURITES_DESC) {
                image {
                  large
                }
                gender
                favourites
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

        if (!response.ok) {
          console.warn(`Failed to fetch page ${page}`);
          continue;
        }

        const result = await response.json();

        if (result.errors) {
          console.warn(`API errors on page ${page}:`, result.errors);
          continue;
        }

        if (result.data?.Page?.characters) {
          allCharacters.push(...result.data.Page.characters);
        }
      }

      if (allCharacters.length === 0) {
        throw new Error("No characters found");
      }

      // Filter by gender and ensure they have images
      const filteredCharacters = allCharacters.filter(
        (char) => char.image?.large && char.gender === genderFilter
      );

      // If no characters match the gender, fallback to any character with image
      const charactersToUse = filteredCharacters.length > 0 
        ? filteredCharacters 
        : allCharacters.filter((char) => char.image?.large);

      if (charactersToUse.length === 0) {
        throw new Error("No characters with images found");
      }

      // Sort by favourites to prioritize main/popular characters
      const sortedCharacters = charactersToUse.sort((a, b) => 
        (b.favourites || 0) - (a.favourites || 0)
      );

      // Pick from top 30% of most popular characters for better quality
      const topCharacters = sortedCharacters.slice(
        0, 
        Math.ceil(sortedCharacters.length * 0.3)
      );

      // Pick a random character from the top picks
      const random =
        topCharacters[Math.floor(Math.random() * topCharacters.length)];

      setProfile((p) => ({
        ...p,
        avatar_url: random.image.large,
      }));

      toast({
        title: "Avatar Updated 👌",
        description: `Generated ${random.gender?.toLowerCase() || genderFilter.toLowerCase()} character avatar`,
      });
    } catch (error) {
      console.error("Avatar generation error:", error);

      toast({
        title: "Error",
        description: error.message || "Avatar generation failed 😖",
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
        title: "Limit exceeded",
        description: "Username ≤25, Bio ≤200",
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
        title: "Profile Saved ✨",
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

  /* ---------- Loading ---------- */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Main */}
      <main className="flex justify-center px-4 pt-20 pb-12">
        <Card
          className="w-full max-w-lg bg-[#111]
          border border-white/25
          shadow-xl shadow-black/60
          rounded-xl"
        >
          {/* Header */}
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-2xl font-semibold">
              Profile
            </CardTitle>

            <CardDescription className="text-white/60">
              Edit your profile
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent>
            <form
              onSubmit={updateProfile}
              className="space-y-5"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border border-white/20">
                  <AvatarImage
                    src={profile.avatar_url || "/default-avatar.png"}
                    className="object-cover"
                  />

                  <AvatarFallback className="bg-black/50">
                    <User className="h-10 w-10 text-white/60" />
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  size="sm"
                  onClick={generateRandomAvatar}
                  disabled={generating || !profile.gender}
                  className="bg-white hover:bg-gray-200
                  text-black font-medium
                  px-4 py-2 rounded-lg
                  shadow-md transition
                  disabled:opacity-60
                  disabled:cursor-not-allowed"
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
                
                {!profile.gender && (
                  <p className="text-xs text-white/50 text-center">
                    Select gender to generate avatar
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1">
                <Label className="text-white/80 text-sm">
                  Username
                </Label>

                <Input
                  value={profile.username}
                  maxLength={25}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      username: e.target.value,
                    })
                  }
                  className="bg-[#0f0f0f]
                  border-white/25
                  text-white
                  focus:border-purple-500
                  focus:ring-purple-500"
                />

                <div className="text-right text-xs text-white/50">
                  {profile.username.length}/25
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <Label className="text-white/80 text-sm">
                  Gender
                </Label>

                <Select
                  value={profile.gender}
                  onValueChange={(value) =>
                    setProfile({ ...profile, gender: value })
                  }
                >
                  <SelectTrigger
                    className="bg-[#0f0f0f]
                    border-white/25
                    text-white
                    focus:border-purple-500
                    focus:ring-purple-500
                    [&>svg]:text-white/80"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>

                  <SelectContent className="bg-[#111] border-white/25 text-white">
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
              <div className="space-y-1">
                <Label className="text-white/80 text-sm">
                  Bio
                </Label>

                <Textarea
                  rows={3}
                  maxLength={200}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      bio: e.target.value,
                    })
                  }
                  className="bg-[#0f0f0f]
                  border-white/25
                  text-white
                  focus:border-purple-500
                  focus:ring-purple-500"
                />

                <div className="text-right text-xs text-white/50">
                  {profile.bio.length}/200
                </div>
              </div>

              {/* Save */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10
                bg-white hover:bg-gray-200
                text-black font-semibold
                transition active:scale-95
                disabled:opacity-60
                disabled:cursor-not-allowed"
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
