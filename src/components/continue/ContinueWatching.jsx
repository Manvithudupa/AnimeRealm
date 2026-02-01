import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
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
    const old = JSON.parse(
      localStorage.getItem("continueWatching") || "[]"
    );

    if (!old.length) return;

    for (const item of old) {
      await supabase.from("continue_watching").upsert({
        user_id: userId,

        anime_id: item.id,
        episode_id: item.episodeId,
        episode_num: item.episodeNum,

        title: item.title,
        japanese_title: item.japanese_title,

        poster: item.poster,

        duration: item.duration,
        left_at: item.leftAt,

        adult_content: item.adultContent,

        updated_at: new Date().toISOString(),
      });
    }

    // Remove after migration
    localStorage.removeItem("continueWatching");
  };

  /* ===============================
     LOAD FROM SUPABASE
  =============================== */

  const loadWatchList = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Migrate once
    await migrateFromLocalStorage(user.id);

    const { data, error } = await supabase
      .from("continue_watching")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error) {
      setWatchList(data || []);
    }
  };

  /* ===============================
     INIT
  =============================== */

  useEffect(() => {
    loadWatchList();
  }, []);

  const memoizedWatchList = useMemo(() => watchList, [watchList]);

  /* ===============================
     REMOVE
  =============================== */

  const removeFromWatchList = async (episodeId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("continue_watching")
      .delete()
      .eq("user_id", user.id)
      .eq("episode_id", episodeId);

    loadWatchList();
  };

  if (!memoizedWatchList.length) return null;

  return (
    <div className="mt-8">

      {/* ============ HEADER ============ */}
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

      {/* ============ SLIDER ============ */}

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
              item?.left_at && item?.duration
                ? Math.min((item.left_at / item.duration) * 100, 100)
                : 0;

            return (
              <SwiperSlide
                key={item.id}
                className="flex justify-center"
              >
                <div className="w-full pb-[140%] relative rounded-lg overflow-hidden group">

                  {/* REMOVE */}
                  <button
                    className="absolute top-3 right-3 bg-black/70 text-white w-8 h-8 rounded"
                    onClick={() =>
                      removeFromWatchList(item.episode_id)
                    }
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
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />

                    {/* PLAY */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center">

                      <FontAwesomeIcon
                        icon={faPlay}
                        className="text-white text-4xl"
                      />

                    </div>
                  </Link>

                  {/* 18+ */}
                  {item.adult_content && (
                    <div className="absolute top-3 left-3 bg-red-600 px-2 text-sm rounded">
                      18+
                    </div>
                  )}

                  {/* PROGRESS */}
                  {progress > 0 && (
                    <div className="absolute bottom-0 w-full h-1 bg-gray-700">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* INFO */}
                  <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black">

                    <p className="text-white font-bold truncate">
                      {language === "EN"
                        ? item.title
                        : item.japanese_title}
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
