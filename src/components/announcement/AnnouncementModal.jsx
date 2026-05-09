import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, Sparkles, User, Settings, MonitorPlay, MessageSquare, ArrowRight } from "lucide-react";

const ANNOUNCEMENT_KEY = "animerealm_announcement_v1_seen";

function AnnouncementModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
    setOpen(false);
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111] border border-white/10 shadow-2xl animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#111] border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">What&apos;s New &amp; Important Updates</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Apology Section */}
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Important Notice — Data Loss</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  We sincerely apologise — <span className="text-white font-medium">all watchlist, continue watching, and notification data has been deleted</span> because HiAnime has completely shut down. We are deeply sorry for any inconvenience this has caused. Please rebuild your watchlist using the new features below.
                </p>
              </div>
            </div>
          </div>

          {/* New Features */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">New Features</h3>
            <div className="space-y-3">

              {/* Profile Page */}
              <div className="flex items-start gap-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 p-4 transition-colors">
                <div className="p-2 rounded-lg bg-blue-500/20 shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white mb-0.5">Profile Page — Banner Image</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Your profile now supports a custom <span className="text-white/80 font-medium">banner image</span>. Head to your profile to personalise it and complete your profile setup — it only takes a moment!
                  </p>
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Go to Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-start gap-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 p-4 transition-colors">
                <div className="p-2 rounded-lg bg-purple-500/20 shrink-0">
                  <Settings className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white mb-0.5">Settings — Theme &amp; AniList Import</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Switch between <span className="text-white/80 font-medium">Dark &amp; Light mode</span> and easily <span className="text-white/80 font-medium">import your watchlist from AniList</span> in the Settings page. Restore your anime list in seconds!
                  </p>
                  <button
                    onClick={() => handleNavigate("/settings")}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Go to Settings <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Watch Sources */}
              <div className="flex items-start gap-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 p-4 transition-colors">
                <div className="p-2 rounded-lg bg-green-500/20 shrink-0">
                  <MonitorPlay className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white mb-0.5">Watch Page — 2 Anime Sources</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    The watch page now integrates <span className="text-white/80 font-medium">two different anime streaming sources</span> and automatically switches if one is down.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Coming Soon + Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="font-semibold text-white text-sm">More Updates Coming!</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                We&apos;re working hard on exciting new features and improvements. Stay tuned — many more updates are on the way! 🚀
              </p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <h4 className="font-semibold text-white text-sm">Suggest a Feature</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-2">
                Have an idea for a new feature? We&apos;d love to hear it — reach out through our Contact page!
              </p>
              <button
                onClick={() => handleNavigate("/contact")}
                className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Contact Us <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-[#111] border-t border-white/10 flex items-center justify-between gap-4">
          <p className="text-xs text-white/40">This notice will not appear again after closing.</p>
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors shrink-0"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementModal;
