/**
 * Get next episode schedule for an anime.
 *
 * Note: The Shirayuki API does not provide a next-episode-schedule endpoint.
 * This function returns null to disable the "Next Episode Airs" feature.
 * Future enhancement: could calculate from episode count and release patterns.
 */
const getNextEpisodeSchedule = async () => {
  return null;
};

export default getNextEpisodeSchedule;
