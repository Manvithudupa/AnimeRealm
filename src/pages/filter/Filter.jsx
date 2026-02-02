import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryCard from "../../components/categorycard/CategoryCard";
import "./Filter.css";

const Filter = () => {
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    rated: "",
    score: "",
    season: "",
    language: "",
    year: "",
    sort: "default",
    genres: [],
  });
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const genresList = [
    "Action","Adventure","Cars","Comedy","Dementia","Demons","Drama","Ecchi",
    "Fantasy","Game","Harem","Historical","Horror","Isekai","Josei","Kids",
    "Magic","Martial Arts","Mecha","Military","Music","Mystery","Parody","Police",
    "Psychological","Romance","Samurai","School","Sci-Fi","Seinen","Shoujo",
    "Shoujo Ai","Shounen","Shounen Ai","Slice of Life","Space","Sports",
    "Super Power","Supernatural","Thriller","Vampire"
  ];

  // Dropdown options
  const typeOptions = ["", "TV", "Movie", "OVA", "ONA", "Special"];
  const statusOptions = ["", "Finished", "Currently Airing", "Not Yet Aired"];
  const ratedOptions = ["", "G", "PG", "PG-13", "R", "R+", "Rx"];
  const scoreOptions = ["", 10,9,8,7,6,5,4,3,2,1];
  const seasonOptions = ["", "Winter", "Spring", "Summer", "Fall"];
  const languageOptions = ["", "Japanese", "English", "Other"];
  const yearOptions = ["", 2026,2025,2024,2023,2022,2021,2020];
  const sortOptions = ["default", "score", "popularity", "newest"];

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
        genres: filters.genres.join(",")
      };

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/filter`, { params });

      if (data?.success && data.results?.data) {
        setAnimeList(data.results.data);
        setTotalPages(data.results.totalPage || 1);
        setCurrentPage(data.results.currentPage || 1);
      } else {
        setAnimeList([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching anime:", error);
      setAnimeList([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [filters]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    let start = Math.max(currentPage - 3, 1);
    let end = Math.min(currentPage + 3, totalPages);

    if (end - start < maxVisible - 1) {
      if (start === 1) end = Math.min(start + maxVisible - 1, totalPages);
      else if (end === totalPages) start = Math.max(end - maxVisible + 1, 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="filter-page p-6">
      <h2 className="text-white text-xl font-bold mb-4">Filter Anime</h2>

      {/* Dropdown Filters */}
      <div className="filters grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <select name="type" value={filters.type} onChange={handleInputChange} className="filter-select">
          {typeOptions.map((t, idx) => <option key={idx} value={t}>{t || "Type"}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleInputChange} className="filter-select">
          {statusOptions.map((s, idx) => <option key={idx} value={s}>{s || "Status"}</option>)}
        </select>
        <select name="rated" value={filters.rated} onChange={handleInputChange} className="filter-select">
          {ratedOptions.map((r, idx) => <option key={idx} value={r}>{r || "Rated"}</option>)}
        </select>
        <select name="score" value={filters.score} onChange={handleInputChange} className="filter-select">
          {scoreOptions.map((s, idx) => <option key={idx} value={s}>{s || "Score"}</option>)}
        </select>
        <select name="season" value={filters.season} onChange={handleInputChange} className="filter-select">
          {seasonOptions.map((s, idx) => <option key={idx} value={s}>{s || "Season"}</option>)}
        </select>
        <select name="language" value={filters.language} onChange={handleInputChange} className="filter-select">
          {languageOptions.map((l, idx) => <option key={idx} value={l}>{l || "Language"}</option>)}
        </select>
        <select name="year" value={filters.year} onChange={handleInputChange} className="filter-select">
          {yearOptions.map((y, idx) => <option key={idx} value={y}>{y || "Year"}</option>)}
        </select>
        <select name="sort" value={filters.sort} onChange={handleInputChange} className="filter-select">
          {sortOptions.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
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

      {/* Apply Filter Button */}
      <button onClick={() => fetchData(1)} className="bg-white text-black px-6 py-2 rounded font-bold mb-6">
        Apply Filter
      </button>

      {/* Anime Grid */}
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {animeList?.length > 0 ? (
            animeList.map((anime) => <CategoryCard key={anime.id} anime={anime} />)
          ) : (
            <p className="text-white col-span-full text-center">No anime found.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination flex justify-center mt-6 gap-2 flex-wrap">
        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(currentPage - 1)}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => fetchData(page)}
            className={`px-3 py-1 rounded ${page === currentPage ? "bg-white text-black" : "bg-gray-700 text-white"}`}
          >
            {page}
          </button>
        ))}

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
