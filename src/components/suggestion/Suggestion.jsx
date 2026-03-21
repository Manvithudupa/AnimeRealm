import getSearchSuggestion from "@/src/utils/getSearchSuggestion.utils";
import { useEffect, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTheme } from "@/src/context/ThemeContext";

function Suggestion({ keyword, className, onSuggestionClick }) {
  const [suggestion, setSuggestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const controller = new AbortController();

    const fetchSearchSuggestion = async () => {
      if (!keyword) return;
      setLoading(true);
      setHasFetched(false);
      try {
        const data = await getSearchSuggestion(keyword);
        if (controller.signal.aborted) return;
        setSuggestion(data);
        setHasFetched(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching search suggestion info:", err);
        setError(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchSearchSuggestion();

    return () => {
      controller.abort();
    };
  }, [keyword]);

  return (
    <div
      className={`${isDark ? "bg-zinc-900" : "bg-white"} ${className} flex ${
        loading ? "justify-center py-4" : "justify-start"
      } ${!suggestion ? "p-2" : "justify-start"} items-center rounded-lg`}
      style={{ 
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.1)"
      }}
    >
      {loading ? (
        <BouncingLoader />
      ) : error && !suggestion ? (
        <div className={`${isDark ? "text-gray-400" : "text-gray-500"} p-3`}>Error loading suggestions</div>
      ) : suggestion && hasFetched ? (
        <div className="w-full flex flex-col pt-1 overflow-y-auto">
          {suggestion.map((item, index) => (
            <Link
              to={`/${item.id}`}
              key={index}
              onClick={onSuggestionClick}
              className={`group py-2 flex items-start gap-x-3 transition-all duration-200 cursor-pointer px-3 ${
                isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
              }`}
              style={{
                borderBottom:
                  index === suggestion.length - 1
                    ? "none"
                    : isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <img
                src={`${item.poster}`}
                className="w-[45px] h-[65px] flex-shrink-0 object-cover rounded-md shadow-lg"
                alt=""
                onError={(e) => {
                  e.target.src = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";
                }}
              />
              <div className="flex flex-col gap-y-[2px]">
                {item?.title && (
                  <h1 className={`line-clamp-1 leading-5 font-semibold text-[14px] ${isDark ? "text-gray-100 group-hover:text-white" : "text-gray-900 group-hover:text-black"}`}>
                    {item.title || "N/A"}
                  </h1>
                )}
                {item?.japanese_title && (
                  <h1 className={`line-clamp-1 leading-4 text-[12px] font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {item.japanese_title || "N/A"}
                  </h1>
                )}
                {(item?.releaseDate || item?.showType || item?.duration) && (
                  <div className="flex gap-x-2 items-center w-full justify-start mt-[2px]">
                    <p className={`leading-4 text-[12px] font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {item.releaseDate || "N/A"}
                    </p>
                    <span className={`w-1 h-1 rounded-full ${isDark ? "bg-gray-600" : "bg-gray-400"}`}></span>
                    <p className={`leading-4 text-[12px] font-medium ${isDark ? "text-gray-300 group-hover:text-white" : "text-gray-600 group-hover:text-black"}`}>
                      {item.showType || "N/A"}
                    </p>
                    <span className={`w-1 h-1 rounded-full ${isDark ? "bg-gray-600" : "bg-gray-400"}`}></span>
                    <p className={`leading-4 text-[12px] font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {item.duration || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
          {!loading && hasFetched && (
            <Link
              className={`w-full flex py-2.5 justify-center items-center transition-all duration-200 rounded-b-lg ${
                isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"
              }`}
              to={`/search?keyword=${encodeURIComponent(keyword)}`}
              onClick={onSuggestionClick}
            >
              <div className="flex w-fit items-center gap-x-2">
                <p className={`text-[14px] font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  View all results
                </p>
                <FaChevronRight className={`text-[11px] mt-[1px] ${isDark ? "text-gray-200" : "text-gray-700"}`} />
              </div>
            </Link>
          )}
        </div>
      ) : hasFetched ? (
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"} p-3`}>No results found!</p>
      ) : null}
    </div>
  );
}

export default Suggestion;
