import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { User, Bell, Bookmark, LogOut, Settings, LogIn } from "lucide-react";
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
  const { theme } = useTheme();

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
          isScrolled
            ? "bg-black/80 backdrop-blur-md shadow-lg"
            : "bg-gradient-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="relative h-16 w-full mx-auto px-4 md:px-8 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:opacity-80 transition-opacity"
            >
              <FontAwesomeIcon icon={faBars} className="text-white text-xl" />
            </button>

            <Link to="/home" className="flex items-center">
              <span className="text-white font-black text-2xl tracking-tighter">
                ANIMEREALM
              </span>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:block">
              <WebSearch />
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="text-white/80 hover:text-white transition-colors">
                <Bell size={22} />
              </button>

              {/* Profile/Auth */}
              {user ? (
                <div className="relative flex-shrink-0" ref={profileRef}>
                  <button onClick={() => setIsProfileOpen((p) => !p)} className="flex items-center">
                    <Avatar className="h-8 w-8 rounded-full border-2 border-white/20">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-zinc-800">
                        <User className="h-4 w-4 text-white/70" />
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-[1000001] overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">
                          {profile?.username || user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/profile");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User size={18} /> Profile
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/watchlist");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Bookmark size={18} /> Watchlist
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/settings");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings size={18} /> Settings
                        </button>

                        <div className="h-px bg-white/10 my-2" />

                        <button
                          onClick={signOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Login"
                >
                  <LogIn size={24} />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen((p) => !p)}
              className="md:hidden text-white/80 hover:text-white transition-colors"
            >
              <FontAwesomeIcon
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
                className="text-xl"
              />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}
      </nav>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </SearchProvider>
  );
}

export default Navbar;
