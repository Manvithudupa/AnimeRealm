import axios from "axios";

/**
 * AniList GraphQL API endpoint (public, no auth required).
 */
const ANILIST_API = "https://graphql.anilist.co";

/**
 * Search query: find an anime by its English title to get the numeric AniList ID.
 */
const SEARCH_QUERY = `
  query ($search: String) {
    Media(search: $search, type: ANIME) {
      id
      title { romaji english native }
    }
  }
`;

/**
 * Characters query: fetch characters with voice actors (Japanese + English).
 * Uses aliases (vaJp, vaEn) so both languages are returned in one request.
 */
const CHARACTERS_QUERY = `
  query ($id: Int) {
    Media(id: $id) {
      characters(page: 1, perPage: 50) {
        edges {
          role
          node {
            id
            name { full native }
            image { large medium }
          }
          vaJp: voiceActors(language: JAPANESE) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
          vaEn: voiceActors(language: ENGLISH) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
        }
      }
    }
  }
`;

/**
 * Parse a value that might be a numeric AniList ID.
 * Only returns a number if the value is purely numeric (all digits).
 * Slugs like "steinsgate-3" are NOT valid numeric IDs — the trailing number
 * is a season indicator, not an AniList ID.
 */
function parseNumericId(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  return null;
}

/**
 * Search AniList by anime title to find the numeric ID.
 * @param {string} title - Anime title (English or Romaji)
 * @returns {Promise<number|null>} Numeric AniList ID or null
 */
async function searchAnilistByTitle(title) {
  if (!title) return null;
  try {
    const response = await axios.post(ANILIST_API, {
      query: SEARCH_QUERY,
      variables: { search: title },
    });
    const media = response.data?.data?.Media;
    return media?.id || null;
  } catch (error) {
    console.warn("AniList search failed for:", title, error.message);
    return null;
  }
}

/**
 * Fetch characters + voice actors from AniList by numeric ID.
 * @param {number} anilistId - Numeric AniList media ID
 * @returns {Promise<Array>} Array of character objects with voice actor info
 */
async function fetchCharactersFromAnilist(anilistId) {
  try {
    const response = await axios.post(ANILIST_API, {
      query: CHARACTERS_QUERY,
      variables: { id: anilistId },
    });
    const edges = response.data?.data?.Media?.characters?.edges || [];

    return edges.map((edge) => {
      const node = edge.node || {};
      // Merge Japanese and English voice actors into a single array
      const vaJp = (edge.vaJp || []).map((va) => ({
        id: va.id,
        name: va.name?.full || "",
        image: va.image?.large || va.image?.medium || null,
        language: va.languageV2 || "Japanese",
      }));
      const vaEn = (edge.vaEn || []).map((va) => ({
        id: va.id,
        name: va.name?.full || "",
        image: va.image?.large || va.image?.medium || null,
        language: va.languageV2 || "English",
      }));

      return {
        id: node.id,
        name: node.name?.full || "",
        image: node.image?.large || node.image?.medium || null,
        role: edge.role || "BACKGROUND",
        voiceActors: [...vaJp, ...vaEn],
      };
    });
  } catch (error) {
    console.warn("AniList characters fetch failed for ID:", anilistId, error.message);
    return [];
  }
}

/**
 * Get anime characters with voice actors from AniList.
 *
 * Accepts either a numeric AniList ID or a Shirayuki slug + title.
 * If both anilistId and title are provided, anilistId is preferred.
 * If anilistId is a slug (non-numeric), it will try to resolve via title search.
 *
 * @param {string} anilistId - AniList ID (numeric) or Shirayuki slug
 * @param {string} [animeTitle] - Anime English/Romaji title (used for ID lookup)
 * @returns {Promise<Array>} Array of { id, name, image, role, voiceActors[] }
 */
export default async function getAnilistCharacters(anilistId, animeTitle) {
  try {
    // Try to parse a numeric ID directly (only if it's purely digits)
    let numericId = parseNumericId(anilistId);

    // If no numeric ID found, search AniList by title
    if (!numericId && animeTitle) {
      numericId = await searchAnilistByTitle(animeTitle);
    }

    // If still no ID, try searching by the anilistId itself (it might be a title)
    if (!numericId) {
      numericId = await searchAnilistByTitle(anilistId);
    }

    if (!numericId) {
      console.warn("Could not resolve AniList ID for:", anilistId, animeTitle);
      return [];
    }

    return await fetchCharactersFromAnilist(numericId);
  } catch (error) {
    console.error("Error fetching characters from AniList:", error);
    return [];
  }
}
