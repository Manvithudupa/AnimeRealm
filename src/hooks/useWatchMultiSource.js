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
import { toast } from "@/src/hooks/use-toast";

export const useWatchMultiSource = (animeId, initialEpisodeId) => {
  const [source, setSource] = useState("animepahe"); // 'animepahe' or 'anizone'
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
  const [downloadOptions, setDownloadOptions] = useState(null);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState(null);
  const isServerFetchInProgress = useRef(false);
  const isStreamFetchInProgress = useRef(false);
  // Cache anime info (title, anilistId, seasons…) per animeId so switching
  // between providers doesn't trigger a redundant getAnimeInfo network call.
  const animeInfoCacheRef = useRef(null); // { animeId, data, seasons, anilistId }

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
    setDownloadOptions(null);
    setNextEpisodeSchedule(null);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
    setSource(newSource);
  };

  const fallbackToAnizone = (title, description) => {
    if (source !== "animepahe") return false;
    toast({ title, description });
    changeSource("anizone");
    return true;
  };

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
    setDownloadOptions(null);
    setNextEpisodeSchedule(null);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
  }, [animeId, source]);

  // Fetch initial data based on source
  useEffect(() => {
    // `ignore` is set to true in the cleanup function so that any in-flight
    // async operations triggered by a stale effect invocation (e.g. React
    // StrictMode double-invoke, rapid source-fallback transitions) do not
    // update state after the effect has been superseded.
    let ignore = false;

    const fetchSchedule = async (anilistId) => {
      try {
        const scheduleData = await getNextEpisodeSchedule(anilistId);
        if (!ignore) setNextEpisodeSchedule(scheduleData?.nextEpisodeSchedule || null);
      } catch {
        if (!ignore) setNextEpisodeSchedule(null);
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
      let didSwitchSource = false;
      const tryFallback = (title, description) => {
        if (didSwitchSource) return true;
        if (ignore) return true;
        const didFallback = fallbackToAnizone(title, description);
        if (didFallback) {
          didSwitchSource = true;
        }
        return didFallback;
      };

      try {
        if (!ignore) setAnimeInfoLoading(true);

        if (source === "animepahe") {
          const cached = await getAnimeInfoCached();
          if (ignore) return;
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
              if (tryFallback("No stream available in AnimePahe", "Switching to AniZone.")) return;
              return;
            }
            try {
              const searchResults = await searchAnimepaheBackend(title);
              if (ignore) return;
              const firstResult = searchResults?.data?.[0];
              const animepaheAnimeId = firstResult?.id || firstResult?.session;
              if (!animepaheAnimeId) {
                if (tryFallback("No stream available in AnimePahe", "Switching to AniZone.")) return;
                return;
              }
              episodesData = await getAnimepaheEpisodes(animepaheAnimeId);
            } catch (searchErr) {
              console.warn("Animepahe title search/episode fetch failed:", searchErr);
              if (tryFallback("No stream available in AnimePahe", "Switching to AniZone.")) return;
              return;
            }
          }

          if (ignore) return;

          if (!episodesData?.episodes?.length) {
            if (tryFallback("No stream available in AnimePahe", "Switching to AniZone.")) return;
            return;
          }

          if (!ignore) {
            setAnimeInfo(cached.data);
            setSeasons(cached.seasons);
            setEpisodes(episodesData?.episodes);
            setTotalEpisodes(episodesData?.totalEpisodes);
          }

          // Fetch next episode schedule
          await fetchSchedule(anilistId);

          if (!ignore) {
            const newEpisodeId =
              initialEpisodeId ||
              (episodesData?.episodes?.length > 0
                ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
                : null);
            setEpisodeId(newEpisodeId);
          }
        } else if (source === "anizone") {
          // AniZone flow: fetch episodes via AniList provider mapping only
          const cached = await getAnimeInfoCached();
          if (ignore) return;
          const anilistId = cached.anilistId;

          let episodesData;
          if (anilistId) {
            episodesData = await getAnizoneEpisodesByAnilistId(anilistId);
          }

          if (ignore) return;

          if (!episodesData?.episodes?.length) {
            if (!ignore) {
              toast({
                title: "No stream available in AniZone",
                description: "Unable to load episodes from available sources.",
              });
              setError("No episodes found in AniZone.");
            }
            return;
          }

          if (!ignore) {
            setAnimeInfo(cached.data);
            setSeasons(cached.seasons);
            setEpisodes(episodesData?.episodes);
            setTotalEpisodes(episodesData?.totalEpisodes);
          }

          // Fetch next episode schedule
          await fetchSchedule(anilistId);

          if (!ignore) {
            const newEpisodeIdAnizone =
              initialEpisodeId ||
              (episodesData?.episodes?.length > 0
                ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
                : null);
            setEpisodeId(newEpisodeIdAnizone);
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        if (!ignore && source === "animepahe") {
          if (tryFallback("AnimePahe unavailable", "Switching to AniZone.")) return;
        }
        if (!ignore) setError(err.message || "An error occurred.");
      } finally {
        if (!ignore && !didSwitchSource) setAnimeInfoLoading(false);
      }
    };
    fetchInitialData();

    return () => {
      ignore = true;
    };
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
      let didSwitchSource = false;
      const tryFallback = (title, description) => {
        if (didSwitchSource) return true;
        const didFallback = fallbackToAnizone(title, description);
        if (didFallback) {
          didSwitchSource = true;
        }
        return didFallback;
      };
      try {
        if (source === "animepahe") {
          // Find the episode data with episodeId
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          if (!episode?.episodeId) {
            throw new Error("Episode not found");
          }

          const response = await getAnimepaheServers(episode.episodeId);
          if (!response?.servers?.length) {
            if (tryFallback("AnimePahe servers unavailable", "Switching to AniZone.")) return;
            throw new Error("No servers available");
          }
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
        }
      } catch (error) {
        if (source === "animepahe") {
          if (tryFallback("AnimePahe servers unavailable", "Switching to AniZone.")) return;
        }
        console.error("Error fetching servers:", error);
        setError(error.message || "An error occurred.");
      } finally {
        if (!didSwitchSource) setServerLoading(false);
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
      let didSwitchSource = false;
      const tryFallback = (title, description) => {
        if (didSwitchSource) return true;
        const didFallback = fallbackToAnizone(title, description);
        if (didFallback) {
          didSwitchSource = true;
        }
        return didFallback;
      };
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
            if (tryFallback("AnimePahe stream unavailable", "Switching to AniZone.")) return;
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
        }
      } catch (err) {
        if (source === "animepahe") {
          if (tryFallback("AnimePahe stream unavailable", "Switching to AniZone.")) return;
        }
        console.error("Error fetching stream info:", err);
        setError(err.message || "An error occurred.");
      } finally {
        if (!didSwitchSource) setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStreamInfo();
  }, [episodeId, activeServerId, servers, source]);

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
