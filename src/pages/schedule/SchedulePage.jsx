import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight, FaStar, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
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

const SchedulePage = () => {
  const { language } = useLanguage();
  const [dates] = useState(() => buildDatesForMonth());
  const [activeDate, setActiveDate] = useState(getTodayString());
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const swiperRef = useRef(null);

  const todayActiveIndex = dates.findIndex((d) => d.fulldate === activeDate);

  useEffect(() => {
    if (swiperRef.current && todayActiveIndex !== -1) {
      swiperRef.current.slideTo(todayActiveIndex);
    }
  }, [todayActiveIndex]);

  const fetchSchedule = async (date, page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const cached = sessionStorage.getItem(`anilist-sched-${date}-p${page}`);
      let result;
      if (cached) {
        result = JSON.parse(cached);
      } else {
        result = await getAnilistScheduleInfo(date, page);
        sessionStorage.setItem(
          `anilist-sched-${date}-p${page}`,
          JSON.stringify(result)
        );
      }

      const items = result.data || [];
      setScheduleData((prev) => (append ? [...prev, ...items] : items));
      setHasNextPage(result.hasNextPage || false);
      setCurrentPage(result.currentPage || page);
      setError(null);
    } catch (err) {
      console.error("Error fetching anilist schedule:", err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setScheduleData([]);
    setCurrentPage(1);
    setHasNextPage(false);
    fetchSchedule(activeDate, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate]);

  const handleLoadMore = () => {
    fetchSchedule(activeDate, currentPage + 1, true);
  };

  return (
    <div className="max-w-[1400px] mx-auto mt-[80px] px-4 pb-12 text-white">
      {/* Page Title */}
      <div className="flex items-center gap-x-3 mb-6">
        <FaCalendarAlt className="text-2xl text-white/70" />
        <h1 className="font-bold text-2xl">Airing Schedule</h1>
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
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
              >
                <span className="text-[16px] font-bold max-[400px]:text-[13px]">
                  {date.dayname}
                </span>
                <span
                  className={`text-[12px] ${
                    activeDate === date.fulldate ? "text-zinc-600" : "text-zinc-400"
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
        <div className="text-center text-zinc-400 py-20 text-lg">
          Something went wrong. Please try again.
        </div>
      ) : scheduleData.length === 0 ? (
        <div className="text-center text-zinc-400 py-20 text-lg">
          No anime scheduled for this date.
        </div>
      ) : (
        <>
          <div className="schedule-grid">
            {scheduleData.map((anime) => {
              const title =
                language === "EN"
                  ? anime.title?.english || anime.title?.romaji || "Unknown"
                  : anime.title?.native || anime.title?.romaji || "Unknown";
              const airingTime = anime.nextAiringEpisode
                ? formatAiringTime(anime.nextAiringEpisode.airingAt)
                : null;

              return (
                <Link
                  to={`/${anime.anilistId}`}
                  key={anime.anilistId}
                  className="schedule-card group"
                  style={
                    anime.bannerImage
                      ? { "--banner": `url(${anime.bannerImage})` }
                      : {}
                  }
                >
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
                          <span className="schedule-badge">{anime.format}</span>
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
                                  ? { borderColor: anime.color, color: anime.color }
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
                          {airingTime && (
                            <span className="schedule-airing-time">{airingTime}</span>
                          )}
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

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              {loadingMore ? (
                <BouncingLoader />
              ) : (
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-all duration-200"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SchedulePage;
