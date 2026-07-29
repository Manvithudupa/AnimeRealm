/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import {
  getAnimepaheEpisodesByAnilistId,
  getAnimepaheServers,
  getAnimepaheStreamInfo,
} from "@/src/utils/shirayukiBackend.utils";
import { toast } from "@/src/hooks/use-toast";

export const useWatchMultiSource = (animeId, initialEpisodeId) => {
  const [source, setSource] = useState("shirayuki");
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
  const animeInfoCacheRef = useRef(null);

  // Reset state on animeId change
  useEffect(() => {
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
  }, [animeId]);

  // Fetch anime info + episodes
  useEffect(() => {
    let ignore = false;

    const fetchInitialData = async () => {
      try {
        if (!ignore) setAnimeInfoLoading(true);

        let cached = animeInfoCacheRef.current;
        if (cached?.animeId !== animeId) {
          const fetched = await getAnimeInfo(animeId, false);
          cached = {
            animeId,
            data: fetched?.data,
            seasons: fetched?.seasons,
            anilistId: fetched?.data?.anilistId,
          };
          animeInfoCacheRef.current = cached;
        }
        if (ignore) return;

        const anilistId = cached.anilistId;

        const episodesData = await getAnimepaheEpisodesByAnilistId(anilistId || animeId);
        if (ignore) return;

        if (!episodesData?.episodes?.length) {
          toast({ title: "No episodes available", description: "Unable to load episodes." });
          setError("No episodes found.");
          return;
        }

        if (!ignore) {
          setAnimeInfo(cached.data);
          setSeasons(cached.seasons);
          setEpisodes(episodesData.episodes);
          setTotalEpisodes(episodesData.totalEpisodes);
        }

        if (!ignore) {
          const newEpisodeId =
            initialEpisodeId ||
            (episodesData.episodes?.length > 0
              ? String(episodesData.episodes[0].episode_no)
              : null);
          setEpisodeId(newEpisodeId);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        if (!ignore) setError(err.message || "An error occurred.");
      } finally {
        if (!ignore) setAnimeInfoLoading(false);
      }
    };

    fetchInitialData();
    return () => { ignore = true; };
  }, [animeId]);

  // Sync active episode number
  useEffect(() => {
    if (!episodes || !episodeId) {
      setActiveEpisodeNum(null);
      return;
    }
    const activeEpisode = episodes.find((ep) => String(ep.episode_no) === String(episodeId));
    setActiveEpisodeNum(activeEpisode ? activeEpisode.episode_no : null);
  }, [episodeId, episodes]);

  // Fetch servers
  useEffect(() => {
    if (!episodeId || !episodes || isServerFetchInProgress.current) return;

    const fetchServers = async () => {
      isServerFetchInProgress.current = true;
      setServerLoading(true);
      try {
        const episode = episodes.find((ep) => String(ep.episode_no) === String(episodeId));
        const apiEpisodeId = episode?.episodeId || `${animeId}/ep-${episodeId}`;

        const response = await getAnimepaheServers(apiEpisodeId);
        if (!response?.servers?.length) throw new Error("No servers available");

        setServers(response.servers);
        setDownloadOptions(response.downloadOptions);

        // Don't auto-select a server here — the Servers component handles
        // initial selection with localStorage restoration via its own effect.
      } catch (error) {
        console.error("Error fetching servers:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setServerLoading(false);
        isServerFetchInProgress.current = false;
      }
    };
    fetchServers();
  }, [episodeId, episodes]);

  // Fetch stream info when server is selected
  useEffect(() => {
    if (!episodeId || !activeServerId || !servers ||
        isServerFetchInProgress.current || isStreamFetchInProgress.current) return;

    const fetchStream = async () => {
      isStreamFetchInProgress.current = true;
      setBuffering(true);
      try {
        const server = servers.find((srv) => srv.data_id === activeServerId);
        if (!server) throw new Error("Server not found");

        const episode = episodes.find((ep) => String(ep.episode_no) === String(episodeId));
        const apiEpisodeId = episode?.episodeId || `${animeId}/ep-${episodeId}`;

        const streamData = await getAnimepaheStreamInfo(apiEpisodeId, server.type, server.serverName?.toLowerCase());

        const primarySource = streamData.sources?.[0];
        if (!primarySource) throw new Error("No streaming sources available");

        setStreamInfo({
          streamingLink: {
            link: { file: primarySource.url },
            headers: streamData.headers,
          },
        });
        setStreamUrl(primarySource.url);
        setSubtitles(streamData.subtitles || []);
        setThumbnail(streamData.thumbnail || null);
        setPoster(null);

        // Extract intro/outro from the stream data (Shirayuki API may return null)
        const introData = streamData.intro || null;
        const outroData = streamData.outro || null;
        setIntro(introData);
        setOutro(outroData);
      } catch (err) {
        console.error("Error fetching stream info:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStream();
  }, [episodeId, activeServerId, servers]);

  return {
    source, setSource, changeSource: setSource,
    error, buffering, serverLoading, streamInfo, animeInfo, episodes,
    animeInfoLoading, totalEpisodes, seasons, servers, streamUrl,
    isFullOverview, setIsFullOverview, subtitles, thumbnail, poster, intro, outro,
    episodeId, setEpisodeId, activeEpisodeNum, setActiveEpisodeNum,
    activeServerId, setActiveServerId, activeServerType, setActiveServerType,
    activeServerName, setActiveServerName, downloadOptions, nextEpisodeSchedule,
  };
};
