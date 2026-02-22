import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import getTopSearch from "@/src/utils/getTopSearch.utils";

// Static data
const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/movie", label: "Movies" },
  { to: "/tv", label: "TV Series" },
  { to: "/most-popular", label: "Most Popular" },
  { to: "/top-airing", label: "Top Airing" },
];

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

  const handleSearchSubmit = useCallback(() => {
    const trimmed = search.trim();

    if (!trimmed) return;

    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
  }, [search, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  return (
    <div className="page-wrapper">

      {/* MAIN CONTENT */}
      <div className="w-full flex-grow">

        <div className="w-[1300px] mx-auto pt-12 relative overflow-hidden max-[1350px]:w-full max-[1350px]:px-8 max-[1200px]:pt-8 max-[780px]:px-4 max-[520px]:px-0">

          {/* NAV */}
          <nav className="relative w-full">

            {/* Desktop */}
            <div className="w-fit flex gap-x-12 mx-auto font-semibold max-[780px]:hidden">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-slate-300 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile */}
            <div className="max-[780px]:block hidden">

              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 flex items-center gap-x-2 group"
              >
                <svg
                  className="w-6 h-6 text-white group-hover:text-slate-300 transition"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>

                <span className="font-semibold group-hover:text-slate-300 transition">
                  Menu
                </span>
              </button>

            </div>

            {/* Mobile Menu */}
            {isModalOpen && (
              <div className="max-[780px]:block hidden absolute z-50 top-10 w-full">

                <div className="bg-[#101010fa] p-6 rounded-2xl flex flex-col gap-y-6 items-center">

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-0 right-0 bg-white px-3 py-1 rounded-bl-xl font-bold"
                  >
                    ×
                  </button>

                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsModalOpen(false)}
                      className="text-white text-lg hover:text-slate-300"
                    >
                      {link.label}
                    </Link>
                  ))}

                </div>
              </div>
            )}
          </nav>

          {/* SPLASH */}
          <div className="splashscreen min-h-[480px] bg-[#2B2A3C] rounded-[40px] flex relative mt-7 max-[780px]:rounded-[30px] max-[520px]:rounded-none">

            {/* LEFT */}
            <div className="flex flex-col w-[700px] relative z-40 px-20 py-20 max-[1200px]:py-12 max-[780px]:px-12 max-[520px]:px-8 max-[520px]:py-6">

              {/* LOGO */}
              <Link
                to="/home"
                className="flex justify-center max-[520px]:justify-center"
              >
                <img
                  src="/logo.png"
                  alt="AnimeRealm"
                  className="h-[45px] max-[520px]:h-[36px] w-auto"
                />
              </Link>
              
              {/* SEARCH */}
              <div className="w-full flex gap-x-3 mt-6">

                <input
                  type="text"
                  placeholder="Search anime..."
                  className="w-full py-3 px-6 rounded-xl bg-white text-[18px] text-black outline-none focus:ring-2 focus:ring-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button
                  onClick={handleSearchSubmit}
                  className="bg-white hover:bg-slate-100 text-black py-3 px-4 rounded-xl transition"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-lg"
                  />
                </button>

              </div>

              {/* TOP SEARCH */}
              <div className="mt-8">

                <p className="text-sm font-semibold mb-3 text-slate-300">
                  Top Searches
                </p>

                <div className="flex flex-wrap gap-2">

                  {topSearch.map((item, index) => (
                    <Link
                      key={index}
                      to={item.link}
                      className="splash-chip"
                    >
                      {item.title}
                    </Link>
                  ))}

                </div>

              </div>

              {/* BUTTON */}
              <div className="mt-10">

                <Link to="/home" className="block max-[520px]:w-full">

                  <div className="bg-white hover:bg-slate-100 transition text-black py-4 px-10 rounded-xl font-bold text-[18px] text-center">

                    Watch Anime

                    <FontAwesomeIcon
                      icon={faCircleArrowRight}
                      className="ml-4"
                    />

                  </div>

                </Link>

              </div>

            </div>

            {/* RIGHT IMAGE */}
            <div className="h-full w-[600px] absolute right-0 max-[780px]:hidden">

              <div className="splashoverlay"></div>

              <img
                src="/splash.jpg"
                alt="Splash"
                className="rounded-r-[40px] w-full h-full object-cover"
              />

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="main-footer">
        © {logoTitle} All rights reserved.
      </footer>

    </div>
  );
}

export default SplashScreen;
