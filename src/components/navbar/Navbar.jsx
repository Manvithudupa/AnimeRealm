import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTheme } from "@/src/context/ThemeContext";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "@/src/context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, LogOut, Bookmark, Bell } from "lucide-react";
import { Button } from "../ui/button";
import NotificationBell from "../notifications/NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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
        className={`fixed top-0 left-0 right-0 z-[1000000] transition-all duration-300 ease-in-out 
          ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white border-b border-gray-200'} 
          ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div className="w-full h-16 flex items-center justify-between px-2 sm:px-4 max-w-[1920px] mx-auto">
          
          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleHamburgerClick}
              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              aria-label="Menu"
            >
              <FontAwesomeIcon
                icon={faBars}
                className={`text-base sm:text-xl transition-colors ${
                  theme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'
                }`}
              />
            </button>
            <Link to="/home" className="flex-shrink-0 block">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-7 sm:h-9 w-auto object-contain max-w-[40px] sm:max-w-none"
              />
            </Link>
          </div>

          {/* CENTER: Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center mx-8">
            <div className="flex items-center gap-2 w-full max-w-[600px]">
              <WebSearch />
              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className={`p-[10px] aspect-square rounded-lg transition-colors flex items-center justify-center flex-shrink-0 
                  ${theme === 'dark' 
                    ? 'bg-[#2a2a2a]/75 text-white/50 hover:text-white' 
                    : 'bg-gray-100 text-gray-600 hover:text-black'}`}
                title="Random Anime"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-[#2a2a2a]/75 text-white/50 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-black'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              <FontAwesomeIcon 
                icon={theme === 'dark' ? faSun : faMoon} 
                className="text-lg"
              />
            </button>

            {/* Language Toggle */}
            <div className={`hidden md:flex items-center gap-2 rounded-md p-1 ${
              theme === 'dark' ? 'bg-[#27272A]' : 'bg-gray-100'
            }`}>
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    language === lang
                      ? theme === 'dark'
                        ? "bg-[#3F3F46] text-white"
                        : "bg-white text-black shadow-sm"
                      : theme === 'dark'
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-black"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* User Dropdown */}
            {user ? (
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 rounded-md flex-shrink-0">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      className="rounded-md object-cover"
                    />
                    <AvatarFallback className={`rounded-md flex items-center justify-center ${
                      theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-200'
                    }`}>
                      <User className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                      }`} />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl overflow-hidden z-[1000001] ${
                    theme === 'dark'
                      ? 'bg-[#111]/95 border-white/10'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                    }`}>
                      <p className={`text-sm truncate ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {profile?.username || user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-white/5'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/notifications");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-white/5'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/watchlist");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-white/5'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                      Watchlist
                    </button>

                    <button
                      onClick={signOut}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${
                        theme === 'dark'
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                className={`text-xs h-8 px-3 sm:text-sm sm:h-9 sm:px-4 flex-shrink-0 transition-all ${
                  theme === 'dark'
                    ? 'bg-[#2a2a2a]/75 text-white border border-white/20 hover:bg-[#3a3a3a]/75 hover:border-white/30'
                    : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}

            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className={`md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
                theme === 'dark'
                  ? 'bg-[#2a2a2a]/75 text-white/50 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-black'
              }`}
              aria-label="Search Anime"
            >
              <FontAwesomeIcon
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
                className="text-sm sm:text-base"
              />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className={theme === 'dark' ? 'bg-[#18181B]' : 'bg-gray-50 border-t border-gray-200'}>
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
