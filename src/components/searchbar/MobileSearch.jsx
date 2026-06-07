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
        <div className="w-full p-4 flex flex-col">
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="h-4 w-4 text-white/50"
                    />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 bg-white/10 border border-transparent rounded-full leading-5 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all sm:text-sm"
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
