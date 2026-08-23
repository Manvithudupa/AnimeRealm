import axios from "axios";
import { apiUrl } from "@/src/config/api";

const POOL_SIZE = 50;

/**
 * Fetch a pool of trending anime from AniList and return one at random.
 * Multiple categories are mixed together so the user gets a diverse pick.
 *
 * @returns {Promise<string|null>} The AniList ID of a random anime, or null on failure.
 */
export default async function getRandomAnime() {
  const categories = ["trending", "popular", "airing"];
  const perPage = Math.ceil(POOL_SIZE / categories.length);

  try {
    const responses = await Promise.all(
      categories.map((category) =>
        axios
          .get(apiUrl(`/anime/top/${category}`, "anilist"), {
            params: { format: "TV", page: 1, perPage },
            timeout: 10000,
          })
          .then((res) => res.data || {})
          .catch(() => ({ data: [] }))
      )
    );

    // Collect all items from all categories
    const pool = responses.flatMap((payload) => {
      const items = Array.isArray(payload.data) ? payload.data : [];
      return items;
    });

    if (!pool.length) return null;

    // Pick a random item
    const randomIndex = Math.floor(Math.random() * pool.length);
    const pick = pool[randomIndex];

    // Return the AniList ID (could be `id`, `anilistId`, etc.)
    const id = pick?.id ?? pick?.anilistId;
    return id ? String(id) : null;
  } catch (error) {
    console.warn("Failed to fetch random anime pool:", error?.message || error);
    return null;
  }
}
