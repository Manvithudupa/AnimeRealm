import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
  faBell
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

import Notifications from "../notifications/Notifications";
import { useNotifications } from "../../hooks/useNotifications";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, profile, signOut } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  /* ---------------- STATES ---------------- */

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  /* ---------------- NOTIFICATION COUNT ---------------- */

  const unreadCount = useNotificationCount(user?.id);

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    setIsDropdownOpen(false);
    setShowNotifications(false);
  }, [user]);

  useEffect(() => {
    const handleScroll = () =>
      setIsScrolled(window.scrollY > 0);

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleHamburgerClick = () =>
    setIsSidebarOpen(true);

  const handleCloseSidebar = () =>
    setIsSidebarOpen(false);

  const handleRandomClick = () => {
    if (location.pathname === "/random") {
      window.location.reload();
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000000]
        transition-all duration-300 ease-in-out bg-[#0a0a0a]
        ${
          isScrolled
            ? "bg-opacity-80 backdrop-blur-md shadow-lg"
            : "bg-opacity-100"
        }`}
      >
        <div className="w-full h-16 flex items-center justify-between px-2 sm:px-4 max-w-[1920px] mx-auto">

          {/* ---------------- LEFT ---------------- */}

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleHamburgerClick}
              className="w-8 h-8 flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faBars}
                className="text-base sm:text-xl text-gray-200 hover:text-white"
              />
            </button>

            <Link to="/home">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-7 sm:h-9 w-auto"
              />
            </Link>
          </div>

          {/* ---------------- CENTER ---------------- */}

          <div className="hidden md:flex flex-1 justify-center mx-8">
            <div className="flex items-center gap-2 w-full max-w-[600px]">

              <WebSearch />

              <Link
                to={
                  location.pathname === "/random"
                    ? "#"
                    : "/random"
                }
                onClick={handleRandomClick}
                className="p-[10px] bg-[#2a2a2a]/75 rounded-lg"
              >
                <FontAwesomeIcon
                  icon={faRandom}
                  className="text-lg text-white/70"
                />
              </Link>

            </div>
          </div>

          {/* ---------------- RIGHT ---------------- */}

          <div className="flex items-center gap-2">

            {/* -------- LANGUAGE -------- */}

            <div className="hidden md:flex gap-2 bg-[#27272A] p-1 rounded-md">

              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 rounded text-sm ${
                    language === lang
                      ? "bg-[#3F3F46] text-white"
                      : "text-gray-400"
                  }`}
                >
                  {lang}
                </button>
              ))}

            </div>

            {/* -------- NOTIFICATIONS -------- */}

            {user && (
              <div
                className="relative"
                ref={notifRef}
              >
                <button
                  onClick={() =>
                    setShowNotifications((p) => !p)
                  }
                  className="relative w-9 h-9 flex items-center justify-center bg-[#2a2a2a]/75 rounded-lg hover:bg-[#3a3a3a]/75"
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    className="text-white/80"
                  />

                  {/* Badge */}
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1
                      min-w-[18px] h-[18px]
                      bg-red-600 text-white text-[11px]
                      rounded-full flex items-center justify-center px-1"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panel */}
                {showNotifications && <Notifications />}
              </div>
            )}

            {/* -------- USER -------- */}

            {user ? (
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  onClick={() =>
                    setIsDropdownOpen((p) => !p)
                  }
                >
                  <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage
                      src={profile?.avatar_url}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56
                    bg-[#111]/95 rounded-xl border border-white/10"
                  >

                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm truncate">
                        {profile?.username || user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-3 text-left"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/watchlist");
                      }}
                      className="w-full px-4 py-3 text-left"
                    >
                      Watchlist
                    </button>

                    <button
                      onClick={signOut}
                      className="w-full px-4 py-3 text-left text-red-400"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}

            {/* -------- MOBILE SEARCH -------- */}

            <button
              onClick={() =>
                setIsMobileSearchOpen((p) => !p)
              }
              className="md:hidden w-9 h-9 bg-[#2a2a2a]/75 rounded-lg"
            >
              <FontAwesomeIcon
                icon={
                  isMobileSearchOpen
                    ? faXmark
                    : faMagnifyingGlass
                }
              />
            </button>

          </div>
        </div>

        {/* MOBILE SEARCH */}

        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B]">
            <MobileSearch
              onClose={() =>
                setIsMobileSearchOpen(false)
              }
            />
          </div>
        )}

        {/* SIDEBAR */}

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

      </nav>
    </SearchProvider>
  );
}

export default Navbar;
