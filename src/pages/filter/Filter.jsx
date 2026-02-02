import React, { useState, useEffect } from "react";
import CategoryCard from "../../components/categorycard/CategoryCard";
import CategoryCardLoader from "../../components/Loader/CategoryCard.loader";
import getFilter from "../../utils/getFilter.utils";
import "./Filter.css";

const Filter = () => {
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    score: "",
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
    score: ["", 10,9,8,7,6,5,4,3,2,1],
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

  const fetchData = async (page = 1, activeFilters = filters) => {
    setLoading(true);
    try {
      const data = await getFilter(activeFilters, page);
      setAnimeList(data.data || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPage || 1);
    } catch (err) {
      setAnimeList([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    setFilters({ ...tempFilters });
    fetchData(1, tempFilters);
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
    fetchData();
  }, []);

  return (
    <div className="filter-page p-6">
      <h2 className="text-white text-2xl font-bold mb-6">Filter Anime</h2>

      {/* Top Filters Row */}
      <div className="top-filters grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {Object.keys(dropdowns).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-white font-semibold mb-2 capitalize">
              {key}
            </label>
            <select
              name={key}
              value={tempFilters[key]}
              onChange={handleInputChange}
              className="filter-select bg-gray-800 text-white border border-gray-600 rounded p-2"
            >
              {dropdowns[key].map((option, idx) => (
                <option key={idx} value={option}>
                  {option === "" ? `Select ${key}` : option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Genres Section */}
      <div className="genres-section mb-6">
        <h3 className="text-white font-semibold mb-3">Genres</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
      </div>

      {/* Apply Filter Button */}
      <button
        onClick={applyFilter}
        className="bg-white text-black px-6 py-2 rounded font-bold mb-8"
      >
        Apply Filter
      </button>

      {/* Anime List */}
      {loading ? (
        <CategoryCardLoader />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {animeList.map((anime) => (
            <CategoryCard key={anime.id} data={[anime]} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination flex gap-2 justify-center mt-6">
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => fetchData(p)}
              className={`px-3 py-1 rounded ${
                p === currentPage ? "bg-white text-black" : "bg-gray-700 text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filter;
