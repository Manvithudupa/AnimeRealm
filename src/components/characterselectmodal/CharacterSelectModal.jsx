import { useState, useEffect } from "react";
import { X, Loader2, Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useToast } from "@/src/hooks/use-toast.js";

export const CharacterSelectModal = ({ isOpen, onClose, onSelect, gender }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [animeList, setAnimeList] = useState([]);
  const [expandedAnime, setExpandedAnime] = useState(null);
  const [characters, setCharacters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Curated list of popular anime with unique characters
  const CURATED_ANIME = [
    { name: "Attack on Titan", id: 16498 },
    { name: "Demon Slayer", id: 101922 },
    { name: "My Hero Academia", id: 21459 },
    { name: "Jujutsu Kaisen", id: 113415 },
    { name: "One Piece", id: 21 },
    { name: "Naruto", id: 20 },
    { name: "Bleach", id: 269 },
    { name: "Hunter x Hunter", id: 11061 },
    { name: "Death Note", id: 1535 },
    { name: "Dragon Ball Z", id: 813 },
    { name: "Spy x Family", id: 140960 },
    { name: "Chainsaw Man", id: 127230 },
    { name: "Tokyo Ghoul", id: 22319 },
    { name: "Sword Art Online", id: 11757 },
    { name: "Fullmetal Alchemist: Brotherhood", id: 5114 },
    { name: "Steins;Gate", id: 9253 },
    { name: "Code Geass", id: 1575 },
    { name: "Cowboy Bebop", id: 1 },
    { name: "Neon Genesis Evangelion", id: 30 },
    { name: "One Punch Man", id: 21087 },
    { name: "Mob Psycho 100", id: 21507 },
    { name: "Vinland Saga", id: 101348 },
    { name: "Re:Zero", id: 21355 },
    { name: "Konosuba", id: 21202 },
    { name: "Overlord", id: 20832 },
    { name: "The Promised Neverland", id: 101759 },
    { name: "Dr. Stone", id: 105333 },
    { name: "Fire Force", id: 105310 },
    { name: "Black Clover", id: 21954 },
    { name: "Fairy Tail", id: 6702 },
    { name: "Haikyuu", id: 20464 },
    { name: "Kuroko no Basket", id: 11771 },
    { name: "Food Wars", id: 20923 },
    { name: "Your Lie in April", id: 20665 },
    { name: "A Silent Voice", id: 20954 },
    { name: "Your Name", id: 21519 },
    { name: "Violet Evergarden", id: 21827 },
    { name: "Fruits Basket", id: 120 },
    { name: "Toradora", id: 4224 },
    { name: "Clannad", id: 2167 },
    { name: "Angel Beats", id: 6547 },
    { name: "Anohana", id: 9989 },
    { name: "Tokyo Revengers", id: 120120 },
    { name: "86 Eighty-Six", id: 116589 },
    { name: "Vivy: Fluorite Eye's Song", id: 128546 },
    { name: "Mushoku Tensei", id: 108465 },
    { name: "That Time I Got Reincarnated as a Slime", id: 101280 },
    { name: "The Rising of the Shield Hero", id: 99263 },
    { name: "Goblin Slayer", id: 101165 },
    { name: "Jobless Reincarnation", id: 108465 },
    { name: "Kaguya-sama: Love is War", id: 101921 },
    { name: "Horimiya", id: 124080 },
    { name: "Dress-Up Darling", id: 132405 },
    { name: "Rent-a-Girlfriend", id: 113813 },
    { name: "Bocchi the Rock", id: 130003 },
    { name: "Lycoris Recoil", id: 143270 },
    { name: "Blue Lock", id: 137822 },
    { name: "Oshi no Ko", id: 150672 },
    { name: "Frieren: Beyond Journey's End", id: 154587 },
    { name: "Zom 100", id: 146065 },
    { name: "Hell's Paradise", id: 119661 },
    { name: "Wind Breaker", id: 166270 },
    { name: "Kaiju No.8", id: 143842 },
    { name: "Solo Leveling", id: 151807 },
    { name: "Mashle", id: 124085 },
    { name: "The Apothecary Diaries", id: 139613 },
    { name: "Shangri-La Frontier", id: 158498 },
    { name: "Undead Unluck", id: 143289 },
    { name: "My Dress-Up Darling", id: 132405 },
    { name: "Spy × Family", id: 140960 },
    { name: "Eminence in Shadow", id: 130298 },
    { name: "Classroom of the Elite", id: 98659 },
    { name: "Rascal Does Not Dream", id: 101291 },
    { name: "Bunny Girl Senpai", id: 101291 },
    { name: "No Game No Life", id: 19815 },
    { name: "The Devil is a Part-Timer", id: 15809 },
    { name: "Konosuba", id: 21202 }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchPopularAnime();
    }
  }, [isOpen]);

  const fetchPopularAnime = async () => {
    setLoading(true);
    try {
      // Fetch in batches to avoid rate limiting
      const batchSize = 20;
      const allAnime = [];
      
      for (let i = 0; i < CURATED_ANIME.length; i += batchSize) {
        const batch = CURATED_ANIME.slice(i, i + batchSize);
        const ids = batch.map(anime => anime.id).join(",");
        
        const query = `
          query {
            Page(page: 1, perPage: ${batchSize}) {
              media(id_in: [${ids}], type: ANIME) {
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
          allAnime.push(...result.data.Page.media);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      
      // Sort by the order in CURATED_ANIME
      const sortedAnime = CURATED_ANIME
        .map(curated => allAnime.find(anime => anime.id === curated.id))
        .filter(Boolean);
      
      setAnimeList(sortedAnime);
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
