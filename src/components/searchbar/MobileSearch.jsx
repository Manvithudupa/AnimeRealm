import Suggestion from '../suggestion/Suggestion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faSliders } from '@fortawesome/free-solid-svg-icons';
import useSearch from '@/src/hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/src/context/ThemeContext';

function MobileSearch({ onClose }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const {
        searchValue,
        setSearchValue,
        isFocused,
        setIsFocused,
        debouncedValue,
        suggestionRefs,
        addSuggestionRef,
    } = useSearch();

    const handleSearchClick = () => {
        if (searchValue.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
            onClose?.();
        }
    };

    const handleFilterClick = () => {
        navigate("/filter");
        onClose?.();
    };

    return (
        <div className="w-full p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        className={`w-full px-5 py-2 rounded-lg focus:outline-none transition-colors ${
                            theme === 'dark'
                                ? 'bg-[#2a2a2a]/75 text-white placeholder-white/50'
                                : 'bg-black/[0.08] text-gray-900 border border-black/[0.15] placeholder:text-gray-400'
                        }`}
                        placeholder="Search anime..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setTimeout(() => {
                                const isInsideSuggestionBox = suggestionRefs.current.some(
                                    (ref) => ref && ref.contains(document.activeElement),
                                );
                                if (!isInsideSuggestionBox) {
                                    setIsFocused(false);
                                }
                            }, 100);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchClick();
                            }
                        }}
                    />
                    {/* Search Icon */}
                    <button
                        className={`absolute right-12 top-1/2 -translate-y-1/2 transition-colors ${
                            theme === 'dark'
                                ? 'text-white/50 hover:text-white'
                                : 'text-gray-400 hover:text-gray-700'
                        }`}
                        onClick={handleSearchClick}
                    >
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="text-lg"
                        />
                    </button>
                </div>

                {/* Filter Button (replaces Random) */}
                <button
                    className={`p-[10px] aspect-square rounded-lg transition-colors flex items-center justify-center shrink-0 ${
                        theme === 'dark'
                            ? 'bg-[#2a2a2a]/75 text-white/50 hover:text-white'
                            : 'bg-black/[0.08] text-gray-500 hover:text-gray-900 border border-black/[0.15]'
                    }`}
                    onClick={handleFilterClick}
                    title="Filter Anime"
                >
                    <FontAwesomeIcon icon={faSliders} className="text-lg" />
                </button>
            </div>

            {searchValue.trim() && isFocused && (
                <div
                    ref={addSuggestionRef}
                    className="absolute z-[100000] left-0 right-0 px-4 mt-[60px]"
                >
                    <Suggestion 
                        keyword={debouncedValue} 
                        className="w-full" 
                        onSuggestionClick={onClose}
                    />
                </div>
            )}
        </div>
    );
}

export default MobileSearch;
