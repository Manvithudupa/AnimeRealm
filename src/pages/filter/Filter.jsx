import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryCard from "../../components/categorycard/CategoryCard";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Pre-filled options
  const typeOptions = ["All", "TV", "Movie", "OVA", "ONA", "Special"];
  const statusOptions = ["All", "Finished", "Currently Airing", "Not Yet Aired"];
  const ratedOptions = ["All", "G", "PG", "PG-13", "R", "R+", "Rx"];
  const scoreOptions = ["All", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const seasonOptions = ["All", "Winter", "Spring", "Summer", "Fall"];
  const languageOptions = ["All", "Japanese", "English", "Other"];
  const yearOptions = ["All", 2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const sortOptions = ["default", "score", "popularity", "newest"];

  const genresList = [
    "Action","Adventure","Cars","Comedy","Dementia","Demons","Drama","Ecchi",
    "Fantasy","Game","Harem","Historical","Horror","Isekai","Josei","Kids",
    "Magic","Martial Arts","Mecha","Military","Music","Mystery","Parody","Police",
    "Psychological","Romance","Samurai","School","Sci-Fi","Seinen","Shoujo",
    "Shoujo Ai","Shounen","Shounen Ai","Slice of Life","Space","Sports",
    "Super Power","Supernatural","Thriller","Vampire"
  ];

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

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page,
        genres: filters.genres.join(","),
        type: filters.type === "All" ? "" : filters.type,
        status: filters.status === "All" ? "" : filters.status,
        rated: filters.rated === "All" ? "" : filters.rated,
        score: filters.score === "All" ? "" : filters.score,
        season: filters.season === "All" ? "" : filters.season,
        language: filters.language === "All" ? "" : filters.language,
        year: filters.year === "All" ? "" : filters.year,
      };

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/filter`, { params });
      if (data.success) {
        setAnimeList(data.results.data);
        setTotalPages(data.results.totalPage);
        setCurrentPage(data.results.currentPage);
      }
    } catch (error) {
      console.error("Error fetching anime:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on first render
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchData(1);
  }, [filters]);

  return (
    <div className="filter-page p-6">
      <h2 className="text-white text-xl font-bold mb-4">Filter Anime</h2>

      {/* Dropdown Filters */}
      <div className="filters grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <select name="type" value={filters.type} onChange={handleInputChange} className="filter-select">
          {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select name="status" value={filters.status} onChange={handleInputChange} className="filter-select">
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name="rated" value={filters.rated} onChange={handleInputChange} className="filter-select">
          {ratedOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select name="score" value={filters.score} onChange={handleInputChange} className="filter-select">
          {scoreOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name="season" value={filters.season} onChange={handleInputChange} className="filter-select">
          {seasonOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name="language" value={filters.language} onChange={handleInputChange} className="filter-select">
          {languageOptions.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select name="year" value={filters.year} onChange={handleInputChange} className="filter-select">
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select name="sort" value={filters.sort} onChange={handleInputChange} className="filter-select">
          {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Genre Buttons */}
      <div className="genre-filters mb-6">
        {genresList.map((genre) => (
          <button
            key={genre}
            className={`genre-btn ${filters.genres.includes(genre) ? "selected" : ""}`}
            onClick={() => handleGenreToggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Filter Button */}
      <button onClick={() => fetchData(1)} className="bg-white text-black px-6 py-2 rounded font-bold mb-6">
        Apply Filter
      </button>

      {/* Anime Grid */}
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {animeList.map((anime) => (
            <CategoryCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination flex justify-center mt-6 gap-3">
        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(currentPage - 1)}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white px-3 py-1">{currentPage} / {totalPages}</span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => fetchData(currentPage + 1)}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Filter;
