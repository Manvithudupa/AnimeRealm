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
import splashImage from "/splash.jpg"; // ✅ image import

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
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    navigate(`/search?keyword=${encodeURIComponent(trimmedSearch)}`);
  }, [search, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  return (
    <div className="w-full splash-root">
      <div className="splash-wrapper">
        {/* NAVBAR */}
        <nav className="splash-nav">
          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu">
            <button onClick={() => setIsModalOpen(true)}>
              ☰ <span>Menu</span>
            </button>
          </div>

          {/* Mobile Modal */}
          {isModalOpen && (
            <div className="mobile-modal">
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsModalOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* SPLASH */}
        <div className="splashscreen">
          {/* LEFT CONTENT */}
          <div className="splash-content">
            <Link to="/home" className="splash-logo">
              {logoTitle.slice(0, 3)}
              <span>{logoTitle.slice(3, 4)}</span>
              {logoTitle.slice(4)}
            </Link>

            {/* Search */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Search anime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSearchSubmit}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>

            {/* Top Search */}
            <div className="top-search">
              <strong>Top search:</strong>
              <div className="top-search-items">
                {topSearch.map((item, index) => (
                  <Link key={index} to={item.link} className="splashitem">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link to="/home" className="cta-btn">
              Watch anime
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </Link>
          </div>

          {/* RIGHT IMAGE */}
          <div className="splash-image-wrapper">
            <div className="splashoverlay" />
            <img src={splashImage} alt="Splash" />
          </div>
        </div>
      </div>

      <footer className="splash-footer">
        © {logoTitle} All rights reserved.
      </footer>
    </div>
  );
}

export default SplashScreen;
