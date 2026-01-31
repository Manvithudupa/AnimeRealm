import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import getTopSearch from "@/src/utils/getTopSearch.utils";

// Static navigation links
const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/movie", label: "Movies" },
  { to: "/tv", label: "TV Series" },
  { to: "/most-popular", label: "Most Popular" },
  { to: "/top-airing", label: "Top Airing" },
];

// Custom hook to fetch top search items
const useTopSearch = () => {
  const [topSearch, setTopSearch] = useState([]);

  useEffect(() => {
    const fetchTopSearch = async () => {
      const data = await getTopSearch();
      if (data) setTopSearch(data);
    };
    fetchTopSearch();
  }, []);

  return topSearch;
};

function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topSearch = useTopSearch();

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    const queryParam = encodeURIComponent(trimmedSearch);
    navigate(`/search?keyword=${queryParam}`);
  }, [search, navigate]);

  // Trigger search on Enter key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  return (
    <div className="w-full">
      <div className="w-[1300px] mx-auto pt-12 relative overflow-hidden 
                      max-[1350px]:w-full max-[1350px]:px-8 
                      max-[1200px]:pt-8 max-[1200px]:min-h-fit 
                      max-[780px]:px-4 max-[520px]:px-0 max-[520px]:pt-6">
        {/* NAVIGATION */}
        <nav className="relative w-full">
          {/* Desktop nav links */}
          <div className="w-fit flex gap-x-12 mx-auto font-semibold max-[780px]:hidden">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-[#94a3b8]">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="max-[780px]:block hidden max-[520px]:px-4 max-[520px]:text-sm">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 focus:outline-none flex items-center gap-x-2 transition-colors duration-200 group"
            >
              <svg
                className="w-6 h-6 text-white transition-colors duration-200 
                           max-[520px]:w-5 max-[520px]:h-5 
                           group-hover:text-[#94a3b8] group-focus:text-[#94a3b8] group-active:text-[#94a3b8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="text-white font-semibold transition-colors duration-200 
                               group-hover:text-[#94a3b8] group-focus:text-[#94a3b8] group-active:text-[#94a3b8]">
                Menu
              </span>
            </button>
          </div>

          {/* Mobile modal */}
          {isModalOpen && (
            <div className="max-[780px]:block w-full hidden absolute z-50 top-10">
              <div className="bg-[#101010fa] w-full p-6 rounded-2xl flex flex-col gap-y-6 items-center relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="self-end text-black text-xl absolute top-0 right-0 bg-white px-3 py-1 rounded-tr-xl rounded-bl-xl font-bold"
                >
                  &times;
                </button>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsModalOpen(false)}
                    className="hover:text-[#94a3b8] text-white text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* HERO SECTION */}
        <div className="splashscreen min-h-[480px] min-[1200px]:min-h-[520px] bg-[#2B2A3C] 
                        rounded-[40px] flex relative mt-7 max-[780px]:w-full items-stretch 
                        max-[780px]:rounded-[30px] max-[520px]:rounded-none max-[520px]:min-h-fit 
                        max-[520px]:pb-4 max-[520px]:mt-4">
          {/* Left content */}
          <div className="h-auto flex flex-col w-[700px] relative z-40 px-20 py-20 left-0 
                          max-[1200px]:py-12 max-[780px]:px-12 max-[520px]:py-4 max-[520px]:px-8">
            {/* Logo */}
            <Link
              to="/home"
              className="text-[45px] font-extrabold tracking-wide max-[520px]:text-[38px] max-[520px]:text-center"
            >
              {logoTitle.slice(0, 3)}
              <span className="text-[#94a3b8]">{logoTitle.slice(3, 4)}</span>
              {logoTitle.slice(4)}
            </Link>

            {/* Search */}
            <div className="w-full flex gap-x-3 mt-6">
              <input
                type="text"
                placeholder="Search anime..."
                className="w-full py-3 px-6 rounded-xl bg-[#f1f5f9] text-[18px] text-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="bg-[#e5e7eb] text-black py-3 px-4 rounded-xl font-bold group"
                onClick={handleSearchSubmit}
              >
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-lg text-black group-hover:text-gray-700 max-[600px]:mt-[7px]"
                />
              </button>
            </div>

            {/* Top search */}
            <div className="mt-8 text-[15px] leading-[1.6] max-[520px]:text-[13px] max-[520px]:leading-[1.4]">
              <span className="splashitem font-[600]">Top search: </span>
              {topSearch.map((item, index) => (
                <span key={index} className="splashitem font-[400]">
                  <Link to={item.link}>{item.title}</Link>
                  {index < topSearch.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex max-[780px]:left-10">
              <Link to="/home" className="max-[520px]:w-full">
                <div className="bg-[#e5e7eb] text-black py-4 px-10 rounded-xl font-bold text-[20px] 
                                max-[520px]:text-center max-[520px]:font-medium max-[520px]:text-[17px] flex items-center justify-center gap-x-3">
                  Watch anime
                  <FontAwesomeIcon icon={faCircleArrowRight} className="ml-6 text-black" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right image */}
          <div className="h-full w-[600px] absolute right-0 max-[780px]:hidden">
            <div className="splashoverlay"></div>
            <img
              src="/splash.jpg"
              alt="Splash"
              className="bg-cover rounded-r-[40px] w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-[14px] text-center pb-4 text-gray-400">
        © {logoTitle} All rights reserved.
      </div>
    </div>
  );
}

export default SplashScreen;
