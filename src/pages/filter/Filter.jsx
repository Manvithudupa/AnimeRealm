import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryCard from "../../components/categorycard/CategoryCard"; // reuse existing card
import "./Filter.css";

const Filter = () => {
  const [filters, setFilters] = useState({
    type: "All",
    status: "All",
    rated: "All",
    score: "All",
    season: "All",
    language: "All",
    year: "All",
    sort: "default",
    genres: [],
  });
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleGenreToggle = (genre) => {
    setFilters((prev) => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { ...filters, genres: filters.genres.join(",") };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/filter`, { params });
      if (data.success) {
        setAnimeList(data.results.data);
      }
    } catch (error) {
      console.error("Error fetching anime:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="filter-page p-6">
      <h2 className="text-white text-xl font-bold mb-4">Filter</h2>

      <div className="filters grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["type","status","rated","score","season","language","year","sort"].map((f) => (
          <select
            key={f}
            name={f}
            value={filters[f]}
            onChange={handleInputChange}
            className="filter-select bg-gray-800 text-white border border-gray-600 rounded p-2"
          >
            <option value="All">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            {/* You can add specific options if needed */}
          </select>
        ))}
      </div>

      <div className="genre-filters mb-6">
        {[
          "Action","Adventure","Cars","Comedy","Dementia","Demons","Drama","Ecchi",
          "Fantasy","Game","Harem","Historical","Horror","Isekai","Josei","Kids",
          "Magic","Martial Arts","Mecha","Military","Music","Mystery","Parody","Police",
          "Psychological","Romance","Samurai","School","Sci-Fi","Seinen","Shoujo",
          "Shoujo Ai","Shounen","Shounen Ai","Slice of Life","Space","Sports",
          "Super Power","Supernatural","Thriller","Vampire"
        ].map((genre) => (
          <button
            key={genre}
            className={`genre-btn ${filters.genres.includes(genre) ? "selected" : ""}`}
            onClick={() => handleGenreToggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <button
        onClick={fetchData}
        className="bg-white text-black px-6 py-2 rounded font-bold mb-6"
      >
        Filter
      </button>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {animeList.map((anime) => (
            <CategoryCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Filter;
