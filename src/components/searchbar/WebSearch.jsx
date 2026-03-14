import { faMagnifyingGlass, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Suggestion from "../suggestion/Suggestion";
import useSearch from "@/src/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/src/context/ThemeContext";

function WebSearch() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const {
        setIsSearchVisible,
        searchValue,
        setSearchValue,
        isFocused,
        setIsFocused,
        debouncedValue,
        suggestionRefs,
        addSuggestionRef,
    } = useSearch();

    const handleSearchClick = () => {
        if (window.innerWidth <= 600) {
            setIsSearchVisible((prev) => !prev);
        }

        if (searchValue.trim() && window.innerWidth > 600) {
            navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
        }
    };

    const handleFilterClick = () => {
        navigate("/filter");
    };

    return (
        <div className="flex items-center relative w-[450px] max-[600px]:w-fit gap-2">

            {/* Filter Button */}
            <button
                onClick={handleFilterClick}
                className={`
                    flex items-center justify-center px-4 py-2
                    rounded-lg
                    transition-colors
                    backdrop-blur-sm
                    ${theme === "dark"
                        ? "border border-white/40 bg-black/40 text-white hover:bg-black/70"
                        : "border border-black/20 bg-black/[0.06] text-gray-700 hover:bg-black/10"
                    }
                `}
            >
                <FontAwesomeIcon icon={faSliders} className="mr-2" />
                Filter
            </button>

            {/* Search Input */}
            <input
                type="text"
                className={`
                    w-full px-5 py-2
                    rounded-lg
                    focus:outline-none focus:ring-1
                    transition-colors
                    max-[600px]:hidden
                    ${theme === "dark"
                        ? "bg-black/40 text-white border border-white/30 focus:ring-white/50 placeholder-white/50"
                        : "bg-black/[0.06] text-gray-900 border border-black/[0.15] focus:ring-black/[0.30] placeholder:text-gray-400"
                    }
                `}
                placeholder="Search anime..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setTimeout(() => {
                        const isInsideSuggestionBox = suggestionRefs.current.some(
                            (ref) => ref && ref.contains(document.activeElement)
                        );

                        if (!isInsideSuggestionBox) {
                            setIsFocused(false);
                        }
                    }, 100);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (searchValue.trim()) {
                            navigate(
                                `/search?keyword=${encodeURIComponent(searchValue)}`
                            );
                        }
                    }
                }}
            />

            {/* Search Icon */}
            <button
                className={`
                    absolute right-4
                    transition-colors
                    max-[600px]:static
                    max-[600px]:bg-transparent
                    focus:outline-none
                    max-[600px]:p-0
                    ${theme === "dark"
                        ? "text-white/60 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                    }
                `}
                onClick={handleSearchClick}
            >
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="
                        text-lg
                        max-[600px]:text-2xl
                        max-[575px]:text-xl
                        max-[600px]:mt-[7px]
                    "
                />
            </button>

            {/* Suggestions */}
            {searchValue.trim() && isFocused && (
                <div
                    ref={addSuggestionRef}
                    className="absolute z-[100000] top-full w-full"
                >
                    <Suggestion
                        keyword={debouncedValue}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
}

export default WebSearch;
