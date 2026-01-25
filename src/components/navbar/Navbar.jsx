import { useState, useEffect, useRef } from "react";
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

import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, LogOut, Bookmark } from "lucide-react";
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

  const dropdownRef = useRef(null);

  /* 🔒 CLOSE DROPDOWN ON AUTH CHANGE */
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [user]);

  /* Outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Scroll effect */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000]
        transition-all duration-300 bg-[#0a0a0a]
        ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : ""}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faBars}
              className="text-xl text-gray-200 cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            />
            <Link to="/home">
              <img src="/logo.png" alt="Logo" className="h-9" />
            </Link>
          </div>

          {/* DESKTOP SEARCH */}
          <div className="hidden md:flex flex-1 justify-center mx-8">
            <div className="flex gap-2 w-[600px]">
              <WebSearch />
              <Link
                to="/random"
                className="p-[10px] bg-[#2a2a2a]/75 rounded-lg text-white/50 hover:text-white"
              >
                <FontAwesomeIcon icon={faRandom} />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* USER */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="
                    h-10 w-10 rounded-full
                    ring-1 ring-white/10
                    hover:ring-purple-500
                    transition
                  "
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-[#2a2a2a]">
                      <User className="h-5 w-5 text-white/70" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div
                    className="
                      absolute right-0 mt-2 w-56
                      bg-[#111]/95 backdrop-blur-xl
                      rounded-xl border border-white/10
                      shadow-xl overflow-hidden
                    "
                  >
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
              <Button size="sm" onClick={() => navigate("/auth")}>
                Login
              </Button>
            )}

            {/* MOBILE SEARCH */}
            <button
              className="md:hidden p-[10px] bg-[#2a2a2a]/75 rounded-lg text-white/60"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <FontAwesomeIcon
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass}
              />
            </button>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B]">
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
