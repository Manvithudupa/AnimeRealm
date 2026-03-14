import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { User, Bell, Bookmark, LogOut, Settings, Moon, Sun } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/context/ThemeContext";
import { useEpisodeCheck } from "@/src/hooks/useEpisodeCheck";
import MobileSearch from "../searchbar/MobileSearch";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "@/src/context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NotificationBell from "../notifications/NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Run episode check in the background — decoupled from the notification dropdown
  useEpisodeCheck();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRandomClick = (e) => {
    if (location.pathname === "/random") {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000000] transition-all duration-300 ${
          theme === "dark"
            ? `bg-[#0a0a0a] ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`
            : `bg-white ${isScrolled ? "bg-opacity-90 backdrop-blur-md shadow-sm border-b border-black/8" : "bg-opacity-100 border-b border-black/8"}`
        }`}
      >
        <div className="relative h-16 max-w-[1920px] mx-auto px-4 flex items-center">

          {/* LEFT */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"}`}
            >
              <FontAwesomeIcon icon={faBars} className={theme === "dark" ? "text-white" : "text-gray-700"} />
            </button>

            <Link to="/home" className="flex items-center">
              <img
                src="/logo.png"
                alt="AnimeRealm"
                className="h-[clamp(0.9rem,1.8vw,1.45rem)] w-auto select-none"
              />
            </Link>
          </div>

          {/* CENTER — PERFECTLY CENTERED */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-3">
            <WebSearch />

            <Link
              to={location.pathname === "/random" ? "#" : "/random"}
              onClick={handleRandomClick}
              className={`p-2 rounded-lg transition flex-shrink-0 ${
                theme === "dark"
                  ? "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
                  : "bg-black/5 text-gray-500 hover:text-gray-900 hover:bg-black/10"
              }`}
              title="Random Anime"
            >
              <FontAwesomeIcon icon={faRandom} />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">

            {/* Language */}
            <div className={`hidden md:flex rounded-md p-1 ${theme === "dark" ? "bg-[#27272A]" : "bg-gray-100"}`}>
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 text-sm rounded ${
                    language === lang
                      ? theme === "dark"
                        ? "bg-[#3F3F46] text-white"
                        : "bg-white text-gray-900 shadow-sm"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`hidden md:flex w-9 h-9 items-center justify-center rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-white/5 text-yellow-300 hover:bg-white/10"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* Profile */}
            {user ? (
              <div className="relative flex-shrink-0" ref={profileRef}>
                <button onClick={() => setIsProfileOpen((p) => !p)}>
                  <Avatar className="h-9 w-9 aspect-square rounded-md flex-shrink-0">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#2a2a2a]">
                      <User className="h-5 w-5 text-white/70" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isProfileOpen && (
                  <div className={`absolute right-0 mt-2 w-56 backdrop-blur-xl rounded-xl border shadow-xl z-[1000001] overflow-hidden ${
                    theme === "dark"
                      ? "bg-[#111]/95 border-white/10"
                      : "bg-white/95 border-black/10"
                  }`}>
                    <div className={`px-4 py-3 border-b ${theme === "dark" ? "border-white/10" : "border-black/10"}`}>
                      <p className={`text-sm truncate ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {profile?.username || user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/profile");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${
                        theme === "dark" ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-black/5"
                      }`}
                    >
                      <User className="h-4 w-4" /> Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/notifications");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${
                        theme === "dark" ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-black/5"
                      }`}
                    >
                      <Bell className="h-4 w-4" /> Notifications
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/watchlist");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${
                        theme === "dark" ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-black/5"
                      }`}
                    >
                      <Bookmark className="h-4 w-4" /> Watchlist
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/settings");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${
                        theme === "dark" ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-black/5"
                      }`}
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </button>

                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                className={`border ${
                  theme === "dark"
                    ? "bg-[#2a2a2a]/75 text-white border-white/20"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}

            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen((p) => !p)}
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg ${
                theme === "dark"
                  ? "bg-[#2a2a2a]/75 text-white/60 hover:text-white"
                  : "bg-black/5 text-gray-500 hover:text-gray-900"
              }`}
            >
              <FontAwesomeIcon
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
              />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}
      </nav>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </SearchProvider>
  );
}

export default Navbar;
