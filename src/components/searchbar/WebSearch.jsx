import { faMagnifyingGlass, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Suggestion from "../suggestion/Suggestion";
import useSearch from "@/src/hooks/useSearch";
import { useNavigate } from "react-router-dom";

function WebSearch() {
    const navigate = useNavigate();
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
                className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
                <FontAwesomeIcon icon={faSliders} className="mr-2" />
                Filter
            </button>

            {/* Search Input */}
            <input
                type="text"
                className="w-full px-5 py-2 bg-[#2a2a2a]/75 text-white rounded-lg focus:outline-none transition-colors placeholder-white/50 max-[600px]:hidden"
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
                    if (e.key === 'Enter') {
                        if (searchValue.trim()) {
                            navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
                        }
                    }
                }}
            />

            {/* Search Icon */}
            <button
                className="absolute right-4 text-white/50 hover:text-white transition-colors max-[600px]:static max-[600px]:bg-transparent focus:outline-none max-[600px]:p-0"
                onClick={handleSearchClick}
            >
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-lg max-[600px]:text-white max-[600px]:text-2xl max-[575px]:text-xl max-[600px]:mt-[7px]"
                />
            </button>

            {/* Suggestions */}
            {searchValue.trim() && isFocused && (
                <div
                    ref={addSuggestionRef}
                    className="absolute z-[100000] top-full w-full"
                >
                    <Suggestion keyword={debouncedValue} className="w-full" />
                </div>
            )}
        </div>
    );
}

export default WebSearch;
