/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodesFromAnilist from "@/src/utils/getEpisodesFromAnilist.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getServers from "../utils/getServers.utils";
import getStreamInfo from "../utils/getStreamInfo.utils";
import {
  searchAnimepaheBackend,
  getAnimepaheEpisodes,
  getAnimepaheServers,
  getAnimepaheStreamInfo,
} from "@/src/utils/animepaheBackend.utils";

export const useWatchMultiSource = (animeId, initialEpisodeId) => {
  const [source, setSource] = useState("hianime"); // 'hianime' or 'animepahe'
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
  const isServerFetchInProgress = useRef(false);
  const isStreamFetchInProgress = useRef(false);

  // Reset state when animeId or source changes
  useEffect(() => {
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
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
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
  }, [animeId, source]);

  // Fetch initial data based on source
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);
        
        if (source === "animepahe") {
          // For Animepahe, we need to search by title first
          const animeInfoData = await getAnimeInfo(animeId, false);
          const title = animeInfoData?.data?.title;
          
          if (!title) {
            throw new Error("Could not fetch anime title");
          }

          // Search Animepahe by title
          const searchResults = await searchAnimepaheBackend(title);
          const animepaheAnime = searchResults?.data?.[0];

          if (!animepaheAnime) {
            throw new Error("Anime not found on Animepahe");
          }

          setAnimepaheId(animepaheAnime.id);

          // Fetch episodes using Animepahe ID
          const episodesData = await getAnimepaheEpisodes(animepaheAnime.id);
          
          setAnimeInfo(animeInfoData?.data);
          setSeasons(animeInfoData?.seasons);
          setEpisodes(episodesData?.episodes);
          setTotalEpisodes(episodesData?.totalEpisodes);

          const newEpisodeId =
            initialEpisodeId ||
            (episodesData?.episodes?.length > 0
              ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
              : null);
          setEpisodeId(newEpisodeId);
        } else {
          // HiAnime flow: fetch anime info first to get anilistId, then use anilist episodes API
          const animeData = await getAnimeInfo(animeId, false);
          const anilistId = animeData?.data?.anilistId;
          setAnimeInfo(animeData?.data);
          setSeasons(animeData?.seasons);

          let episodesData = null;
          if (anilistId) {
            try {
              episodesData = await getEpisodesFromAnilist(anilistId);
            } catch (err) {
              console.warn("Anilist episodes fetch failed, falling back to default:", err);
              episodesData = await getEpisodes(animeId);
            }
          } else {
            episodesData = await getEpisodes(animeId);
          }

          setEpisodes(episodesData?.episodes);
          setTotalEpisodes(episodesData?.totalEpisodes);
          const newEpisodeId =
            initialEpisodeId ||
            (episodesData?.episodes?.length > 0
              ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
              : null);
          setEpisodeId(newEpisodeId);
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
        } else {
          // HiAnime flow: use the full episodeId from the episode object
          const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
          const fullEpisodeId = episode?.id || `${animeId}?ep=${episodeId}`;
          const data = await getServers(fullEpisodeId);
          const filteredServers = data?.filter(
            (server) =>
              server.serverName === "HD-1" ||
              server.serverName === "HD-2" ||
              server.serverName === "HD-3"
          );
          if (filteredServers.some((s) => s.type === "sub")) {
            filteredServers.push({
              type: "sub",
              data_id: "69696969",
              server_id: "41",
              serverName: "HD-4",
            });
          }
          if (filteredServers.some((s) => s.type === "dub")) {
            filteredServers.push({
              type: "dub",
              data_id: "96969696",
              server_id: "42",
              serverName: "HD-4",
            });
          }
          const savedServerName = localStorage.getItem("server_name");
          const savedServerType = localStorage.getItem("server_type");
          const initialServer =
            filteredServers.find(s => s.serverName === savedServerName && s.type === savedServerType) ||
            filteredServers.find(s => s.serverName === savedServerName) ||
            filteredServers.find(s => s.type === savedServerType && ["HD-1", "HD-2", "HD-3", "HD-4"].includes(s.serverName)) ||
            filteredServers[0];

          setServers(filteredServers);
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

    if (
      source === "hianime" &&
      (activeServerName?.toLowerCase() === "hd-1" || activeServerName?.toLowerCase() === "hd-4") &&
      !serverLoading
    ) {
      setBuffering(false);
      return;
    }

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
          setIntro(null);
          setOutro(null);
        } else {
          // HiAnime flow: use the full episodeId from the episode object
          const server = servers.find((srv) => srv.data_id === activeServerId);
          if (server) {
            const episode = episodes.find((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId);
            const fullEpisodeId = episode?.id || `${animeId}?ep=${episodeId}`;
            const data = await getStreamInfo(
              fullEpisodeId,
              server.serverName.toLowerCase() === "hd-3" ? "hd-1" : server.serverName.toLowerCase(),
              server.type.toLowerCase()
            );
            setStreamInfo(data);
            setStreamUrl(data?.streamingLink?.link?.file || null);
            setIntro(data?.streamingLink?.intro || null);
            setOutro(data?.streamingLink?.outro || null);
            const subtitles =
              data?.streamingLink?.tracks
                ?.filter((track) => track.kind === "captions")
                .map(({ file, label }) => ({ file, label })) || [];
            setSubtitles(subtitles);
            const thumbnailTrack = data?.streamingLink?.tracks?.find(
              (track) => track.kind === "thumbnails" && track.file
            );
            if (thumbnailTrack) setThumbnail(thumbnailTrack.file);
          } else {
            setError("No server found with the activeServerId.");
          }
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

  return {
    source,
    setSource,
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
  };
};
