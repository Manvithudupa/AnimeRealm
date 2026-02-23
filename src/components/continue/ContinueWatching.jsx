import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import "swiper/css";
import "swiper/css/navigation";

import { FaHistory, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

import { useLanguage } from "@/src/context/LanguageContext";
import { supabase } from "@/src/integrations/supabase/client";

const ContinueWatching = () => {
  const [watchList, setWatchList] = useState([]);
  const { language } = useLanguage();
  const swiperRef = useRef(null);

  /* ===============================
     MIGRATE localStorage → Supabase
  =============================== */
  const migrateFromLocalStorage = async (userId) => {
    try {
      const old = JSON.parse(localStorage.getItem("continueWatching") || "[]");
      if (!old.length) return;

      // Use Promise.all to migrate in parallel
      await Promise.all(
        old.map((item) =>
          supabase.from("continue_watching").upsert(
            {
              user_id: userId,
              anime_id: item.id,
              episode_id: item.episodeId,
              episode_num: item.episodeNum,
              title: item.title,
              japanese_title: item.japanese_title,
              poster: item.poster,
              duration: Number(item.duration) || 0,
              left_at: Number(item.leftAt) || 0,
              adult_content: !!item.adultContent,
              updated_at: new Date().toISOString(),
            },
            { onConflict: ["user_id", "anime_id"] } // <-- overwrite same anime
          )
        )
      );

      // Remove localStorage to avoid repeated migration
      localStorage.removeItem("continueWatching");
    } catch (err) {
      console.error("Migration error:", err);
    }
  };

  /* ===============================
     LOAD WATCHLIST FROM SUPABASE
  =============================== */
  const loadWatchList = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await migrateFromLocalStorage(user.id);

      // Fetch latest episode per anime
      const { data, error } = await supabase
        .from("continue_watching")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) console.error("Load watchlist error:", error);
      else {
        // Deduplicate by anime_id, keep latest updated
        const latestPerAnime = [];
        const seen = new Set();
        for (const item of data) {
          if (!seen.has(item.anime_id)) {
            latestPerAnime.push(item);
            seen.add(item.anime_id);
          }
        }
        setWatchList(latestPerAnime);
      }
    } catch (err) {
      console.error("Error loading watchlist:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      loadWatchList();
    }

    return () => {
      mounted = false;
    };
  }, [loadWatchList]);

  const memoizedWatchList = useMemo(() => watchList, [watchList]);

  /* ===============================
     REMOVE ITEM
  =============================== */
  const removeFromWatchList = async (animeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("continue_watching")
        .delete()
        .eq("user_id", user.id)
        .eq("anime_id", animeId);

      if (error) console.error("Delete failed:", error);
      else loadWatchList();
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  if (!memoizedWatchList.length) return null;

  return (
    <div className="mt-8">
      {/* HEADER */}
      <div className="flex items-center justify-between max-md:pl-4 mb-6">
        <div className="flex items-center gap-x-3">
          <FaHistory className="text-gray-200 text-xl" />
          <h1 className="text-gray-200 text-2xl font-bold tracking-tight">
            Continue Watching
          </h1>
        </div>

        <div className="flex gap-x-3 pr-2 max-[350px]:hidden">
          <button className="continue-btn-prev bg-gray-800 text-gray-300 p-3 rounded-lg">
            <FaChevronLeft className="text-sm" />
          </button>
          <button className="continue-btn-next bg-gray-800 text-gray-300 p-3 rounded-lg">
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* SLIDER */}
      <div className="relative mx-auto overflow-hidden z-[1]">
        <Swiper
          ref={swiperRef}
          slidesPerView={3}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 4 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1300: { slidesPerView: 6 },
            1600: { slidesPerView: 7 },
          }}
          modules={[Navigation]}
          navigation={{
            nextEl: ".continue-btn-next",
            prevEl: ".continue-btn-prev",
          }}
        >
          {memoizedWatchList.map((item) => {
            const progress =
              item.left_at && item.duration
                ? Math.min((item.left_at / item.duration) * 100, 100)
                : 0;

            return (
              <SwiperSlide key={item.anime_id} className="flex justify-center">
                <div className="w-full pb-[140%] relative rounded-lg overflow-hidden group">
                  {/* REMOVE BUTTON */}
                  <button
                    className="absolute top-3 right-3 z-50 bg-black/70 text-white w-8 h-8 rounded flex items-center justify-center font-bold hover:bg-white hover:text-black transition"
                    onClick={() => removeFromWatchList(item.anime_id)}
                  >
                    ✖
                  </button>

                  {/* CARD */}
                  <Link
                    to={`/watch/${item.anime_id}?ep=${item.episode_id}`}
                    className="absolute inset-0"
                  >
                    <img
                      src={item.poster}
                      alt={item.title || item.japanese_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    {/* PLAY HOVER */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center transition">
                      <FontAwesomeIcon icon={faPlay} className="text-white text-4xl" />
                    </div>
                  </Link>

                  {/* 18+ */}
                  {item.adult_content && (
                    <div className="absolute top-3 left-3 z-50 bg-red-600 px-2 text-sm rounded">
                      18+
                    </div>
                  )}

                  {/* PROGRESS */}
                  {progress > 0 && (
                    <div className="absolute bottom-0 w-full h-1 bg-gray-700 z-30">
                      <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                    </div>
                  )}

                  {/* INFO */}
                  <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black z-40">
                    <p className="text-white font-bold truncate">
                      {language === "EN" ? item.title : item.japanese_title}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Episode {item.episode_num}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default ContinueWatching;
