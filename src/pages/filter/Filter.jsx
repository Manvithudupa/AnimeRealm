import React, { useState, useEffect } from "react";
import CategoryCard from "../../components/categorycard/CategoryCard";
import CategoryCardLoader from "../../components/Loader/CategoryCard.loader";
import getFilter from "../../utils/getFilter.utils";

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
    fetchData(1);
  }, []);

  const styles = {
    filterPage: {
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      paddingTop: '80px', // Add top padding to account for navbar
      padding: '80px 1.5rem 1.5rem 1.5rem',
    },
    genreBtn: {
      padding: '4px 8px',
      margin: '2px',
      border: '1px solid #888',
      borderRadius: '4px',
      color: 'white',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    genreBtnSelected: {
      padding: '4px 8px',
      margin: '2px',
      border: '1px solid white',
      borderRadius: '4px',
      color: 'black',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    filterSelect: {
      width: '100%',
      padding: '6px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #555',
      borderRadius: '4px',
      color: 'white',
    },
  };

  return (
    <div style={styles.filterPage}>
      <h2 className="text-white text-xl font-bold mb-4">Filter Anime</h2>

      {/* Dropdowns */}
      <div className="filters grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.keys(dropdowns).map((key) => (
          <select
            key={key}
            name={key}
            value={tempFilters[key]}
            onChange={handleInputChange}
            style={styles.filterSelect}
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
            style={tempFilters.genres.includes(genre) ? styles.genreBtnSelected : styles.genreBtn}
            onClick={() => handleGenreToggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <button
        onClick={applyFilter}
        className="bg-white text-black px-6 py-2 rounded font-bold mb-6 hover:bg-gray-200 transition-colors"
      >
        Apply Filter
      </button>

      {/* Anime Grid */}
      {loading ? (
        <CategoryCardLoader />
      ) : (
        <CategoryCard
          data={animeList}
          label="Filtered Anime"
          categoryPage={false}
        />
      )}

      {/* Pagination */}
      <div className="pagination flex justify-center items-center mt-6 gap-2 flex-wrap">
        {/* First Page Button */}
        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(1)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: currentPage <= 1 ? '#2a2a2a' : '#3a3a3a',
            color: currentPage <= 1 ? '#555' : '#fff',
            border: 'none',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (currentPage > 1) e.target.style.backgroundColor = '#4a4a4a';
          }}
          onMouseLeave={(e) => {
            if (currentPage > 1) e.target.style.backgroundColor = '#3a3a3a';
          }}
        >
          ≪
        </button>

        {/* Previous Page Button */}
        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(currentPage - 1)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: currentPage <= 1 ? '#2a2a2a' : '#3a3a3a',
            color: currentPage <= 1 ? '#555' : '#fff',
            border: 'none',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (currentPage > 1) e.target.style.backgroundColor = '#4a4a4a';
          }}
          onMouseLeave={(e) => {
            if (currentPage > 1) e.target.style.backgroundColor = '#3a3a3a';
          }}
        >
          ‹
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => fetchData(page)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: page === currentPage ? '#fff' : '#3a3a3a',
              color: page === currentPage ? '#000' : '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: page === currentPage ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (page !== currentPage) e.target.style.backgroundColor = '#4a4a4a';
            }}
            onMouseLeave={(e) => {
              if (page !== currentPage) e.target.style.backgroundColor = '#3a3a3a';
            }}
          >
            {page}
          </button>
        ))}

        {/* Next Page Button */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => fetchData(currentPage + 1)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: currentPage >= totalPages ? '#2a2a2a' : '#3a3a3a',
            color: currentPage >= totalPages ? '#555' : '#fff',
            border: 'none',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (currentPage < totalPages) e.target.style.backgroundColor = '#4a4a4a';
          }}
          onMouseLeave={(e) => {
            if (currentPage < totalPages) e.target.style.backgroundColor = '#3a3a3a';
          }}
        >
          ›
        </button>

        {/* Last Page Button */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => fetchData(totalPages)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: currentPage >= totalPages ? '#2a2a2a' : '#3a3a3a',
            color: currentPage >= totalPages ? '#555' : '#fff',
            border: 'none',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (currentPage < totalPages) e.target.style.backgroundColor = '#4a4a4a';
          }}
          onMouseLeave={(e) => {
            if (currentPage < totalPages) e.target.style.backgroundColor = '#3a3a3a';
          }}
        >
          ≫
        </button>
      </div>
    </div>
  );
};

export default Filter;
