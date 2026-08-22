import { useState, useEffect, useRef, useCallback } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import {
  buildProviderOptions,
  fetchProviderEpisodes,
  fetchProviderSources,
} from "@/src/utils/streamingProviders.utils";
import { PROVIDER_LABELS } from "@/src/config/api";
import { toast } from "@/src/hooks/use-toast";

function mergeEpisodes(metadataEpisodes = [], providerOptions = []) {
  const byNumber = new Map();

  metadataEpisodes.forEach((episode) => {
    const number = Number(episode.episode_no);
    if (!Number.isFinite(number)) return;
    byNumber.set(number, {
      ...episode,
      id: `ep=${number}`,
      episode_no: number,
      providerEpisodeIds: { ...(episode.providerEpisodeIds || {}) },
    });
  });

  providerOptions.forEach((option) => {
    option.episodes.forEach((episode) => {
      const number = Number(episode.episode_no);
      if (!Number.isFinite(number)) return;
      const existing = byNumber.get(number) || {
        id: `ep=${number}`,
        episode_no: number,
        title: `Episode ${number}`,
        thumbnail: null,
        overview: null,
        airDate: null,
        aired: true,
        hasSub: false,
        hasDub: false,
        isFiller: false,
        providerEpisodeIds: {},
      };
      byNumber.set(number, {
        ...existing,
        title: existing.title || episode.title,
        thumbnail: existing.thumbnail || episode.thumbnail,
        airDate: existing.airDate || episode.airDate,
        hasSub: existing.hasSub || episode.hasSub,
        hasDub: existing.hasDub || episode.hasDub,
        providerEpisodeIds: {
          ...existing.providerEpisodeIds,
          [option.provider]: episode.providerEpisodeId,
        },
      });
    });
  });

  return Array.from(byNumber.values()).sort((a, b) => a.episode_no - b.episode_no);
}

function getEpisodeNumber(value) {
  const match = String(value || "").match(/(?:ep=|episode[-_ ]?)(\d+)/i);
  return match ? match[1] : String(value || "");
}

function buildServerOptions(episode, providerOptions) {
  if (!episode) return [];
  const options = [];

  providerOptions.forEach((providerOption) => {
    const providerEpisodeId = episode.providerEpisodeIds?.[providerOption.provider];
    if (!providerEpisodeId) return;
    const providerEpisode = providerOption.episodes.find(
      (item) => String(item.episode_no) === String(episode.episode_no)
    );
    const supportsSub = providerEpisode?.hasSub !== false;
    const supportsDub = Boolean(providerEpisode?.hasDub);

    if (supportsSub) {
      options.push({
        data_id: `${providerOption.provider}:sub`,
        serverId: `${providerOption.provider}:sub`,
        serverName: `${PROVIDER_LABELS[providerOption.provider] || providerOption.provider} · SUB`,
        type: "sub",
        provider: providerOption.provider,
        providerEpisodeId,
      });
    }
    if (supportsDub) {
      options.push({
        data_id: `${providerOption.provider}:dub`,
        serverId: `${providerOption.provider}:dub`,
        serverName: `${PROVIDER_LABELS[providerOption.provider] || providerOption.provider} · DUB`,
        type: "dub",
        provider: providerOption.provider,
        providerEpisodeId,
      });
    }
  });

  return options;
}

