import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
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

    return (
        <div className="flex items-center relative w-full max-w-[280px] lg:max-w-[320px] group">
            {/* Search Icon */}
            <div
                className={`
                    absolute left-4 z-10
                    transition-colors
                    pointer-events-none
                    ${theme === "dark"
                        ? "text-white/40 group-focus-within:text-white/70"
                        : "text-gray-400 group-focus-within:text-gray-600"
                    }
                `}
            >
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-sm"
                />
            </div>

            {/* Search Input */}
            <input
                type="text"
                className={`
                    w-full pl-10 pr-4 py-2
                    rounded-full text-sm
                    focus:outline-none transition-all
                    ${theme === "dark"
                        ? "bg-white/10 text-white placeholder-white/40 focus:bg-white/15"
                        : "bg-black/5 text-gray-900 placeholder:text-gray-400 focus:bg-black/10"
                    }
                `}
                placeholder="Search..."
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

            {/* Suggestions */}
            {searchValue.trim() && isFocused && (
                <div
                    ref={addSuggestionRef}
                    className="absolute z-[100000] top-full mt-2 w-full left-0"
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
