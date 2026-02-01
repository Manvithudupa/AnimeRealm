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
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => setIsDropdownOpen(false), [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) ||
        langDropdownRef.current && !langDropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
        setIsLangDropdownOpen(false);
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
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faBars}
              className="text-xl text-gray-200 cursor-pointer hover:text-white transition-colors md:hidden"
              onClick={handleHamburgerClick}
            />
            <Link to="/home">
              <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
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

          {/* RIGHT: Mobile Search + Login/User + Language */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Mobile: Search + Login (if not logged in) */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                className="p-2 bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg flex items-center justify-center w-10 h-10"
                title={isMobileSearchOpen ? "Close Search" : "Search Anime"}
              >
                <FontAwesomeIcon
                  icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
                  className="w-5 h-5"
                />
              </button>

              {!user && (
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Login
                </Button>
              )}
            </div>

            {/* Language Dropdown - Mobile */}
            <div className="md:hidden relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                className="p-2 bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg flex items-center justify-center w-10 h-10"
                title="Change Language"
              >
                {language}
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-[#111]/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg overflow-hidden z-50">
                  {["EN", "JP"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { toggleLanguage(lang); setIsLangDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      className="rounded-md object-cover"
                    />
                    <AvatarFallback className="bg-[#2a2a2a] rounded-md flex items-center justify-center">
                      <User className="h-5 w-5 text-white/70" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl overflow-hidden z-50">
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
            )}

          </div>
        </div>

        {/* Mobile Search Dropdown */}
        <div
          className={`md:hidden bg-[#18181B] shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileSearchOpen ? "max-h-96 py-3" : "max-h-0 py-0"
          }`}
        >
          <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
        </div>

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
