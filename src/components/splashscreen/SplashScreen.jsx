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

import splashImage from "/splash.jpg";

/* ================= NAV LINKS ================= */

const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/movie", label: "Movies" },
  { to: "/tv", label: "TV Series" },
  { to: "/most-popular", label: "Popular" },
  { to: "/top-airing", label: "Top Airing" },
];

/* ================= HOOK ================= */

const useTopSearch = () => {
  const [topSearch, setTopSearch] = useState([]);

  useEffect(() => {
    const fetchTopSearch = async () => {
      try {
        const data = await getTopSearch();
        if (data) setTopSearch(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTopSearch();
  }, []);

  return topSearch;
};

/* ================= COMPONENT ================= */

function SplashScreen() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const topSearch = useTopSearch();

  /* Search */

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
    <div
      className="splash-root"
      style={{
        "--mobile-bg": `url(${splashImage})`,
      }}
    >
      <div className="splash-wrapper">
        {/* ================= NAV ================= */}

        <nav className="splash-nav">
          <Link to="/home" className="nav-logo">
            {logoTitle}
          </Link>

          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Button */}

          <div className="mobile-menu">
            <button onClick={() => setIsModalOpen(true)}>☰</button>
          </div>

          {/* Mobile Menu */}

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

        {/* ================= HERO ================= */}

        <div className="splashscreen">
          {/* LEFT */}

          <div className="splash-content">
            {/* Hero Text */}

            <h1 className="hero-title">
              Stream Your Favorite Anime
            </h1>

            <p className="hero-subtitle">
              Watch thousands of episodes in HD. Anytime. Anywhere.
            </p>

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

            {/* Trending */}

            <div className="top-search">
              <strong>Trending:</strong>

              <div className="top-search-items">
                {topSearch.map((item) => (
                  <Link
                    key={item.id || item.title}
                    to={item.link}
                    className="splashitem"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}

            <Link to="/home" className="cta-btn">
              Watch Now
              <FontAwesomeIcon icon={faCircleArrowRight} />
            </Link>
          </div>

          {/* RIGHT IMAGE */}

          <div className="splash-image-wrapper">
            <img src={splashImage} alt="Anime" />
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <footer className="splash-footer">
        © {new Date().getFullYear()} {logoTitle}. All rights reserved.
      </footer>
    </div>
  );
}

export default SplashScreen;
