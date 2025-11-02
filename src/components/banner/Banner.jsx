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
    <section className="relative w-full h-full rounded-2xl overflow-hidden group">
      {/* Background */}
      <img
        src={item.poster}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1] rounded-2xl"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 z-[2] max-w-[60%] text-left text-white 
                      max-lg:max-w-[80%] max-md:max-w-[90%] max-md:p-4">

        <p className="text-pink-400 font-semibold tracking-wider text-lg max-md:text-base mb-2">
          #{index + 1} Spotlight
        </p>

        <h3 className="text-5xl font-extrabold leading-tight mb-4 
                      drop-shadow-lg max-xl:text-4xl max-md:text-2xl transition-all duration-300">
          {language === "EN" ? item.title : item.japanese_title}
        </h3>

        {/* Info bar */}
        {item.tvInfo && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 items-center text-white/80 text-sm mb-5">
            {item.tvInfo.showType && (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faPlay} className="text-pink-400" />
                <span>{item.tvInfo.showType}</span>
              </div>
            )}
            {item.tvInfo.duration && (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="text-pink-400" />
                <span>{item.tvInfo.duration}</span>
              </div>
            )}
            {item.tvInfo.releaseDate && (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCalendar} className="text-pink-400" />
                <span>{item.tvInfo.releaseDate}</span>
              </div>
            )}

            {item.tvInfo.quality && (
              <span className="bg-pink-500/20 text-pink-300 font-bold px-2 py-[2px] rounded text-xs">
                {item.tvInfo.quality}
              </span>
            )}

            {item.tvInfo.episodeInfo && (
              <div className="flex items-center gap-2">
                {item.tvInfo.episodeInfo.sub && (
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-[2px] rounded">
                    <FontAwesomeIcon icon={faClosedCaptioning} className="text-xs" />
                    <span>{item.tvInfo.episodeInfo.sub}</span>
                  </div>
                )}
                {item.tvInfo.episodeInfo.dub && (
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-[2px] rounded">
                    <FontAwesomeIcon icon={faMicrophone} className="text-xs" />
                    <span>{item.tvInfo.episodeInfo.dub}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-white/80 max-w-[80%] line-clamp-3 text-[16px] mb-6 max-md:hidden">
          {item.description}
        </p>

        {/* Buttons */}
        <div className="flex gap-x-4 max-md:gap-x-2">
          <Link
            to={`/watch/${item.id}`}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-xl
                       shadow-md shadow-pink-500/30 transition-all duration-200 flex items-center gap-x-2
                       hover:translate-y-[-2px]"
          >
            <FontAwesomeIcon icon={faPlay} className="text-sm" />
            <span>Watch Now</span>
          </Link>

          <Link
            to={`/${item.id}`}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl 
                       border border-white/20 backdrop-blur-sm transition-all duration-200 
                       flex items-center gap-x-2 hover:translate-y-[-2px]"
          >
            <span>Details</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Banner;
