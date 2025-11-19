import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../../context/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "../../context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";

// Auth + Avatar UI
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import { Button } from "../ui/button";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { user, profile, signOut } = useAuth(); // 🔥 Auth hook

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sidebar handlers
  const handleHamburgerClick = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  const handleRandomClick = () => {
    if (location.pathname === "/random") window.location.reload();
  };

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000] transition-all duration-300 ease-in-out bg-[#0a0a0a]
          ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <FontAwesomeIcon
                icon={faBars}
                className="text-xl text-gray-200 cursor-pointer hover:text-white transition-colors"
                onClick={handleHamburgerClick}
              />
              <Link to="/home" className="flex items-center">
                <img src="/logo.png" alt="An!meRealm Logo" className="h-9 w-auto" />
              </Link>
            </div>
          </div>

          {/* CENTER SEARCH BAR (Desktop) */}
          <div className="flex-1 flex justify-center items-center max-w-none mx-8 hidden md:flex">
            <div className="flex items-center gap-2 w-[600px]">
              <WebSearch />

              {/* RANDOM BUTTON */}
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

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">

            {/* LANGUAGE TOGGLE */}
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

            {/* LOGIN / PROFILE */}
            {user ? (
              <button
                onClick={() => navigate("/profile")}
                className="rounded-md h-10 w-10 overflow-hidden shadow-sm bg-[#2a2a2a]/70 hover:bg-[#3a3a3a] transition"
              >
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
                    className="object-cover rounded-md"
                  />
                  <AvatarFallback className="rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Login
              </Button>
            )}

            {/* MOBILE SEARCH ICON */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center w-[38px] h-[38px]"
                title={isMobileSearchOpen ? "Close Search" : "Search Anime"}
              >
                <FontAwesomeIcon
                  icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
                  className="w-[18px] h-[18px]"
                />
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE SEARCH DROPDOWN */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}

        {/* SIDEBAR */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
