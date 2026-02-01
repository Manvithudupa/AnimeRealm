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

  // Close dropdown on auth change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [user]);

  // Scroll effect & outside click
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

  const handleHamburgerClick = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  const handleRandomClick = () => {
    if (location.pathname === "/random") {
      window.location.reload();
    }
  };

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000] transition-all duration-300 ease-in-out bg-[#0a0a0a] ${
          isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-4">

          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            <FontAwesomeIcon
              icon={faBars}
              className="text-base sm:text-xl text-gray-200 cursor-pointer hover:text-white transition-colors"
              onClick={handleHamburgerClick}
            />
            <Link to="/home" className="flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-6 sm:h-9 w-auto" />
            </Link>
          </div>

          {/* CENTER: Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center mx-8">
            <div className="flex items-center gap-2 w-[600px]">
              <WebSearch />
              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title="Random Anime"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
              </Link>
            </div>
          </div>

          {/* RIGHT: User + Language + Mobile Search */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

            {/* Language Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-2 bg-[#27272A] rounded-md p-1">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    language === lang
                      ? "bg-[#3F3F46] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-7 w-7 sm:h-10 sm:w-10 rounded-md">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      className="rounded-md object-cover"
                    />
                    <AvatarFallback className="bg-[#2a2a2a] rounded-md flex items-center justify-center">
                      <User className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white/70" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-gray-300 truncate">
                        {profile?.username || user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate("/watchlist"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <Bookmark className="h-4 w-4" />
                      Watchlist
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" className="text-xs px-2.5 h-7 sm:text-sm sm:px-4 sm:h-9" onClick={() => navigate("/auth")}>
                Login
              </Button>
            )}

            {/* Mobile Search */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                className="p-1.5 sm:p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center w-7 h-7 sm:w-[38px] sm:h-[38px]"
                title={isMobileSearchOpen ? "Close Search" : "Search Anime"}
              >
                <FontAwesomeIcon
                  icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
                  className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] transition-transform duration-200"
                  style={{ transform: isMobileSearchOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
