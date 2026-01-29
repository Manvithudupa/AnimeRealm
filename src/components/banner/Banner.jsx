import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";

function Banner({ item, index }) {
  const { language } = useLanguage();

  return (
    <section className="spotlight w-full h-full relative rounded-2xl overflow-hidden">
      {/* Background Image */}
      <img
        src={item.poster}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl spotlight-img"
      />

      {/* Overlay */}
      <div className="spotlight-overlay absolute inset-0 z-[1] rounded-2xl" />

      {/* Info Section */}
      <div
        className="absolute left-0 bottom-[80px] w-[55%] p-6 z-[2]
          max-[1390px]:w-[45%]
          max-[1300px]:w-[600px]
          max-[1120px]:w-[60%]
          max-md:w-[90%]
          max-md:bottom-[40px]
          max-[300px]:w-full"
      >
        <p className="text-[#ffbade] font-semibold text-[18px] w-fit">
          #{index + 1} Spotlight
        </p>

        <h3
          className="text-white text-5xl font-bold mt-3 line-clamp-2
          drop-shadow-[0_6px_30px_rgba(0,0,0,0.7)]
          max-[1390px]:text-[44px]
          max-[1300px]:text-3xl
          max-md:text-2xl"
        >
          {language === "EN" ? item.title : item.japanese_title}
        </h3>

        {/* Mobile Buttons */}
        <div className="hidden max-md:flex mt-4 gap-x-3">
          <Link
            to={`/watch/${item.id}`}
            className="bg-gradient-to-r from-purple-600 to-purple-500
              hover:from-purple-500 hover:to-purple-400
              text-white font-semibold px-5 py-1.5 rounded-lg
              flex items-center gap-x-2 text-sm
              shadow-md shadow-purple-500/30 transition-all"
          >
            <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
            Watch Now
          </Link>

          <Link
            to={`/${item.id}`}
            className="bg-white/10 hover:bg-white/20
              border border-white/20
              text-white font-medium px-5 py-1.5 rounded-lg
              text-sm transition-all"
          >
            Details
          </Link>
        </div>

        {/* TV Info */}
        {item.tvInfo && (
          <div className="flex items-center gap-x-5 mt-5 max-md:hidden">
            {item.tvInfo.showType && (
              <div className="info-pill">
                <FontAwesomeIcon icon={faPlay} className="info-icon" />
                <span>{item.tvInfo.showType}</span>
              </div>
            )}

            {item.tvInfo.duration && (
              <div className="info-pill">
                <FontAwesomeIcon icon={faClock} className="info-icon" />
                <span>{item.tvInfo.duration}</span>
              </div>
            )}

            {item.tvInfo.releaseDate && (
              <div className="info-pill">
                <FontAwesomeIcon icon={faCalendar} className="info-icon" />
                <span>{item.tvInfo.releaseDate}</span>
              </div>
            )}

            <div className="flex gap-x-2">
              {item.tvInfo.quality && (
                <span className="quality-pill">{item.tvInfo.quality}</span>
              )}

              <div className="flex overflow-hidden rounded-md">
                {item.tvInfo.episodeInfo?.sub && (
                  <span className="lang-pill">
                    <FontAwesomeIcon icon={faClosedCaptioning} />
                    {item.tvInfo.episodeInfo.sub}
                  </span>
                )}
                {item.tvInfo.episodeInfo?.dub && (
                  <span className="lang-pill dub">
                    <FontAwesomeIcon icon={faMicrophone} />
                    {item.tvInfo.episodeInfo.dub}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-white/70 text-[16px] mt-4 line-clamp-3 max-md:hidden">
          {item.description}
        </p>
      </div>

      {/* Desktop Buttons */}
      <div className="absolute bottom-[60px] right-[40px] flex gap-x-5 z-[2] max-md:hidden">
        <Link
          to={`/watch/${item.id}`}
          className="bg-gradient-to-r from-purple-600 to-purple-500
            hover:from-purple-500 hover:to-purple-400
            text-white font-semibold px-7 py-2 rounded-lg
            flex items-center gap-x-2.5
            shadow-lg shadow-purple-500/30
            transition-all hover:-translate-y-1"
        >
          <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
          Watch Now
        </Link>

        <Link
          to={`/${item.id}`}
          className="bg-white/10 hover:bg-white/20
            border border-white/20
            text-white font-medium px-7 py-2 rounded-lg
            transition-all hover:-translate-y-1"
        >
          Details
        </Link>
      </div>
    </section>
  );
}

export default Banner;
