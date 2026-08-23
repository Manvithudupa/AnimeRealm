import { useState } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/src/hooks/use-toast";
import {
  Moon,
  Sun,
  Download,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

/* ─── AniList status → AnimeRealm status ───────────────────────── */
const STATUS_MAP = {
  CURRENT: "watching",
  PLANNING: "plan_to_watch",
  COMPLETED: "completed",
  PAUSED: "on_hold",
  DROPPED: "dropped",
  REPEATING: "watching",
};

/* ─── AniList GraphQL query ─────────────────────────────────────── */
const ANILIST_QUERY = `
  query ($username: String) {
    MediaListCollection(userName: $username, type: ANIME) {
      lists {
        entries {
          status
          media {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              medium
            }
          }
        }
      }
    }
  }
`;

/* ─── Component ─────────────────────────────────────────────────── */
function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  const [anilistUsername, setAnilistUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);

  const isDark = theme === "dark";

  /* surface / text helper classes that adapt to theme */
  const card = isDark
    ? "bg-[#111] border-white/10 text-white"
    : "bg-white border-black/10 text-gray-900";
  const subtle = isDark ? "text-gray-400" : "text-gray-500";
  const inputCls = isDark
    ? "bg-white/5 border-white/20 text-white placeholder:text-gray-500"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400";

  /* ── Import handler ────────────────────────────────────────────── */
  const importFromAnilist = async () => {
    if (!anilistUsername.trim()) {
      toast({ title: "Please enter an AniList username", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "You must be logged in to import", variant: "destructive" });
      return;
    }

    setImporting(true);
    setImportStats(null);

    try {
      /* 1. Fetch from AniList */
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: ANILIST_QUERY,
          variables: { username: anilistUsername.trim() },
        }),
      });

      const json = await res.json();

      if (json.errors) {
        const msg = json.errors[0]?.message || "Failed to fetch from AniList";
        throw new Error(msg);
      }

      const lists = json?.data?.MediaListCollection?.lists ?? [];
      const entries = lists.flatMap((l) => l.entries);

      if (entries.length === 0) {
        toast({
          title: "No anime found",
          description: "This AniList user has an empty anime list.",
        });
        setImporting(false);
        return;
      }

      /* 2. Fetch existing watchlist to avoid duplicates */
      const { data: existing, error: fetchErr } = await supabase
        .from("watchlists")
        .select("anime_id")
        .eq("user_id", user.id);

      if (fetchErr) throw fetchErr;

      const existingIds = new Set((existing ?? []).map((w) => w.anime_id));

      /* 3. Filter & map entries */
      const toInsert = entries
        .filter((e) => !existingIds.has(String(e.media.id)))
        .map((e) => ({
          user_id: user.id,
          anime_id: String(e.media.id),
          anime_title: e.media.title.english || e.media.title.romaji,
          anime_poster:
            e.media.coverImage?.large || e.media.coverImage?.medium || null,
          status: STATUS_MAP[e.status] ?? "plan_to_watch",
        }));

      const skipped = entries.length - toInsert.length;

      /* 4. Batch insert */
      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase
          .from("watchlists")
          .insert(toInsert);
        if (insertErr) throw insertErr;
      }

      const stats = {
        imported: toInsert.length,
        skipped,
        total: entries.length,
      };
      setImportStats(stats);

      toast({
        title: "Import complete! 🎉",
        description: `${stats.imported} anime imported, ${stats.skipped} already in your watchlist.`,
      });
    } catch (err) {
      toast({
        title: "Import failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className={`pt-20 max-md:pt-16 pb-16 px-4 transition-colors duration-300 ${isDark ? "" : "bg-gray-50"}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page title */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Settings
          </h1>
          <p className={`text-sm mt-1 ${subtle}`}>
            Manage your preferences and connected services.
          </p>
        </div>

        {/* ── Appearance ── */}
        <section className={`border rounded-xl p-6 space-y-5 ${card}`}>
          <div>
            <h2 className="text-base font-semibold">Appearance</h2>
            <p className={`text-sm mt-0.5 ${subtle}`}>
              Choose your preferred color theme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark option */}
            <button
              onClick={() => !isDark && toggleTheme()}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                isDark
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-transparent bg-black/5 hover:bg-black/10"
              }`}
            >
              <Moon className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-gray-500"}`} />
              <span className={`text-sm font-medium ${isDark ? "text-purple-300" : "text-gray-600"}`}>
                Dark
              </span>
              {isDark && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>

            {/* Light option */}
            <button
              onClick={() => isDark && toggleTheme()}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                !isDark
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-transparent bg-white/5 hover:bg-white/10"
              }`}
            >
              <Sun className={`w-5 h-5 ${!isDark ? "text-blue-500" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${!isDark ? "text-blue-600" : "text-gray-400"}`}>
                Light
              </span>
              {!isDark && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 bg-blue-500/20 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
        </section>

        {/* ── AniList import ── */}
        <section className={`border rounded-xl p-6 space-y-5 ${card}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Import from AniList</h2>
              <p className={`text-sm mt-0.5 ${subtle}`}>
                Sync your AniList anime library into AnimeRealm. Anime already
                in your watchlist won&apos;t be overwritten.
              </p>
            </div>
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-shrink-0 flex items-center gap-1 text-xs ${subtle} hover:text-blue-400 transition-colors`}
            >
              AniList <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Input row */}
          <div className="space-y-2">
            <Label
              htmlFor="anilist-username"
              className={isDark ? "text-gray-300" : "text-gray-700"}
            >
              AniList Username
            </Label>
            <div className="flex gap-2">
              <Input
                id="anilist-username"
                placeholder="e.g. YourUsername"
                value={anilistUsername}
                onChange={(e) => setAnilistUsername(e.target.value)}
                className={inputCls}
                onKeyDown={(e) => e.key === "Enter" && importFromAnilist()}
              />
              <Button
                onClick={importFromAnilist}
                disabled={importing}
                className="bg-white text-black font-semibold hover:bg-white/90 flex-shrink-0 gap-2 border-0"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {importing ? "Importing…" : "Import"}
              </Button>
            </div>
          </div>

          {/* Status mapping legend */}
          <div className={`rounded-lg p-3 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
            <p className={`text-xs font-medium mb-2 ${subtle}`}>
              How AniList statuses map to AnimeRealm:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ["Current / Rewatching", "Watching"],
                ["Planning", "Plan to Watch"],
                ["Completed", "Completed"],
                ["Paused", "On Hold"],
                ["Dropped", "Dropped"],
              ].map(([from, to]) => (
                <div key={from} className="flex items-center gap-1.5 text-xs">
                  <span className={subtle}>{from}</span>
                  <span className={subtle}>→</span>
                  <span className={isDark ? "text-gray-200" : "text-gray-700"}>
                    {to}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Import result */}
          {importStats && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                isDark
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className={`font-medium ${isDark ? "text-green-300" : "text-green-700"}`}>
                  Import successful!
                </p>
                <p className={isDark ? "text-green-400/70" : "text-green-600"}>
                  <strong>{importStats.imported}</strong> anime imported ·{" "}
                  <strong>{importStats.skipped}</strong> already in watchlist ·{" "}
                  <strong>{importStats.total}</strong> total on AniList
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Settings;
