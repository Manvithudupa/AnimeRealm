/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getNextEpisodeSchedule from "@/src/utils/getNextEpisodeSchedule.utils";
import {
  getAnimepaheEpisodesByAnilistId,
  getAnimepaheEpisodes,
  getAnimepaheServers,
  getAnimepaheStreamInfo,
  searchAnimepaheBackend,
} from "@/src/utils/animepaheBackend.utils";
import {
  getAnizoneEpisodesByAnilistId,
  getAnizoneStreamInfo,
} from "@/src/utils/anizoneBackend.utils";
import {
  getKaidoEpisodes,
  getKaidoEpisodesByAnilistId,
  getKaidoServers,
  getKaidoStreamInfo,
} from "@/src/utils/kaidoBackend.utils";
import { toast } from "@/src/hooks/use-toast";

export const useWatchMultiSource = (animeId, initialEpisodeId) => {
  const [source, setSource] = useState("animepahe"); // 'animepahe', 'anizone', or 'kaido'
  const [error, setError] = useState(null);
  const [buffering, setBuffering] = useState(true);
  const [streamInfo, setStreamInfo] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [servers, setServers] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [poster, setPoster] = useState(null);
  const [intro, setIntro] = useState(null);
  const [outro, setOutro] = useState(null);
  const [episodeId, setEpisodeId] = useState(null);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(null);
  const [activeServerId, setActiveServerId] = useState(null);
  const [activeServerType, setActiveServerType] = useState(null);
  const [activeServerName, setActiveServerName] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [animepaheId, setAnimepaheId] = useState(null); // Store Animepahe anime ID
  const [downloadOptions, setDownloadOptions] = useState(null);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState(null);
  const isServerFetchInProgress = useRef(false);
  const isStreamFetchInProgress = useRef(false);
  // Cache anime info (title, anilistId, seasons…) per animeId so switching
  // between providers doesn't trigger a redundant getAnimeInfo network call.
  const animeInfoCacheRef = useRef(null); // { animeId, data, seasons, anilistId }

  // Reset state when animeId or source changes
  useEffect(() => {
    // Clear cached anime info only when the anime itself changes
    if (animeInfoCacheRef.current?.animeId !== animeId) {
      animeInfoCacheRef.current = null;
    }
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
    setPoster(null);
    setIntro(null);
    setOutro(null);
    setBuffering(true);
    setServerLoading(true);
    setError(null);
    setAnimeInfo(null);
    setSeasons(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setAnimepaheId(null);
    setDownloadOptions(null);
    setNextEpisodeSchedule(null);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
  }, [animeId, source]);

  // Fetch initial data based on source
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const scheduleData = await getNextEpisodeSchedule(animeId);
        setNextEpisodeSchedule(scheduleData?.nextEpisodeSchedule || null);
      } catch {
        setNextEpisodeSchedule(null);
      }
    };

    // Retrieve anime info from cache (same animeId) or fetch from network.
    // Defined outside fetchInitialData so it is shared by both provider paths.
    const getAnimeInfoCached = async () => {
      if (animeInfoCacheRef.current?.animeId === animeId) {
        return animeInfoCacheRef.current;
      }
      const fetched = await getAnimeInfo(animeId, false);
      const entry = {
        animeId,
        data: fetched?.data,
        seasons: fetched?.seasons,
        anilistId: fetched?.data?.anilistId,
      };
      animeInfoCacheRef.current = entry;
      return entry;
    };

    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);

        if (source === "animepahe") {
          const cached = await getAnimeInfoCached();
          const anilistId = cached.anilistId;

          let episodesData;
          if (anilistId) {
            // Preferred path: fetch episodes via AniList ID
            episodesData = await getAnimepaheEpisodesByAnilistId(anilistId);
          } else {
            // Fallback: anilistId is null — search AnimePahe by title then fetch episodes
            const title =
              typeof cached.data?.title === "string"
                ? cached.data.title
                : cached.data?.title?.english || cached.data?.title?.romaji || null;
            if (!title) {
              toast({
                title: "No stream available in AnimePahe",
                description: "Falling back to AniZone.",
              });
              setSource("anizone");
              return;
            }
            try {
              const searchResults = await searchAnimepaheBackend(title);
              const firstResult = searchResults?.data?.[0];
              const animepaheAnimeId = firstResult?.id || firstResult?.session;
              if (!animepaheAnimeId) {
                toast({
                  title: "No stream available in AnimePahe",
                  description: "Falling back to AniZone.",
                });
                setSource("anizone");
                return;
              }
              setAnimepaheId(animepaheAnimeId);
              episodesData = await getAnimepaheEpisodes(animepaheAnimeId);
            } catch (searchErr) {
              console.warn("Animepahe title search/episode fetch failed:", searchErr);
              toast({
                title: "No stream available in AnimePahe",
                description: "Falling back to AniZone.",
              });
              setSource("anizone");
              return;
            }
          }

          if (!episodesData?.episodes?.length) {
            toast({
              title: "No stream available in AnimePahe",
              description: "Falling back to AniZone.",
            });
            setSource("anizone");
            return;
          }

          setAnimeInfo(cached.data);
          setSeasons(cached.seasons);
          setEpisodes(episodesData?.episodes);
          setTotalEpisodes(episodesData?.totalEpisodes);

          // Fetch next episode schedule
          await fetchSchedule();

          const newEpisodeId =
            initialEpisodeId ||
            (episodesData?.episodes?.length > 0
              ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
              : null);
          setEpisodeId(newEpisodeId);
        } else if (source === "anizone") {
          // AniZone flow: fetch episodes via AniList provider mapping only
          const cached = await getAnimeInfoCached();
          const anilistId = cached.anilistId;

          let episodesData;
          if (anilistId) {
            episodesData = await getAnizoneEpisodesByAnilistId(anilistId);
          }

          if (!episodesData?.episodes?.length) {
            toast({
              title: "No stream available in AniZone",
              description: "Falling back to Kaido.",
            });
            setSource("kaido");
            return;
          }

          setAnimeInfo(cached.data);
          setSeasons(cached.seasons);
          setEpisodes(episodesData?.episodes);
          setTotalEpisodes(episodesData?.totalEpisodes);

          // Fetch next episode schedule
          await fetchSchedule();

          const newEpisodeIdAnizone =
            initialEpisodeId ||
            (episodesData?.episodes?.length > 0
              ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
              : null);
          setEpisodeId(newEpisodeIdAnizone);
        } else {
          // Kaido flow: fetch episodes via kaido API
          const cached = await getAnimeInfoCached();
          const anilistId = cached.anilistId;

          let episodesData;
          if (anilistId) {
            episodesData = await getKaidoEpisodesByAnilistId(anilistId);
          }

          // Fallback: fetch episodes directly via kaido endpoint using animeId
          if (!episodesData?.episodes?.length) {
            try {
              episodesData = await getKaidoEpisodes(animeId);
            } catch (err) {
              console.warn("Kaido direct episode fetch failed:", err);
            }
          }

          if (!episodesData?.episodes?.length) {
            toast({
              title: "No stream available in Kaido",
              description: "Falling back to AnimePahe.",
            });
            setSource("animepahe");
            return;
          }

          setAnimeInfo(cached.data);
          setSeasons(cached.seasons);
          setEpisodes(episodesData?.episodes);
          setTotalEpisodes(episodesData?.totalEpisodes);

          // Fetch next episode schedule
          await fetchSchedule();

          const newEpisodeIdKaido =
            initialEpisodeId ||
            (episodesData?.episodes?.length > 0
              ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
              : null);
          setEpisodeId(newEpisodeIdKaido);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setAnimeInfoLoading(false);
      }
    };
    fetchInitialData();
  }, [animeId, source]);

  useEffect(() => {
    if (!episodes || !episodeId) {
      setActiveEpisodeNum(null);
      return;
    }
    const activeEpisode = episodes.find((episode) => {
      const match = episode.id.match(/ep=(\d+)/);
      return match && match[1] === episodeId;
    });
    const newActiveEpisodeNum = activeEpisode ? activeEpisode.episode_no : null;
    if (activeEpisodeNum !== newActiveEpisodeNum) {
      setActiveEpisodeNum(newActiveEpisodeNum);
    }
  }, [episodeId, episodes]);

  useEffect(() => {
    if (!episodeId || !episodes || isServerFetchInProgress.current) return;

    const fetchServers = async () => {
      isServerFetchInProgress.current = true;
      setServerLoading(true);
      try {
        if (source === "animepahe") {
          // Find the episode data with episodeId
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }

          const response = await getAnimepaheServers(episode.episodeId);
          setServers(response.servers);
          setDownloadOptions(response.downloadOptions);

          // Select first server
          const initialServer = response.servers?.[0];
          setActiveServerType(initialServer?.type);
          setActiveServerName(initialServer?.serverName);
          setActiveServerId(initialServer?.data_id);
        } else if (source === "anizone") {
          // AniZone has no servers endpoint — use a synthetic default entry so
          // the stream-fetch effect can proceed without waiting for a real server.
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }

          const syntheticServer = {
            serverId: "anizone-default",
            serverName: "Default",
            displayName: "AniZone",
            type: "sub",
            data_id: "anizone-default",
            server_id: "sub-0",
          };
          setServers([syntheticServer]);
          setActiveServerType("sub");
          setActiveServerName("Default");
          setActiveServerId("anizone-default");
        } else {
          // Kaido flow: fetch servers via kaido episode servers API
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }

          const response = await getKaidoServers(episode.episodeId);
          setServers(response.servers);

          // Select first server
          const initialServer = response.servers?.[0];
          setActiveServerType(initialServer?.type);
          setActiveServerName(initialServer?.serverName);
          setActiveServerId(initialServer?.data_id);
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setServerLoading(false);
        isServerFetchInProgress.current = false;
      }
    };
    fetchServers();
  }, [episodeId, episodes, source]);

  useEffect(() => {
    if (
      !episodeId ||
      !activeServerId ||
      !servers ||
      isServerFetchInProgress.current ||
      isStreamFetchInProgress.current
    )
      return;

    const fetchStreamInfo = async () => {
      isStreamFetchInProgress.current = true;
      setBuffering(true);
      try {
        if (source === "animepahe") {
          const server = servers.find((srv) => srv.data_id === activeServerId);
          if (!server) {
            throw new Error("Server not found");
          }

          // Get streaming sources for Animepahe
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }
          const streamData = await getAnimepaheStreamInfo(episode.episodeId, server.type);

          // Use the first source (highest quality)
          const primarySource = streamData.sources?.[0];
          if (!primarySource) {
            throw new Error("No streaming sources available");
          }

          setStreamInfo({
            streamingLink: {
              link: { file: primarySource.url },
              headers: streamData.headers,
            },
          });
          setStreamUrl(primarySource.url);
          setSubtitles([]);
          setThumbnail(null);
          setPoster(null);
          setIntro(null);
          setOutro(null);
        } else if (source === "anizone") {
          // AniZone flow: get streaming sources via anizone sources API (no server param)
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }

          const streamData = await getAnizoneStreamInfo(episode.episodeId);

          const primarySource = streamData.sources?.[0];
          if (!primarySource) {
            throw new Error("No streaming sources available");
          }

          setStreamInfo({
            streamingLink: {
              link: { file: primarySource.url },
              headers: streamData.headers,
            },
          });
          setStreamUrl(primarySource.url);
          setSubtitles(streamData.subtitles || []);
          setThumbnail(streamData.thumbnail || null);
          setPoster(streamData.posterImage || null);
          setIntro(null);
          setOutro(null);
        } else {
          // Kaido flow: get streaming sources via kaido sources API
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }

          const server = servers.find((srv) => srv.data_id === activeServerId);
          if (!server) {
            throw new Error("Server not found");
          }

          const streamData = await getKaidoStreamInfo(
            episode.episodeId,
            server.type,
            server.displayName?.toLowerCase() || "vidcloud"
          );

          const primarySource = streamData.sources?.[0];
          if (!primarySource) {
            throw new Error("No streaming sources available");
          }

          setStreamInfo({
            streamingLink: {
              link: { file: primarySource.url },
              headers: streamData.headers,
            },
          });
          setStreamUrl(primarySource.url);
          setSubtitles(streamData.subtitles || []);
          setThumbnail(null);
          setPoster(null);
          setIntro(streamData.intro || null);
          setOutro(streamData.outro || null);
        }
      } catch (err) {
        console.error("Error fetching stream info:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStreamInfo();
  }, [episodeId, activeServerId, servers, source]);

  // changeSource resets all stream-related state in the same batch as the
  // source change so that there is never a transitional render where the new
  // source is active but old state (streamUrl, thumbnail, …) is still present.
  const changeSource = (newSource) => {
    if (newSource === source) return;
    if (animeInfoCacheRef.current?.animeId !== animeId) {
      animeInfoCacheRef.current = null;
    }
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
    setPoster(null);
    setIntro(null);
    setOutro(null);
    setBuffering(true);
    setServerLoading(true);
    setError(null);
    setAnimeInfo(null);
    setSeasons(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setAnimepaheId(null);
    setDownloadOptions(null);
    setNextEpisodeSchedule(null);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
    setSource(newSource);
  };

  return {
    source,
    setSource,
    changeSource,
    error,
    buffering,
    serverLoading,
    streamInfo,
    animeInfo,
    episodes,
    animeInfoLoading,
    totalEpisodes,
    seasons,
    servers,
    streamUrl,
    isFullOverview,
    setIsFullOverview,
    subtitles,
    thumbnail,
    poster,
    intro,
    outro,
    episodeId,
    setEpisodeId,
    activeEpisodeNum,
    setActiveEpisodeNum,
    activeServerId,
    setActiveServerId,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName,
    downloadOptions,
    nextEpisodeSchedule,
  };
};
