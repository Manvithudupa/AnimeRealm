import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();
export function SearchProvider({ children }) {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    return (
        <SearchContext.Provider value={{ isSearchVisible, setIsSearchVisible }}>
            {children}
        </SearchContext.Provider>
    );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSearchContext = () => useContext(SearchContext);