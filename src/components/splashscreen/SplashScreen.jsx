import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";

const API_BASE = import.meta.env.VITE_API_URL;

function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [topSearches, setTopSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Search ---------- */

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

  /* ---------- Top Searches ---------- */

  useEffect(() => {
    const fetchTopSearches = async () => {
      try {
        const res = await fetch(`${API_BASE}/top-search`);
        const data = await res.json();

        if (data?.success && Array.isArray(data.results)) {
          setTopSearches(data.results);
        }
      } catch (err) {
        console.error("Failed to fetch top searches", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSearches();
  }, []);

  return (
    <div className="splash-container">
      <div className="splash-overlay"></div>

      <div className="content-wrapper">
        {/* Logo */}
        <div className="logo-container">
          <img src="/logo.png" alt={logoTitle} className="logo" />
        </div>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search anime..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-button"
            onClick={handleSearchSubmit}
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Enter */}
        <Link to="/home" className="enter-button">
          Enter Homepage{" "}
          <FontAwesomeIcon icon={faAngleRight} className="angle-icon" />
        </Link>

        {/* Top Searches */}
        <div className="top-search-section">
          <h2 className="top-search-title">🔥 Trending Searches</h2>

          {loading ? (
            <p className="top-search-loading">Loading...</p>
          ) : (
            <div className="top-search-list">
              {topSearches.slice(0, 10).map((item, index) => (
                <button
                  key={index}
                  className="top-search-item"
                  onClick={() => navigate(item.link)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
