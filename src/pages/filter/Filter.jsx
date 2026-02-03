import React, { useState, useEffect } from "react";

import CategoryCard from "../../components/categorycard/CategoryCard";
import CategoryCardLoader from "../../components/Loader/CategoryCard.loader";
import getFilter from "../../utils/getFilter.utils";

const Filter = () => {
  // ================= STATE =================

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

  const [tempFilters, setTempFilters] = useState(filters);

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================= OPTIONS =================

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

    rated: ["", "G", "PG", "PG-13", "R", "R+"],

    score: ["", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],

    season: ["", "Winter", "Spring", "Summer", "Fall"],

    language: ["", "Sub", "Dub"],

    year: ["", 2026, 2025, 2024, 2023, 2022, 2021, 2020],

    sort: ["default", "score", "popularity", "newest"],
  };

  // ================= HANDLERS =================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreToggle = (genre) => {
    setTempFilters((prev) => {
      const updated = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];

      return { ...prev, genres: updated };
    });
  };

  // ================= FETCH =================

  const fetchData = async (page = 1, activeFilters = filters) => {
    setLoading(true);

    try {
      const data = await getFilter(activeFilters, page);

      setAnimeList(data.data || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPage || 1);

    } catch (err) {
      console.error(err);

      setAnimeList([]);
      setCurrentPage(1);
      setTotalPages(1);

    } finally {
      setLoading(false);
    }
  };

  // ================= APPLY =================

  const applyFilter = () => {
    setFilters(tempFilters);
    fetchData(1, tempFilters);
  };

  const resetFilter = () => {
    const reset = {
      type: "",
      status: "",
      rated: "",
      score: "",
      season: "",
      language: "",
      year: "",
      sort: "default",
      genres: [],
    };

    setTempFilters(reset);
    setFilters(reset);

    fetchData(1, reset);
  };

  // ================= PAGINATION =================

  const getPageNumbers = () => {
    const pages = [];

    const maxVisible = 7;

    let start = Math.max(currentPage - 3, 1);
    let end = Math.min(currentPage + 3, totalPages);

    if (end - start < maxVisible - 1) {
      if (start === 1) {
        end = Math.min(start + maxVisible - 1, totalPages);
      } else if (end === totalPages) {
        start = Math.max(end - maxVisible + 1, 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // ================= INIT =================

  useEffect(() => {
    fetchData(1);
  }, []);

  // ================= STYLES =================

  const styles = {
    filterPage: {
      backgroundColor: "#1a1a1a",
      minHeight: "100vh",
      padding: "80px 1.5rem 1.5rem",
    },

    genreBtn: {
      padding: "4px 8px",
      margin: "2px",
      border: "1px solid #888",
      borderRadius: "4px",
      color: "white",
      background: "transparent",
      cursor: "pointer",
      fontSize: "0.875rem",
    },

    genreBtnSelected: {
      padding: "4px 8px",
      margin: "2px",
      border: "1px solid white",
      borderRadius: "4px",
      color: "black",
      background: "white",
      cursor: "pointer",
      fontSize: "0.875rem",
    },

    filterSelect: {
      width: "100%",
      padding: "6px",
      backgroundColor: "#2a2a2a",
      border: "1px solid #555",
      borderRadius: "4px",
      color: "white",
    },
  };

  // ================= RENDER =================

  return (
    <div style={styles.filterPage}>

      <h2 className="text-white text-xl font-bold mb-4">
        Filter Anime
      </h2>

      {/* DROPDOWNS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        {Object.keys(dropdowns).map((key) => (

          <select
            key={key}
            name={key}
            value={tempFilters[key]}
            onChange={handleInputChange}
            style={styles.filterSelect}
          >

            {dropdowns[key].map((val, i) => (

              <option key={i} value={val}>
                {val || `All ${key.charAt(0).toUpperCase() + key.slice(1)}`}
              </option>

            ))}

          </select>

        ))}

      </div>

      {/* GENRES */}
      <div className="mb-6">

        {genresList.map((genre) => (

          <button
            key={genre}
            style={
              tempFilters.genres.includes(genre)
                ? styles.genreBtnSelected
                : styles.genreBtn
            }
            onClick={() => handleGenreToggle(genre)}
          >
            {genre}
          </button>

        ))}

      </div>

      {/* BUTTONS */}
      <div className="mb-6 flex gap-4">

        <button
          onClick={applyFilter}
          className="bg-white text-black px-6 py-2 rounded font-bold"
        >
          Apply
        </button>

        <button
          onClick={resetFilter}
          className="bg-gray-600 text-white px-6 py-2 rounded font-bold"
        >
          Reset
        </button>

      </div>

      {/* GRID */}
      {loading ? (
        <CategoryCardLoader />
      ) : (
        <CategoryCard
          data={animeList}
          label="Filtered Anime"
          categoryPage={false}
        />
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">

        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(1, filters)}
        >
          ≪
        </button>

        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(currentPage - 1, filters)}
        >
          ‹
        </button>

        {getPageNumbers().map((page) => (

          <button
            key={page}
            onClick={() => fetchData(page, filters)}
            style={{
              background: page === currentPage ? "#fff" : "#3a3a3a",
              color: page === currentPage ? "#000" : "#fff",
              padding: "6px 12px",
              borderRadius: "6px",
            }}
          >
            {page}
          </button>

        ))}

        <button
          disabled={currentPage >= totalPages}
          onClick={() => fetchData(currentPage + 1, filters)}
        >
          ›
        </button>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => fetchData(totalPages, filters)}
        >
          ≫
        </button>

      </div>

    </div>
  );
};

export default Filter;