export const useWatchMultiSource = (animeId, initialEpisodeId) => {
  const [source, setSource] = useState("multisource");
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
  const [providerOptions, setProviderOptions] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const animeInfoCacheRef = useRef(null);
  const isStreamFetchInProgress = useRef(false);
  const fallbackInProgress = useRef(false);

  useEffect(() => {
    if (animeInfoCacheRef.current?.animeId !== animeId) animeInfoCacheRef.current = null;
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setActiveServerType(null);
    setActiveServerName(null);
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
    setProviderOptions([]);
    setAllSources([]);
    setCurrentSourceIndex(0);
    isStreamFetchInProgress.current = false;
    fallbackInProgress.current = false;
  }, [animeId]);

  useEffect(() => {
    let ignore = false;

    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);
        let cached = animeInfoCacheRef.current;
        if (cached?.animeId !== animeId) {
          const fetched = await getAnimeInfo(animeId, false);
          if (!fetched?.data) throw new Error("Anime metadata could not be loaded.");
          cached = {
            animeId,
            data: fetched.data,
            seasons: fetched.seasons || [],
            episodes: fetched.episodes || [],
            anilistId: fetched.data.anilistId || fetched.data.id,
          };
          animeInfoCacheRef.current = cached;
        }
        if (ignore) return;

        const anilistId = cached.anilistId || cached.data?.id;
        const title = cached.data?.title || cached.data?.japanese_title || "";
        const resolvedProviders = await buildProviderOptions(anilistId, title);
        if (ignore) return;

        const hydratedProviders = await Promise.all(
          resolvedProviders.map(async (providerOption) => ({
            ...providerOption,
            episodes: await fetchProviderEpisodes(providerOption.provider, providerOption.providerId),
          }))
        );
        const availableProviders = hydratedProviders.filter((item) => item.episodes.length > 0);
        const mergedEpisodes = mergeEpisodes(cached.episodes, availableProviders);

        if (!mergedEpisodes.length) {
          toast({ title: "No episodes available", description: "Unable to load episodes from AniList or the streaming providers." });
          setError("No episodes found.");
          return;
        }

        setAnimeInfo(cached.data);
        setSeasons(cached.seasons);
        setProviderOptions(availableProviders);
        setEpisodes(mergedEpisodes);
        setTotalEpisodes(Math.max(Number(cached.data?.episodes) || 0, mergedEpisodes.length));
        const requestedEpisode = getEpisodeNumber(initialEpisodeId);
        const episodeExists = mergedEpisodes.some((episode) => String(episode.episode_no) === requestedEpisode);
        setEpisodeId(episodeExists ? requestedEpisode : String(mergedEpisodes[0].episode_no));
      } catch (err) {
        console.error("Error fetching AniList metadata and provider episodes:", err);
        if (!ignore) setError(err.message || "An error occurred.");
      } finally {
        if (!ignore) {
          setAnimeInfoLoading(false);
          setServerLoading(false);
        }
      }
    };

    fetchInitialData();
    return () => { ignore = true; };
  }, [animeId, initialEpisodeId]);

  useEffect(() => {
    if (!episodes || !episodeId) {
      setActiveEpisodeNum(null);
      return;
    }
    const activeEpisode = episodes.find((episode) => String(episode.episode_no) === String(episodeId));
    setActiveEpisodeNum(activeEpisode?.episode_no || null);
  }, [episodeId, episodes]);

  useEffect(() => {
    if (!episodeId || !episodes) return;
    const episode = episodes.find((item) => String(item.episode_no) === String(episodeId));
    const options = buildServerOptions(episode, providerOptions);
    setServers(options);
    setServerLoading(false);
    setActiveServerId((current) => current && options.some((item) => item.data_id === current) ? current : options[0]?.data_id || null);
    setActiveServerType((current) => current && options.some((item) => item.data_id === current || item.type === current) ? current : options[0]?.type || null);
    setActiveServerName((current) => current && options.some((item) => item.serverName === current) ? current : options[0]?.serverName || null);
    setAllSources([]);
    setCurrentSourceIndex(0);
    setStreamUrl(null);
    setStreamInfo(null);
    setDownloadOptions(null);
  }, [episodeId, episodes, providerOptions]);

  useEffect(() => {
    if (!episodeId || !activeServerId || !servers || isStreamFetchInProgress.current) return;
    const selectedServer = servers.find((server) => server.data_id === activeServerId);
    if (!selectedServer) return;

    let ignore = false;
    const fetchStream = async () => {
      isStreamFetchInProgress.current = true;
      fallbackInProgress.current = false;
      setBuffering(true);
      setError(null);
      try {
        const streamData = await fetchProviderSources(
          selectedServer.provider,
          selectedServer.providerEpisodeId,
          selectedServer.type
        );
        if (ignore) return;
        const sources = streamData.sources || [];
        if (!sources.length) throw new Error("No playable sources available");
        setSource(selectedServer.provider);
        setAllSources(sources);
        setCurrentSourceIndex(0);
        setStreamInfo({
          streamingLink: {
            link: { file: sources[0].url },
            headers: streamData.headers,
          },
          allSources: sources,
          provider: selectedServer.provider,
        });
        setStreamUrl(sources[0].url);
        setSubtitles(streamData.subtitles || []);
        setThumbnail(streamData.thumbnail || null);
        setPoster(null);
        setIntro(streamData.intro || null);
        setOutro(streamData.outro || null);
        setDownloadOptions({
          sub: selectedServer.type === "sub" ? sources.map((item) => ({ serverName: `${selectedServer.serverName} · ${item.quality}`, serverId: item.url })) : [],
          dub: selectedServer.type === "dub" ? sources.map((item) => ({ serverName: `${selectedServer.serverName} · ${item.quality}`, serverId: item.url })) : [],
          raw: selectedServer.type === "raw" ? sources.map((item) => ({ serverName: `${selectedServer.serverName} · ${item.quality}`, serverId: item.url })) : [],
        });
      } catch (err) {
        console.warn(`Streaming provider ${selectedServer.provider} failed:`, err?.message || err);
        if (!ignore) setError(`${selectedServer.serverName} is unavailable. Try another source.`);
      } finally {
        if (!ignore) setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };

    fetchStream();
    return () => { ignore = true; };
  }, [episodeId, activeServerId, servers]);

  const fallbackToNextSource = useCallback(() => {
    if (fallbackInProgress.current) return;
    fallbackInProgress.current = true;

    setCurrentSourceIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < allSources.length) {
        const nextSource = allSources[nextIndex];
        setStreamUrl(nextSource.url);
        setStreamInfo((current) => current ? {
          ...current,
          streamingLink: { ...current.streamingLink, link: { file: nextSource.url } },
        } : current);
        setBuffering(true);
        setError(null);
        fallbackInProgress.current = false;
        return nextIndex;
      }

      const currentServerIndex = servers?.findIndex((server) => server.data_id === activeServerId) ?? -1;
      const nextServer = servers?.slice(currentServerIndex + 1).find(Boolean);
      if (nextServer) {
        setAllSources([]);
        setStreamUrl(null);
        setError(null);
        setActiveServerId(nextServer.data_id);
        setActiveServerType(nextServer.type);
        setActiveServerName(nextServer.serverName);
        setBuffering(true);
        fallbackInProgress.current = false;
        return 0;
      }

      setBuffering(false);
      setError("All streaming sources failed. Please try another episode or return later.");
      fallbackInProgress.current = false;
      return currentIndex;
    });
  }, [activeServerId, allSources, servers]);

  return {
    source,
    setSource,
    changeSource: setSource,
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
    allSources,
    currentSourceIndex,
    fallbackToNextSource,
  };
};
