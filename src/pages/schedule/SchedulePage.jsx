import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight, FaStar, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import clsx from "clsx";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import getAnilistScheduleInfo from "@/src/utils/getAnilistScheduleInfo.utils";
import { useLanguage } from "@/src/context/LanguageContext";
import "./SchedulePage.css";

function formatAiringTime(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildDatesForMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleString("default", { month: "short" });
  const dates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayname = date.toLocaleString("default", { weekday: "short" });
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const fulldate = `${year}-${mm}-${dd}`;
    dates.push({ day, monthName, dayname, fulldate });
  }
  return dates;
}

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getGMTOffset() {
  const offset = new Date().getTimezoneOffset();
  const sign = offset > 0 ? "-" : "+";
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const min = String(Math.abs(offset) % 60).padStart(2, "0");
  return `GMT${sign}${h}:${min}`;
}

const SchedulePage = () => {
  const { language } = useLanguage();
  const [dates] = useState(() => buildDatesForMonth());
  const [activeDate, setActiveDate] = useState(getTodayString());
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const swiperRef = useRef(null);

  const todayString = getTodayString();
  const isToday = activeDate === todayString;
  const todayActiveIndex = dates.findIndex((d) => d.fulldate === activeDate);

  // Live clock — update every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Slide to the active date on mount / date change
  useEffect(() => {
    if (swiperRef.current && todayActiveIndex !== -1) {
      swiperRef.current.slideTo(todayActiveIndex);
    }
  }, [todayActiveIndex]);

  // Fetch ALL pages for the selected date automatically
  const fetchAllSchedule = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      setScheduleData([]);

      let allItems = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const cacheKey = `anilist-sched-${date}-p${page}`;
        const cached = sessionStorage.getItem(cacheKey);
        let result;
        if (cached) {
          result = JSON.parse(cached);
        } else {
          result = await getAnilistScheduleInfo(date, page);
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        }
        allItems = [...allItems, ...(result.data || [])];
        hasNextPage = result.hasNextPage || false;
        page++;
        if (page > 15) break; // safety cap
      }

      setScheduleData(allItems);
    } catch (err) {
      console.error("Error fetching anilist schedule:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // state setters and module imports are stable

  useEffect(() => {
    fetchAllSchedule(activeDate);
  }, [activeDate, fetchAllSchedule]);

  // Group animes by their formatted airing time (HH:MM)
  // so same-time animes appear side by side
  const timeGroups = useMemo(() => {
    const map = new Map();
    scheduleData.forEach((anime) => {
      const ts = anime.nextAiringEpisode?.airingAt;
      // Use minute-level key so animes within the same minute are grouped
      const minuteKey = ts ? String(Math.floor(ts / 60) * 60) : "tba";
      if (!map.has(minuteKey)) {
        map.set(minuteKey, {
          time: formatAiringTime(ts) || "TBA",
          ts: ts || 0,
          animes: [],
        });
      }
      map.get(minuteKey).animes.push(anime);
    });
    return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
  }, [scheduleData]);

  // The next anime to air (for today only): first group whose ts is still in the future
  const nextAiringGroupTs = useMemo(() => {
    if (!isToday) return null;
    const nowTs = Math.floor(Date.now() / 1000);
    for (const group of timeGroups) {
      if (group.ts > nowTs) return group.ts;
    }
    return null;
  }, [timeGroups, isToday]);

  // Timeline bar fill: fills to the dot position of the last aired time group
  // Using group-index ratio so the bar visually aligns with the last aired item
  const timelineProgress = useMemo(() => {
    if (!isToday || timeGroups.length === 0) return 0;
    const nowTs = Math.floor(currentTime.getTime() / 1000);

    // Find the last group whose airing time has already passed (or is right now)
    let lastAiredIndex = -1;
    for (let i = 0; i < timeGroups.length; i++) {
      if (timeGroups[i].ts > 0 && timeGroups[i].ts <= nowTs) {
        lastAiredIndex = i;
      }
    }

    if (lastAiredIndex === -1) return 0;
    if (timeGroups.length === 1) return 100;

    // Fill the bar from the first dot (0%) to the last aired dot's position
    return Math.round((lastAiredIndex / (timeGroups.length - 1)) * 100);
  }, [timeGroups, isToday, currentTime]);

  return (
    <div className="max-w-[1400px] mx-auto mt-[80px] px-4 pb-12">
      {/* Page Title + Live Clock */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-x-3">
          <FaCalendarAlt className="text-2xl text-gray-500 dark:text-white/70" />
          <h1 className="font-bold text-2xl">Airing Schedule</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-medium">
          <FaClock className="text-gray-400 dark:text-white/60 text-xs" />
          <span className="text-gray-500 dark:text-zinc-400 text-xs">({getGMTOffset()})</span>
          <span className="text-gray-800 dark:text-white tabular-nums">
            {currentTime.toLocaleDateString()}{" "}
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Date Slider */}
      <div className="relative w-full mb-8">
        <Swiper
          slidesPerView={3}
          spaceBetween={8}
          breakpoints={{
            250: { slidesPerView: 3, spaceBetween: 8 },
            640: { slidesPerView: 5, spaceBetween: 8 },
            768: { slidesPerView: 7, spaceBetween: 8 },
            1024: { slidesPerView: 10, spaceBetween: 8 },
          }}
          modules={[Navigation]}
          navigation={{ nextEl: ".sched-next", prevEl: ".sched-prev" }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {dates.map((date, index) => (
            <SwiperSlide key={index}>
              <button
                onClick={() => setActiveDate(date.fulldate)}
                className={`h-[60px] w-full flex flex-col justify-center items-center rounded-lg cursor-pointer transition-all duration-200 ${
                  activeDate === date.fulldate
                    ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                }`}
              >
                <span className="text-[16px] font-bold max-[400px]:text-[13px]">
                  {date.dayname}
                </span>
                <span
                  className={`text-[12px] ${
                    activeDate === date.fulldate
                      ? "text-gray-400 dark:text-zinc-600"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  {date.monthName} {date.day}
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="sched-next absolute top-1/2 right-[-12px] -translate-y-1/2 flex justify-center items-center cursor-pointer schedule-nav-btn z-10">
          <FaChevronRight className="text-[12px]" />
        </button>
        <button className="sched-prev absolute top-1/2 left-[-12px] -translate-y-1/2 flex justify-center items-center cursor-pointer schedule-nav-btn z-10">
          <FaChevronLeft className="text-[12px]" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-20">
          <BouncingLoader />
        </div>
      ) : error ? (
        <div className="text-center text-gray-500 dark:text-zinc-400 py-20 text-lg">
          Something went wrong. Please try again.
        </div>
      ) : scheduleData.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-zinc-400 py-20 text-lg">
          No anime scheduled for this date.
        </div>
      ) : (
        <div className="schedule-timeline-wrapper">
          {/* Vertical timeline bar */}
          <div className="schedule-timeline-bar-track">
            <div className="schedule-timeline-bar-bg">
              <div
                className="schedule-timeline-bar-fill"
                style={{ height: `${timelineProgress}%` }}
              />
            </div>
          </div>

          {/* Time groups */}
          <div className="schedule-timeline-content">
            {timeGroups.map((group) => {
              const isPast =
                isToday && group.ts > 0 && group.ts < Math.floor(Date.now() / 1000);
              const isNext = isToday && group.ts === nextAiringGroupTs;

              return (
                <div key={group.ts || group.time} className="schedule-time-group">
                  {/* Time label row with timeline dot */}
                  <div className="schedule-time-row">
                    <div
                      className={clsx("schedule-time-dot", {
                        "schedule-time-dot-past": isPast,
                        "schedule-time-dot-next": isNext,
                      })}
                    />
                    <span
                      className={clsx("schedule-time-label", {
                        "schedule-time-label-past": isPast,
                        "schedule-time-label-next": isNext,
                      })}
                    >
                      {group.time}
                    </span>
                  </div>

                  {/* Cards — side-by-side when multiple animes share the same slot */}
                  <div
                    className={clsx("schedule-cards-row", {
                      "schedule-cards-row-multi": group.animes.length > 1,
                    })}
                  >
                    {group.animes.map((anime) => {
                      const isNextAiring =
                        isNext && group.animes.indexOf(anime) === 0;
                      const title =
                        language === "EN"
                          ? anime.title?.english ||
                            anime.title?.romaji ||
                            "Unknown"
                          : anime.title?.native ||
                            anime.title?.romaji ||
                            "Unknown";

                      return (
                        <Link
                          to={`/${anime.anilistId}`}
                          key={anime.anilistId}
                          className={clsx("schedule-card group", {
                            "schedule-card-next": isNextAiring,
                          })}
                          style={
                            anime.bannerImage
                              ? { "--banner": `url(${anime.bannerImage})` }
                              : {}
                          }
                        >
                          {/* "Airing Next" badge */}
                          {isNextAiring && (
                            <span className="schedule-airing-next-tag">
                              Airing Next
                            </span>
                          )}

                          {/* Banner background */}
                          {anime.bannerImage && (
                            <div
                              className="schedule-card-banner"
                              style={{ backgroundImage: `var(--banner)` }}
                            />
                          )}

                          {/* Content overlay */}
                          <div className="schedule-card-content">
                            {/* Thumbnail */}
                            <div className="schedule-card-thumb">
                              <img
                                src={anime.image}
                                alt={title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="schedule-card-info">
                              <h3 className="schedule-card-title">{title}</h3>

                              {/* Badges row */}
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {anime.format && (
                                  <span className="schedule-badge">
                                    {anime.format}
                                  </span>
                                )}
                                {anime.score != null && (
                                  <span className="schedule-badge schedule-badge-score">
                                    <FaStar className="text-[10px] mr-[2px]" />
                                    {anime.score}
                                  </span>
                                )}
                              </div>

                              {/* Genres */}
                              {anime.genres && anime.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {anime.genres.slice(0, 3).map((genre) => (
                                    <span
                                      key={genre}
                                      className="schedule-genre-tag"
                                      style={
                                        anime.color
                                          ? {
                                              borderColor: anime.color,
                                              color: anime.color,
                                            }
                                          : {}
                                      }
                                    >
                                      {genre}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Airing info */}
                              {anime.nextAiringEpisode && (
                                <div className="schedule-airing-info">
                                  <span className="schedule-airing-time">
                                    {group.time}
                                  </span>
                                  <span className="schedule-episode-badge">
                                    EP {anime.nextAiringEpisode.episode}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
