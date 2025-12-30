import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./SplashScreen.css";

const API_BASE = import.meta.env.VITE_API_URL;

function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [topSearches, setTopSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Search ---------- */

  const submitSearch = useCallback(() => {
    const q = search.trim();
    if (!q) return;
    navigate(`/search?keyword=${encodeURIComponent(q)}`);
  }, [search, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submitSearch();
  };

  /* ---------- Fetch Top Searches ---------- */

  useEffect(() => {
    const fetchTopSearches = async () => {
      try {
        const res = await fetch(`${API_BASE}/top-search`);
        const data = await res.json();

        if (data?.success && Array.isArray(data.results)) {
          setTopSearches(data.results);
        }
      } catch (err) {
        console.error("Top search fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSearches();
  }, []);

  return (
    <div className="splash">
      <div className="splash-inner">
        {/* Logo */}
        <img src="/logo.png" alt="AnimeRealm" className="splash-logo" />

        <h1 className="splash-title">Watch Anime Instantly</h1>
        <p className="splash-subtitle">
          Search, stream, and discover anime — no sign-up required.
        </p>

        {/* Search */}
        <div className="splash-search">
          <input
            type="text"
            placeholder="Search anime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={submitSearch} aria-label="Search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Top Searches */}
        <div className="top-searches">
          <h3>🔥 Trending Now</h3>

          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="top-search-list">
              {topSearches.slice(0, 10).map((item, i) => (
                <button
                  key={i}
                  className="top-search-item"
                  onClick={() => navigate(item.link)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enter */}
        <Link to="/home" className="enter-home">
          Enter Site <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </div>
  );
}

export default SplashScreen;
