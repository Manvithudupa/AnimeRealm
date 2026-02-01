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

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [user]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    const onOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", onOutsideClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onOutsideClick);
    };
  }, []);

  const handleRandomClick = () => {
    if (location.pathname === "/random") window.location.reload();
  };

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 inset-x-0 z-[1000000]
        w-screen max-w-[100vw]
        bg-[#0a0a0a] transition-all duration-300
        ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div
          className="
          w-full max-w-screen-xl mx-auto
          h-16 px-2 sm:px-4
          flex items-center justify-between
          overflow-hidden"
        >
          {/* LEFT */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <FontAwesomeIcon
              icon={faBars}
              onClick={() => setIsSidebarOpen(true)}
              className="text-xl text-gray-200 cursor-pointer hover:text-white"
            />
            <Link to="/home" className="flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* CENTER – DESKTOP */}
          <div className="hidden md:flex flex-1 min-w-0 justify-center px-4">
            <div className="flex items-center gap-2 w-full max-w-[560px] min-w-0">
              <WebSearch />
              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className="flex-shrink-0 p-[10px] aspect-square
                bg-[#2a2a2a]/75 text-white/50
                hover:text-white rounded-lg flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faRandom} />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language */}
            <div className="hidden md:flex bg-[#27272A] p-1 rounded-md">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-2 py-1 text-sm rounded whitespace-nowrap ${
                    language === lang
                      ? "bg-[#3F3F46] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* User */}
            {user ? (
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button className="flex-shrink-0" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
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
                  rounded-xl border border-white/10 shadow-xl">
                    <div className="px-4 py-3 border-b border-white/10 text-sm text-gray-300 truncate">
                      {profile?.username || user.email}
                    </div>

                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-white/5"
                    >
                      <User className="h-4 w-4" /> Profile
                    </button>

                    <button
                      onClick={() => navigate("/watchlist")}
                      className="w-full px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-white/5"
                    >
                      <Bookmark className="h-4 w-4" /> Watchlist
                    </button>

                    <button
                      onClick={signOut}
                      className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" className="flex-shrink-0 whitespace-nowrap" onClick={() => navigate("/auth")}>
                Login
              </Button>
            )}

            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden flex-shrink-0
              w-9 h-9 rounded-lg
              bg-[#2a2a2a]/75 text-white/60
              hover:text-white flex items-center justify-center"
            >
              <FontAwesomeIcon icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
