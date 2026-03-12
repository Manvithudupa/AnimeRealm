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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import {
  Loader2,
  User,
  Pencil,
  Mail,
  Calendar,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Save,
  LogOut,
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast.js";
import { useNavigate } from "react-router-dom";
import CharacterSelectModal from "@/src/components/characterselectmodal/CharacterSelectModal";

export const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [profile, setProfile] = useState({
    username: "",
    gender: "",
    bio: "",
    avatar_url: "",
    banner_url: "",
  });

  // Pending selections – applied only when "Save Profile" is clicked
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [pendingBanner, setPendingBanner] = useState(null);

  /* ---------- Redirect if not logged in ---------- */
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  /* ---------- Load profile ---------- */
  useEffect(() => {
    if (!user || authLoading) return;

    let mounted = true;

    const loadProfile = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (mounted && data) {
          setProfile({
            username: data.username || "",
            gender: data.gender || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
            banner_url: data.banner_url || "",
          });
        }
      } catch (error) {
        console.error("Load profile error:", error);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id, authLoading]);

  /* ---------- Handle Character / Banner Selection ---------- */
  const handleCharacterSelect = (imageUrl) => {
    setPendingAvatar(imageUrl);
  };

  const handleBannerSelect = (bannerUrl) => {
    setPendingBanner(bannerUrl);
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

    // Apply pending selections
    const finalAvatar = pendingAvatar ?? profile.avatar_url;
    const finalBanner = pendingBanner ?? profile.banner_url;

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          username: profile.username,
          gender: profile.gender,
          bio: profile.bio,
          avatar_url: finalAvatar,
          banner_url: finalBanner,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      // Commit pending selections into profile state
      setProfile((p) => ({
        ...p,
        avatar_url: finalAvatar,
        banner_url: finalBanner,
      }));
      setPendingAvatar(null);
      setPendingBanner(null);

      toast({ title: "Profile Saved ✨" });
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

  /* ---------- Delete Account ---------- */
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);

    try {
      const { error } = await supabase.rpc("delete_current_user");
      if (error) throw error;

      await signOut();
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been removed.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  /* ---------- Helpers ---------- */
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const displayName =
    profile.username || user?.email?.split("@")[0] || "Anime Fan";

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

      {/* Character Selection Modal */}
      <CharacterSelectModal
        isOpen={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        onSelect={handleCharacterSelect}
        onSelectBanner={handleBannerSelect}
        gender={profile.gender}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <div
            className="bg-[#141414] border border-red-500/30 rounded-xl p-6 space-y-5
            shadow-2xl shadow-red-900/20"
          >
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/15 border border-red-500/25">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <DialogTitle className="text-white text-lg font-semibold">
                  Delete Account
                </DialogTitle>
              </div>
              <DialogDescription className="text-white/60 text-sm leading-relaxed pt-1">
                This action is{" "}
                <span className="text-red-400 font-medium">permanent</span> and
                cannot be undone. All your watchlist, notifications, and profile
                data will be erased.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <p className="text-xs text-white/50">
                Type{" "}
                <span className="font-mono text-red-400 select-none">
                  DELETE
                </span>{" "}
                to confirm
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2
                  text-white text-sm placeholder-white/30
                  focus:outline-none focus:border-red-500/60 transition"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 h-10 rounded-lg border border-white/20 text-white/70
                  hover:bg-white/5 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700
                  text-white text-sm font-semibold transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Hero Banner ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {(pendingBanner || profile.banner_url) ? (
          <>
            <img
              src={pendingBanner || profile.banner_url}
              alt="Profile banner"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #1a0533 0%, #0d1a3a 50%, #0a1a2e 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 20% 50%, #7c3aed44 0%, transparent 60%), " +
                  "radial-gradient(ellipse at 80% 20%, #3b82f644 0%, transparent 60%)",
              }}
            />
            {/* Decorative grid lines */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), " +
                  "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </>
        )}
        {pendingBanner && (
          <span className="absolute top-2 right-2 text-[10px] bg-black/60 text-white/70 px-2 py-0.5 rounded-full">
            Unsaved preview
          </span>
        )}
      </div>

      {/* ── Main ── */}
      <main className="max-w-2xl mx-auto px-4 pb-16 -mt-16 sm:-mt-20 relative z-10">
        {/* ── Profile Card ── */}
        <Card className="bg-[#111] border border-white/10 shadow-2xl shadow-black/60 rounded-2xl overflow-hidden">
          {/* Avatar & name row */}
          <CardHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-white/8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                {/* Gradient ring (decorative); ring-white/20 ensures avatar remains
                    distinguishable from the background for users with color vision
                    deficiencies. */}
                <div className={`p-0.5 rounded-full ring-2 ring-white/15 ${
                  pendingAvatar
                    ? "bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400"
                    : "bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400"
                }`}>
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-[#111]">
                    <AvatarImage
                      src={pendingAvatar || profile.avatar_url || "/default-avatar.png"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#1a1a1a]">
                      <User className="h-10 w-10 text-white/40" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCharacterModal(true)}
                  className="absolute bottom-1 right-1 bg-white hover:bg-gray-200 text-black
                    p-1.5 rounded-full shadow-lg transition-transform active:scale-90"
                  title="Change avatar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Name & meta */}
              <div className="flex-1 text-center sm:text-left pb-1">
                <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                  {displayName}
                </CardTitle>

                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-white/45">
                  {user?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Joined {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Form */}
          <CardContent className="px-4 sm:px-6 py-5">
            <form onSubmit={updateProfile} className="space-y-5">
              {/* Avatar hint */}
              {!profile.gender && !pendingAvatar && (
                <p className="text-xs text-white/40 -mt-1 text-center sm:text-left">
                  Set your gender below to filter avatar characters
                </p>
              )}
              {(pendingAvatar || pendingBanner) && (
                <p className="text-xs text-amber-400/80 -mt-1 text-center sm:text-left">
                  {pendingAvatar && pendingBanner
                    ? "Avatar & Banner"
                    : pendingAvatar
                    ? "Avatar"
                    : "Banner"}{" "}
                  selected — click Save Profile to apply
                </p>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wide">
                  Username
                </Label>
                <Input
                  value={profile.username}
                  maxLength={25}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  placeholder="Your display name"
                  className="bg-[#0f0f0f] border-white/15 text-white
                    focus:border-purple-500/70 focus:ring-purple-500/30 h-10"
                />
                <div className="text-right text-xs text-white/35">
                  {profile.username.length}/25
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wide">
                  Gender
                </Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) =>
                    setProfile({ ...profile, gender: value })
                  }
                >
                  <SelectTrigger
                    className="bg-[#0f0f0f] border-white/15 text-white h-10
                      focus:border-purple-500/70 [&>svg]:text-white/60"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/15 text-white">
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
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wide">
                  Bio
                </Label>
                <Textarea
                  rows={3}
                  maxLength={200}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself…"
                  className="bg-[#0f0f0f] border-white/15 text-white resize-none
                    focus:border-purple-500/70 focus:ring-purple-500/30"
                />
                <div className="text-right text-xs text-white/35">
                  {profile.bio.length}/200
                </div>
              </div>

              {/* Actions row */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={signOut}
                  className="h-10 px-4 border border-white/15 text-white/60
                    hover:bg-white/5 hover:text-white/80 transition"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 bg-white text-black font-semibold
                    hover:bg-gray-200
                    shadow-lg
                    transition-all active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Danger Zone Card ── */}
        <Card
          className="mt-6 bg-[#111] border border-red-500/20
            shadow-xl shadow-black/40 rounded-2xl overflow-hidden"
        >
          <CardHeader className="px-4 sm:px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400/80" />
              <CardTitle className="text-sm font-semibold text-red-400/80 uppercase tracking-wider">
                Danger Zone
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-5">
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between
              gap-4 p-4 rounded-xl bg-red-950/20 border border-red-500/15"
            >
              <div>
                <p className="text-sm font-medium text-white/80">
                  Delete Account
                </p>
                <p className="text-xs text-white/45 mt-0.5 max-w-xs">
                  Permanently remove your account and all associated data. This
                  cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="shrink-0 flex items-center justify-center gap-2 h-9 px-4 rounded-lg
                  border border-red-500/40 text-red-400 text-sm font-medium
                  hover:bg-red-500/15 hover:border-red-400/60 transition-all active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Account
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
