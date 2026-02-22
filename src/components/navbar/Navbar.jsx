import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { User, Bell, Bookmark, LogOut } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
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
        className={`fixed top-0 left-0 right-0 z-[1000000] transition-all duration-300 bg-[#0a0a0a] ${
          isScrolled
            ? "bg-opacity-80 backdrop-blur-md shadow-lg"
            : "bg-opacity-100"
        }`}
      >
        <div className="relative h-16 max-w-[1920px] mx-auto px-4 flex items-center">

          {/* LEFT */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg"
            >
              <FontAwesomeIcon icon={faBars} className="text-white" />
            </button>

            <Link to="/home" className="flex items-center">
              <img
                src="/logo.png"
                alt="AnimeRealm"
                className="h-8 sm:h-10 w-auto select-none"
              />
            </Link>
          </div>

          {/* CENTER — PERFECTLY CENTERED */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-3">
            <WebSearch />

            <Link
              to={location.pathname === "/random" ? "#" : "/random"}
              onClick={handleRandomClick}
              className="p-2 rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition flex-shrink-0"
              title="Random Anime"
            >
              <FontAwesomeIcon icon={faRandom} />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">

            {/* Language */}
            <div className="hidden md:flex bg-[#27272A] rounded-md p-1">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 text-sm rounded ${
                    language === lang
                      ? "bg-[#3F3F46] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

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
                  <div className="absolute right-0 mt-2 w-56 bg-[#111]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl z-[1000001] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-gray-300 truncate">
                        {profile?.username || user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <User className="h-4 w-4" /> Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/notifications");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <Bell className="h-4 w-4" /> Notifications
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/watchlist");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <Bookmark className="h-4 w-4" /> Watchlist
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
                className="bg-[#2a2a2a]/75 text-white border border-white/20"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}

            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen((p) => !p)}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-[#2a2a2a]/75 text-white/60 hover:text-white rounded-lg"
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
