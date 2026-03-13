import axios from "axios";

export default async function getEpisodes(id) {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const response = await axios.get(
      `${base_url}/api/anilist/episodes/${id}?provider=hianime`
    );
    const episodes = response.data?.providerEpisodes || [];
    return {
      episodes: episodes.map((ep) => ({
        id: ep.episodeId,
        episode_no: ep.episodeNumber,
        title: ep.title,
        thumbnail: ep.thumbnail || null,
        overview: ep.overview || null,
        airDate: ep.aired || null,
        aired: ep.aired ?? true,
        rating: ep.rating || null,
        hasDub: ep.hasDub ?? false,
        hasSub: ep.hasSub ?? true,
      })),
      totalEpisodes: episodes.length,
    };
  } catch (error) {
    console.error("Error fetching anime episodes:", error);
    return error;
  }
}
