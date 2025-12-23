import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRandom, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../../context/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "../../context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";

import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import { Button } from "../ui/button";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { user, profile, signOut } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef();

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHamburgerClick = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  const handleRandomClick = () => {
    if (location.pathname === "/random") window.location.reload();
  };

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000] transition-all duration-300 bg-[#0a0a0a]
          ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT */}
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

          {/* SEARCH */}
          <div className="flex-1 flex justify-center items-center max-w-none mx-8 hidden md:flex">
            <div className="flex items-center gap-2 w-[600px]">
              <WebSearch />

              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition flex items-center justify-center"
                title="Random Anime"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* LANG (IMPROVED) */}
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-1">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`
                    px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200
                    ${
                      language === lang
                        ? "bg-white/10 text-white border border-white/20 shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* USER */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#111111]/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-gray-300 font-medium">
                        {profile?.username || user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-300 hover:bg-white/5 transition"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>

                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")} className="bg-primary text-white hover:bg-primary/90">
                Login
              </Button>
            )}

            {/* MOBILE SEARCH */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition w-[38px] h-[38px]"
              >
                <FontAwesomeIcon icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass} className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
