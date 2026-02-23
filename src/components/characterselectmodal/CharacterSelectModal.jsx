import { useState, useEffect } from "react";
import { X, Loader2, Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/hooks/use-toast.js";

export const CharacterSelectModal = ({ isOpen, onClose, onSelect, gender }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [animeList, setAnimeList] = useState([]);
  const [expandedAnime, setExpandedAnime] = useState(null);
  const [characters, setCharacters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPopularAnime();
    }
  }, [isOpen]);

  const fetchPopularAnime = async () => {
    setLoading(true);
    try {
      const query = `
        query {
          Page(page: 1, perPage: 50) {
            media(type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
              }
              coverImage {
                medium
              }
            }
          }
        }
      `;

      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      if (result.data?.Page?.media) {
        setAnimeList(result.data.Page.media);
      }
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      toast({
        title: "Error",
        description: "Failed to load anime list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCharacters = async (animeId) => {
    if (characters[animeId]) {
      setExpandedAnime(expandedAnime === animeId ? null : animeId);
      return;
    }

    try {
      const query = `
        query {
          Media(id: ${animeId}) {
            characters(sort: ROLE, perPage: 25) {
              edges {
                node {
                  id
                  name {
                    full
                  }
                  image {
                    large
                  }
                  gender
                }
                role
              }
            }
          }
        }
      `;

      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      if (result.data?.Media?.characters?.edges) {
        const chars = result.data.Media.characters.edges
          .filter((edge) => edge.node.image?.large)
          .map((edge) => edge.node);

        setCharacters((prev) => ({
          ...prev,
          [animeId]: chars,
        }));
        setExpandedAnime(animeId);
      }
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    }
  };

  const handleSelectCharacter = (character) => {
    onSelect(character.image.large);
    onClose();
  };

  const getGenderFilter = () => {
    if (!gender) return null;
    if (gender === "male") return "Male";
    if (gender === "female") return "Female";
    return null;
  };

  const filterCharactersByGender = (chars) => {
    const genderFilter = getGenderFilter();
    if (!genderFilter) return chars;
    
    const filtered = chars.filter((char) => char.gender === genderFilter);
    return filtered.length > 0 ? filtered : chars;
  };

  const filteredAnimeList = animeList.filter((anime) => {
    const title = anime.title.english || anime.title.romaji;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[85vh] bg-[#0a0a0a] border border-white/25 text-white rounded-xl p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Select Avatar
          </DialogTitle>
        </div>

        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#111] border-white/25 text-white focus:border-purple-500 h-9"
            />
          </div>
        </div>

        {/* Anime List */}
        <div className="overflow-y-auto space-y-2 px-4 pb-4 flex-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : (
            filteredAnimeList.map((anime) => {
              const animeChars = characters[anime.id] || [];
              const filteredChars = filterCharactersByGender(animeChars);
              const isExpanded = expandedAnime === anime.id;

              return (
                <div key={anime.id} className="border border-white/20 rounded-lg overflow-hidden">
                  {/* Anime Header */}
                  <button
                    onClick={() => fetchCharacters(anime.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition"
                  >
                    <span className="text-left font-medium">
                      {anime.title.english || anime.title.romaji}
                    </span>
                    <svg
                      className={`h-5 w-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Characters Grid */}
                  {isExpanded && filteredChars.length > 0 && (
                    <div className="p-3 bg-black/30 grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {filteredChars.map((character) => (
                        <button
                          key={character.id}
                          onClick={() => handleSelectCharacter(character)}
                          className="group relative aspect-square rounded-full overflow-hidden border-2 border-white/20 hover:border-purple-500 transition"
                          title={character.name.full}
                        >
                          <img
                            src={character.image.large}
                            alt={character.name.full}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-center pb-1">
                            <span className="text-[9px] sm:text-[10px] opacity-0 group-hover:opacity-100 transition text-white font-medium text-center px-1 truncate w-full">
                              {character.name.full.split(" ")[0]}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isExpanded && filteredChars.length === 0 && (
                    <div className="p-4 text-center text-white/50 text-sm">
                      Loading characters...
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSelectModal;
