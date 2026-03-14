import { useState, useEffect } from "react";

import CategoryCard from "../../components/categorycard/CategoryCard";
import CategoryCardLoader from "../../components/Loader/CategoryCard.loader";
import getFilter from "../../utils/getFilter.utils";

const Filter = () => {
  // ================= STATE =================

  const [selectedGenre, setSelectedGenre] = useState("");

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================= OPTIONS =================

  const genresList = [
    "Action","Adventure","Cars","Comedy","Dementia","Demons","Drama","Ecchi",
    "Fantasy","Game","Harem","Historical","Horror","Isekai","Josei","Kids",
    "Magic","Martial_Arts","Mecha","Military","Music","Mystery","Parody","Police",
    "Psychological","Romance","Samurai","School","Sci_Fi","Seinen","Shoujo",
    "Shoujo_Ai","Shounen","Shounen_Ai","Slice_of_Life","Space","Sports",
    "Super_Power","Supernatural","Thriller","Vampire"
  ];

  // ================= FETCH =================

  const fetchData = async (page = 1, genre = selectedGenre) => {
    setLoading(true);

    try {
      const activeFilters = {
        type: "",
        status: "",
        rated: "",
        score: "",
        season: "",
        language: "",
        year: "",
        sort: "default",
        genres: genre ? [genre] : [],
      };

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

  // ================= GENRE HANDLER =================

  const handleGenreSelect = (genre) => {
    const newGenre = selectedGenre === genre ? "" : genre;
    setSelectedGenre(newGenre);
    setCurrentPage(1);
    fetchData(1, newGenre);
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
    fetchData(1, "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  };

  // ================= RENDER =================

  return (
    <div style={styles.filterPage}>

      <h2 className="text-white text-xl font-bold mb-4">
        Filter by Genre
      </h2>

      {/* GENRES */}
      <div className="mb-6">

        {genresList.map((genre) => (

          <button
            key={genre}
            style={
              selectedGenre === genre
                ? styles.genreBtnSelected
                : styles.genreBtn
            }
            onClick={() => handleGenreSelect(genre)}
          >
            {genre}
          </button>

        ))}

      </div>

      {/* GRID */}
      {loading ? (
        <CategoryCardLoader />
      ) : (
        <CategoryCard
          data={animeList}
          label={selectedGenre ? `${selectedGenre} Anime` : "All Anime"}
          categoryPage={false}
        />
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">

        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(1, selectedGenre)}
        >
          ≪
        </button>

        <button
          disabled={currentPage <= 1}
          onClick={() => fetchData(currentPage - 1, selectedGenre)}
        >
          ‹
        </button>

        {getPageNumbers().map((page) => (

          <button
            key={page}
            onClick={() => fetchData(page, selectedGenre)}
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
          onClick={() => fetchData(currentPage + 1, selectedGenre)}
        >
          ›
        </button>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => fetchData(totalPages, selectedGenre)}
        >
          ≫
        </button>

      </div>

    </div>
  );
};

export default Filter;
