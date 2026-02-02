import React, { useState, useEffect } from "react";
import FilterCard from "../../components/filtercard/FilterCard";
import getFilter from "../../utils/getFilter.utils";
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
  const [tempFilters, setTempFilters] = useState({ ...filters });
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

  const dropdowns = {
    type: ["", "TV", "Movie", "OVA", "ONA", "Special"],
    status: ["", "Finished", "Currently Airing", "Not Yet Aired"],
    rated: ["", "G", "PG", "PG-13", "R", "R+", "Rx"],
    score: ["", 10,9,8,7,6,5,4,3,2,1],
    season: ["", "Winter", "Spring", "Summer", "Fall"],
    language: ["", "Japanese", "English", "Other"],
    year: ["", 2026,2025,2024,2023,2022,2021,2020],
    sort: ["default", "score", "popularity", "newest"],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempFilters({ ...tempFilters, [name]: value });
  };

  const handleGenreToggle = (genre) => {
    setTempFilters((prev) => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getFilter(filters, page);
      setAnimeList(data.data || []);
      setTotalPages(data.totalPage || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      setAnimeList([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    setFilters({ ...tempFilters });
    fetchData(1);
  };

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

  useEffect(() => {
    fetchData(1); // initial fetch
  }, []);

  return (
    <div className="filter-page p-6">
      <h2 className="text-white text-xl font-bold mb-4">Filter Anime</h2>

      {/* Dropdowns */}
      <div className="filters grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.keys(dropdowns).map((key) => (
          <select
            key={key}
            name={key}
            value={tempFilters[key]}
            onChange={handleInputChange}
            className="filter-select"
          >
            {dropdowns[key].map((val, idx) => (
              <option key={idx} value={val}>{val || key.charAt(0).toUpperCase() + key.slice(1)}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Genre Buttons */}
      <div className="genre-filters mb-6">
        {genresList.map((genre) => (
          <button
            key={genre}
            className={`genre-btn ${tempFilters.genres.includes(genre) ? "selected" : ""}`}
            onClick={() => handleGenreToggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <button
        onClick={applyFilter}
        className="bg-white text-black px-6 py-2 rounded font-bold mb-6"
      >
        Apply Filter
      </button>

      {/* Anime Grid */}
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {animeList.length > 0 ? (
            animeList.map((anime) => <FilterCard key={anime.id} anime={anime} />)
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
