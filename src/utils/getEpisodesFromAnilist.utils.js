import axios from "axios";

/**
 * Fetch episodes from the VITE_ANIMEPAHE_URL using Anilist endpoint
 * @param {string} anilistId - The Anilist ID of the anime
 * @param {string} provider - The provider name (default: 'hianime')
 * @returns {Promise} - Promise with episodes array and totalEpisodes
 */
export default async function getEpisodesFromAnilist(anilistId, provider = "hianime") {
  const animepaheUrl = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const response = await axios.get(
      `${animepaheUrl}/api/anilist/episodes/${anilistId}?provider=${provider}`
    );

    const providerEpisodes = response.data?.providerEpisodes || [];
    
    // Transform episodes to match the expected format
    const episodes = providerEpisodes.map((ep) => ({
      id: `ep=${ep.episodeNumber}`,
      episode_no: ep.episodeNumber,
      episodeId: ep.episodeId, // Use this for streaming
      title: ep.title || `Episode ${ep.episodeNumber}`,
      japanese_title: ep.title || `Episode ${ep.episodeNumber}`,
      thumbnail: ep.thumbnail,
      hasDub: ep.hasDub || false,
      hasSub: ep.hasSub || false,
      filler: false,
      aired: ep.aired || false,
      airDate: ep.airDate,
      overview: ep.overview,
      rating: ep.rating,
    }));

    return {
      episodes,
      totalEpisodes: episodes.length,
    };
  } catch (error) {
    console.error("Error fetching episodes from Anilist:", error);
    return error;
  }
}
