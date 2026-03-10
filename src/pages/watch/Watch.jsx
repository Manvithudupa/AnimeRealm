/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useWatchMultiSource } from "@/src/hooks/useWatchMultiSource";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import IframePlayer from "@/src/components/player/IframePlayer";
import Episodelist from "@/src/components/episodelist/Episodelist";
import website_name from "@/src/config/website";
import Sidecard from "@/src/components/sidecard/Sidecard";
import {
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Servers from "@/src/components/servers/Servers";
import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import SidecardLoader from "@/src/components/Loader/Sidecard.loader";
import Watchcontrols from "@/src/components/watchcontrols/Watchcontrols";
import useWatchControl from "@/src/hooks/useWatchControl";
import Player from "@/src/components/player/Player";
import AnimePaheEmbedPlayer from "@/src/components/player/AnimePaheEmbedPlayer";
import DownloadModal from "@/src/components/downloadmodal/DownloadModal";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "@/src/components/breadcrumb/Breadcrumb";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: animeId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  let initialEpisodeId = queryParams.get("ep");
  const [tags, setTags] = useState([]);
  const { language } = useLanguage();
  const isFirstSet = useRef(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const {
    source,
    setSource,
    changeSource,
    // error,
    buffering,
    streamInfo,
    streamUrl,
    animeInfo,
    episodes,
    animeInfoLoading,
    totalEpisodes,
    isFullOverview,
    intro,
    outro,
    subtitles,
    thumbnail,
    setIsFullOverview,
    activeEpisodeNum,
    seasons,
    episodeId,
    setEpisodeId,
    activeServerId,
    setActiveServerId,
    servers,
    serverLoading,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName,
    downloadOptions,
    nextEpisodeSchedule,
  } = useWatchMultiSource(animeId, initialEpisodeId);
  const {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext,
  } = useWatchControl();
  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsRef = useRef(null);
  const episodesRef = useRef(null);

  useEffect(() => {
    if (!episodes || episodes.length === 0) return;
    
    const isValidEpisode = episodes.some(ep => {
      const epNumber = ep.id.split('ep=')[1];
      return epNumber === episodeId; 
    });
    
    // If missing or invalid episodeId, fallback to first
    if (!episodeId || !isValidEpisode) {
      const fallbackId = episodes[0].id.match(/ep=(\d+)/)?.[1];
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }
  
    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      navigate(newUrl, { replace: true });
      isFirstSet.current = false;
    } else {
      navigate(newUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, animeId, navigate, episodes]);

  // Update document title
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId]);

  // Redirect if no episodes
  useEffect(() => {
    if (totalEpisodes !== null && totalEpisodes === 0) {
      navigate(`/${animeId}`);
    }
  }, [streamInfo, episodeId, animeId, totalEpisodes, navigate]);

  useEffect(() => {
    // Function to adjust the height of episodes list to match only video + controls
    const adjustHeight = () => {
      if (window.innerWidth > 1200) {
        if (videoContainerRef.current && controlsRef.current && episodesRef.current) {
          // Calculate combined height of video container and controls
          const videoHeight = videoContainerRef.current.offsetHeight;
          const controlsHeight = controlsRef.current.offsetHeight;
          const totalHeight = videoHeight + controlsHeight;
          
          // Apply the combined height to episodes container
          episodesRef.current.style.height = `${totalHeight}px`;
        }
      } else {
        if (episodesRef.current) {
          episodesRef.current.style.height = 'auto';
        }
      }
    };

    // Initial adjustment with delay to ensure player is fully rendered
    const initialTimer = setTimeout(() => {
      adjustHeight();
    }, 500);
    
    // Set up resize listener
    window.addEventListener('resize', adjustHeight);
    
    // Create MutationObserver to monitor player changes
    const observer = new MutationObserver(() => {
      setTimeout(adjustHeight, 100);
    });
    
    // Start observing both video container and controls
    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
    
    if (controlsRef.current) {
      observer.observe(controlsRef.current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
    
    // Set up additional interval for continuous adjustments
    const intervalId = setInterval(adjustHeight, 1000);
    
    // Clean up
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      observer.disconnect();
      window.removeEventListener('resize', adjustHeight);
    };
  }, [buffering, activeServerType, activeServerName, episodeId, streamUrl, episodes]);

  function Tag({ bgColor, index, icon, text }) {
    return (
      <div
        className={`flex space-x-1 justify-center items-center px-[4px] py-[1px] text-black font-semibold text-[13px] ${
          index === 0 ? "rounded-l-[4px]" : "rounded-none"
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
        <p className="text-[12px]">{text}</p>
      </div>
    );
  }

  useEffect(() => {
    setTags([
      {
        condition: animeInfo?.animeInfo?.tvInfo?.rating,
        bgColor: "#ffffff",
        text: animeInfo?.animeInfo?.tvInfo?.rating,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.quality,
        bgColor: "#FFBADE",
        text: animeInfo?.animeInfo?.tvInfo?.quality,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.sub,
        icon: faClosedCaptioning,
        bgColor: "#B0E3AF",
        text: animeInfo?.animeInfo?.tvInfo?.sub,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.dub,
        icon: faMicrophone,
        bgColor: "#B9E7FF",
        text: animeInfo?.animeInfo?.tvInfo?.dub,
      },
    ]);
  }, [animeId, animeInfo]);
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a]">
      {/* ================= BREADCRUMB ================= */}
      <div className="pt-14">
        <Breadcrumb
          items={[
            {
              label: animeInfo
                ? (language ? animeInfo.title : (animeInfo.japanese_title || animeInfo.title))
                : "Loading…",
              href: animeInfo ? `/${animeId}` : undefined,
            },
            ...(activeEpisodeNum
              ? [{ label: `Episode ${activeEpisodeNum}` }]
              : []),
          ]}
        />
      </div>
      <div className="w-full max-w-[1920px] mx-auto pb-6 max-[1200px]:pt-2">
        <div className="grid grid-cols-[minmax(0,70%),minmax(0,30%)] gap-6 w-full h-full max-[1200px]:flex max-[1200px]:flex-col">
          {/* Left Column - Player, Controls, Servers */}
          <div className="flex flex-col w-full gap-6">
            <div ref={playerRef} className="player w-full h-fit bg-black flex flex-col rounded-xl overflow-hidden">
              {/* Video Container */}
              <div ref={videoContainerRef} className="w-full relative aspect-video bg-black">
                {!buffering ? (
                  source === "hianime" && ["hd-1", "hd-4"].includes(activeServerName.toLowerCase()) ?
                    <IframePlayer
                      episodeId={episodeId}
                      servertype={activeServerType}
                      serverName={activeServerName}
                      animeInfo={animeInfo}
                      episodeNum={activeEpisodeNum}
                      episodes={episodes}
                      playNext={(id) => setEpisodeId(id)}
                      autoNext={autoNext}
                    /> : source === "animepahe" && import.meta.env.VITE_ANIMEPAHE_M3U8_PROXY && streamUrl ?
                    <AnimePaheEmbedPlayer
                      m3u8ProxyUrl={import.meta.env.VITE_ANIMEPAHE_M3U8_PROXY}
                      streamUrl={streamUrl}
                      episodeId={episodeId}
                      episodes={episodes}
                      playNext={(id) => setEpisodeId(id)}
                      autoNext={autoNext}
                      animeInfo={animeInfo}
                      episodeNum={activeEpisodeNum}
                    /> : streamUrl ? <Player
                      streamUrl={streamUrl}
                      m3u8ProxyUrl={source === "animepahe" ? import.meta.env.VITE_ANIMEPAHE_M3U8_PROXY : null}
                      subtitles={subtitles}
                      intro={intro}
                      outro={outro}
                      serverName={activeServerName.toLowerCase()}
                      thumbnail={thumbnail}
                      autoSkipIntro={autoSkipIntro}
                      autoPlay={autoPlay}
                      autoNext={autoNext}
                      episodeId={episodeId}
                      episodes={episodes}
                      playNext={(id) => setEpisodeId(id)}
                      animeInfo={animeInfo}
                      episodeNum={activeEpisodeNum}
                      streamInfo={streamInfo}
                    /> : (
                      <div className="absolute inset-0 flex justify-center items-center bg-black">
                        <BouncingLoader />
                      </div>
                    )
                ) : (
                  <div className="absolute inset-0 flex justify-center items-center bg-black">
                    <BouncingLoader />
                  </div>
                )}
                <p className="text-center underline font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  {!buffering && !activeServerType ? (
                    servers ? (
                      <>
                        Probably this server is down, try other servers
                        <br />
                        Either reload or try again after sometime
                      </>
                    ) : (
                      <>
                        Probably streaming server is down
                        <br />
                        Either reload or try again after sometime
                      </>
                    )
                  ) : null}
                </p>
              </div>

              {/* Controls Section */}
              <div className="bg-[#121212]">
                {!buffering && (
                  <div ref={controlsRef}>
                    <Watchcontrols
                      autoPlay={autoPlay}
                      setAutoPlay={setAutoPlay}
                      autoSkipIntro={autoSkipIntro}
                      setAutoSkipIntro={setAutoSkipIntro}
                      autoNext={autoNext}
                      setAutoNext={setAutoNext}
                      episodes={episodes}
                      totalEpisodes={totalEpisodes}
                      episodeId={episodeId}
                      onButtonClick={(id) => setEpisodeId(id)}
                    />
                  </div>
                )}

                {/* Source Toggle */}
                <div className="px-3 py-2 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium">Source:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeSource("hianime")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          source === "hianime"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        HiAnime
                      </button>
                      <button
                        onClick={() => changeSource("animepahe")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          source === "animepahe"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Animepahe
                      </button>
                    </div>
                  </div>
                </div>

                {/* Title and Server Selection */}
                <div className="px-3 py-2">
                  <div>
                    <Servers
                      servers={servers}
                      activeEpisodeNum={activeEpisodeNum}
                      activeServerId={activeServerId}
                      setActiveServerId={setActiveServerId}
                      serverLoading={serverLoading}
                      setActiveServerType={setActiveServerType}
                      activeServerType={activeServerType}
                      setActiveServerName={setActiveServerName}
                    />
                  </div>
                </div>

                {/* Download Modal Button */}
                {source === "animepahe" && downloadOptions &&
                  (downloadOptions.sub?.length > 0 || downloadOptions.dub?.length > 0 || downloadOptions.raw?.length > 0) && (
                  <div className="px-3 py-2 border-t border-gray-700">
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <FontAwesomeIcon icon={faDownload} className="text-[14px]" />
                      Download Episode
                    </button>
                  </div>
                )}

                {/* Next Episode Info */}
                {episodes && episodeId && (() => {
                  const currentIndex = episodes.findIndex(
                    (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
                  );
                  const nextEp = currentIndex >= 0 && currentIndex < episodes.length - 1
                    ? episodes[currentIndex + 1]
                    : null;

                  // Only treat nextEp as "Up Next" if it has actually aired.
                  // Episodes from Anilist may include future (unaired) entries; those
                  // should instead display the schedule card below.
                  const nextEpHasAired =
                    nextEp &&
                    nextEp.aired !== false &&
                    (!nextEp.airDate || new Date(nextEp.airDate) <= new Date());

                  if (nextEp && nextEpHasAired) {
                    return (
                      <div className="px-3 pb-3">
                        <div
                          className="w-full rounded-lg bg-[#272727] flex items-center gap-3 cursor-pointer hover:bg-[#303030] transition-colors overflow-hidden"
                          onClick={() => setEpisodeId(nextEp.id.match(/ep=(\d+)/)?.[1])}
                        >
                          {nextEp.thumbnail && (
                            <div className="flex-shrink-0 w-[100px] h-[56px] relative overflow-hidden">
                              <img
                                src={source === "animepahe" ? `${import.meta.env.VITE_PROXY_URL || ""}${nextEp.thumbnail}` : nextEp.thumbnail}
                                alt={nextEp.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="flex-1 py-2 pr-3 min-w-0">
                            <p className="text-gray-400 text-xs">Up Next</p>
                            <p className="text-white text-sm font-medium truncate">
                              Ep {nextEp.episode_no}{nextEp.title ? ` — ${nextEp.title}` : ""}
                            </p>
                            {nextEp.airDate && (
                              <p className="text-gray-500 text-xs mt-0.5">{nextEp.airDate}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Determine the best schedule string to show:
                  // prefer the unaired nextEp's airDate, then fall back to the API schedule.
                  const rawSchedule =
                    (nextEp && nextEp.airDate && new Date(nextEp.airDate) > new Date())
                      ? nextEp.airDate
                      : nextEpisodeSchedule;

                  if (rawSchedule) {
                    // The API may return timestamps as "YYYY-MM-DD HH:MM:SS" (UTC).
                    // Normalise to ISO-8601 so Date() parses it correctly.
                    const isString = typeof rawSchedule === "string";
                    const normalized = isString
                      ? rawSchedule.includes("T")
                        ? rawSchedule
                        : rawSchedule.replace(" ", "T") + "Z"
                      : null;
                    if (normalized) {
                      const scheduleDate = new Date(normalized);
                      const formatted = isNaN(scheduleDate.getTime())
                        ? rawSchedule
                        : scheduleDate.toLocaleString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                      return (
                        <div className="px-3 pb-3">
                          <div className="w-full rounded-lg bg-[#272727] flex items-center gap-3 px-4 py-3">
                            <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="min-w-0">
                              <p className="text-gray-400 text-xs">Next Episode Airs</p>
                              <p className="text-white text-sm font-medium">{formatted}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Mobile-only Seasons Section */}
            {seasons?.length > 0 && (
              <div className="hidden max-[1200px]:block bg-[#141414] rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-white">More Seasons</h2>
                <div className="grid grid-cols-2 gap-2">
                  {seasons.map((season, index) => (
                    <Link
                      to={`/${season.id}`}
                      key={index}
                      className={`relative w-full aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group ${
                        animeId === String(season.id)
                          ? "ring-2 ring-white/40 shadow-lg shadow-white/10"
                          : ""
                      }`}
                    >
                      <img
                        src={season.season_poster}
                        alt={season.season}
                        className={`w-full h-full object-cover scale-150 ${
                          animeId === String(season.id)
                            ? "opacity-50"
                            : "opacity-40 group-hover:opacity-50 transition-opacity"
                        }`}
                      />
                      {/* Dots Pattern Overlay */}
                      <div 
                        className="absolute inset-0 z-10" 
                        style={{ 
                          backgroundImage: `url('data:image/svg+xml,<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="0.5" fill="white" fill-opacity="0.25"/></svg>')`,
                          backgroundSize: '3px 3px'
                        }}
                      />
                      {/* Dark Gradient Overlay */}
                      <div className={`absolute inset-0 z-20 bg-gradient-to-r ${
                        animeId === String(season.id)
                          ? "from-black/50 to-transparent"
                          : "from-black/40 to-transparent"
                      }`} />
                      {/* Title Container */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center">
                        <p className={`text-[14px] font-bold text-center px-2 transition-colors duration-300 ${
                          animeId === String(season.id)
                            ? "text-white"
                            : "text-white/90 group-hover:text-white"
                        }`}>
                          {season.season}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile-only Episodes Section */}
            <div className="hidden max-[1200px]:block">
              <div ref={episodesRef} className="episodes flex-shrink-0 bg-[#141414] rounded-lg overflow-hidden">
                {!episodes ? (
                  <div className="h-full flex items-center justify-center">
                    <BouncingLoader />
                  </div>
                ) : (
                  <Episodelist
                    episodes={episodes}
                    currentEpisode={episodeId}
                    onEpisodeClick={(id) => setEpisodeId(id)}
                    totalEpisodes={totalEpisodes}
                    source={source}
                    animeTitle={animeInfo ? (language ? animeInfo.title : (animeInfo.japanese_title || animeInfo.title)) : null}
                  />
                )}
              </div>
            </div>

            {/* Anime Info Section */}
            <div className="bg-[#141414] rounded-lg p-4">
              <div className="flex gap-x-6 max-[600px]:flex-row max-[600px]:gap-4">
                {animeInfo && animeInfo?.poster ? (
                  <img
                    src={`${animeInfo?.poster}`}
                    alt=""
                    className="w-[120px] h-[180px] object-cover rounded-md max-[600px]:w-[100px] max-[600px]:h-[150px]"
                  />
                ) : (
                  <Skeleton className="w-[120px] h-[180px] rounded-md max-[600px]:w-[100px] max-[600px]:h-[150px]" />
                )}
                <div className="flex flex-col gap-y-4 flex-1 max-[600px]:gap-y-2">
                  {animeInfo && animeInfo?.title ? (
                    <Link 
                      to={`/${animeId}`}
                      className="group"
                    >
                      <h1 className="text-[28px] font-medium text-white leading-tight group-hover:text-gray-300 transition-colors max-[600px]:text-[20px]">
                        {language ? animeInfo?.title : animeInfo?.japanese_title}
                      </h1>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-sm group-hover:text-white transition-colors max-[600px]:text-[12px] max-[600px]:mt-0.5">
                        <span>View Details</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform max-[600px]:w-3 max-[600px]:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ) : (
                    <Skeleton className="w-[170px] h-[20px] rounded-xl" />
                  )}
                  <div className="flex flex-wrap gap-2 max-[600px]:gap-1.5">
                    {animeInfo ? (
                      tags.map(
                        ({ condition, icon, text }, index) =>
                          condition && (
                            <span key={index} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm flex items-center gap-x-1 text-gray-300 max-[600px]:px-2 max-[600px]:py-0.5 max-[600px]:text-[11px]">
                              {icon && <FontAwesomeIcon icon={icon} className="text-[12px] max-[600px]:text-[10px]" />}
                              {text}
                            </span>
                          )
                      )
                    ) : (
                      <Skeleton className="w-[70px] h-[20px] rounded-xl" />
                    )}
                  </div>
                  {animeInfo?.animeInfo?.Overview && (
                    <p className="text-[15px] text-gray-400 leading-relaxed max-[600px]:text-[13px] max-[600px]:leading-normal">
                      {animeInfo?.animeInfo?.Overview.length > 270 ? (
                        <>
                          {isFullOverview
                            ? animeInfo?.animeInfo?.Overview
                            : `${animeInfo?.animeInfo?.Overview.slice(0, 270)}...`}
                          <button
                            className="ml-2 text-gray-300 hover:text-white transition-colors max-[600px]:text-[12px] max-[600px]:ml-1"
                            onClick={() => setIsFullOverview(!isFullOverview)}
                          >
                            {isFullOverview ? "Show Less" : "Read More"}
                          </button>
                        </>
                      ) : (
                        animeInfo?.animeInfo?.Overview
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop-only Seasons Section */}
            {seasons?.length > 0 && (
              <div className="bg-[#141414] rounded-lg p-4 max-[1200px]:hidden">
                <h2 className="text-xl font-semibold mb-4 text-white">More Seasons</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {seasons.map((season, index) => (
                    <Link
                      to={`/${season.id}`}
                      key={index}
                      className={`relative w-full aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group ${
                        animeId === String(season.id)
                          ? "ring-2 ring-white/40 shadow-lg shadow-white/10"
                          : ""
                      }`}
                    >
                      <img
                        src={season.season_poster}
                        alt={season.season}
                        className={`w-full h-full object-cover scale-150 ${
                          animeId === String(season.id)
                            ? "opacity-50"
                            : "opacity-40 group-hover:opacity-50 transition-opacity"
                        }`}
                      />
                      {/* Dots Pattern Overlay */}
                      <div 
                        className="absolute inset-0 z-10" 
                        style={{ 
                          backgroundImage: `url('data:image/svg+xml,<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="0.5" fill="white" fill-opacity="0.25"/></svg>')`,
                          backgroundSize: '3px 3px'
                        }}
                      />
                      {/* Dark Gradient Overlay */}
                      <div className={`absolute inset-0 z-20 bg-gradient-to-r ${
                        animeId === String(season.id)
                          ? "from-black/50 to-transparent"
                          : "from-black/40 to-transparent"
                      }`} />
                      {/* Title Container */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center">
                        <p className={`text-[14px] sm:text-[16px] font-bold text-center px-2 sm:px-4 transition-colors duration-300 ${
                          animeId === String(season.id)
                            ? "text-white"
                            : "text-white/90 group-hover:text-white"
                        }`}>
                          {season.season}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Episodes and Related (Desktop Only) */}
          <div className="flex flex-col gap-6 h-full max-[1200px]:hidden">
            {/* Episodes Section */}
            <div ref={episodesRef} className="episodes flex-shrink-0 bg-[#141414] rounded-lg overflow-hidden">
              {!episodes ? (
                <div className="h-full flex items-center justify-center">
                  <BouncingLoader />
                </div>
              ) : (
                <Episodelist
                  episodes={episodes}
                  currentEpisode={episodeId}
                  onEpisodeClick={(id) => setEpisodeId(id)}
                  totalEpisodes={totalEpisodes}
                  source={source}
                  animeTitle={animeInfo ? (language ? animeInfo.title : (animeInfo.japanese_title || animeInfo.title)) : null}
                />
              )}
            </div>

            {/* Related Anime Section */}
            {animeInfo && animeInfo.popular_data ? (
              <div className="bg-[#141414] rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-white">Popular Anime</h2>
                <Sidecard
                  data={animeInfo.popular_data}
                  className="!mt-0"
                />
              </div>
            ) : (
              <div className="mt-6">
                <SidecardLoader />
              </div>
            )}
          </div>

          {/* Mobile-only Related Section */}
          {animeInfo && animeInfo.popular_data && (
            <div className="hidden max-[1200px]:block bg-[#141414] rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 text-white">Popular Anime</h2>
              <Sidecard
                data={animeInfo.popular_data}
                className="!mt-0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        downloadOptions={downloadOptions}
      />
    </div>
  );
}
