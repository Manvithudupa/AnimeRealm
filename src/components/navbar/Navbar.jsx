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
import { User, LogOut, Bookmark, Bell } from "lucide-react";
import { Button } from "../ui/button";
import NotificationBell from "../notifications/NotificationBell";

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
        className={`fixed top-0 left-0 right-0 z-[1000000] transition-all duration-300 ease-in-out bg-[#0a0a0a] ${
          isScrolled
            ? "bg-opacity-80 backdrop-blur-md shadow-lg"
            : "bg-opacity-100"
        }`}
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
                className="text-base sm:text-xl text-gray-200 hover:text-white transition-colors"
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
                className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                title="Random Anime"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
            
            {/* Language Toggle */}
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
                    <AvatarFallback className="bg-[#2a2a2a] rounded-md flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl overflow-hidden z-[1000001]">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-gray-300 truncate">
                        {profile?.username || user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/notifications");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/watchlist");
                      }}
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
              <Button
                size="sm"
                className="text-xs h-8 px-3 sm:text-sm sm:h-9 sm:px-4 flex-shrink-0 bg-[#2a2a2a]/75 text-white border border-white/20 hover:bg-[#3a3a3a]/75 hover:border-white/30 transition-all"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}

            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex-shrink-0"
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
