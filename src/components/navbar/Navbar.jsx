import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import MobileSearch from "../searchbar/MobileSearch";

import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, LogOut, Bookmark } from "lucide-react";
import { Button } from "../ui/button";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // close dropdown when auth changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRandomClick = () => {
    if (location.pathname === "/random") {
      window.location.reload();
    }
  };

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000]
        bg-[#0a0a0a] transition-all duration-300
        ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 h-16 flex items-center justify-between min-w-0">

          {/* LEFT */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <FontAwesomeIcon
              icon={faBars}
              className="text-xl text-gray-200 cursor-pointer hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            />
            <Link to="/home">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* CENTER – desktop only */}
          <div className="hidden md:flex flex-1 justify-center px-6 min-w-0">
            <div className="flex items-center gap-2 w-full max-w-[600px]">
              <WebSearch />
              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className="p-[10px] aspect-square bg-[#2a2a2a]/75
                text-white/50 hover:text-white rounded-lg
                flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faRandom} />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Language toggle */}
            <div className="hidden md:flex items-center gap-1 bg-[#27272A] rounded-md p-1">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-2 py-1 text-sm rounded ${
                    language === lang
                      ? "bg-[#3F3F46] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* User / Login */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-[#2a2a2a]">
                      <User className="h-4 w-4 text-white/70" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 z-50
                    bg-[#111]/95 backdrop-blur-xl
                    rounded-xl border border-white/10 shadow-xl"
                  >
                    <div className="px-4 py-3 border-b border-white/10
                      text-sm text-gray-300 truncate">
                      {profile?.username || user.email}
                    </div>

                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
                      className="w-full flex items-center gap-3 px-4 py-3
                      text-gray-300 hover:bg-white/5"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate("/watchlist"); }}
                      className="w-full flex items-center gap-3 px-4 py-3
                      text-gray-300 hover:bg-white/5"
                    >
                      <Bookmark className="h-4 w-4" />
                      Watchlist
                    </button>

                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3
                      text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>
                Login
              </Button>
            )}

            {/* Mobile search */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-[10px] bg-[#2a2a2a]/75
              text-white/60 hover:text-white
              rounded-lg w-9 h-9 flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>

        {/* Mobile search dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
