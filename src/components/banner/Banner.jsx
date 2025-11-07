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
    <section className="spotlight relative w-full h-[600px] rounded-2xl overflow-hidden">
      {/* Background */}
      <img
        src={item.poster}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="spotlight-overlay absolute inset-0 z-[1]"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-10 z-[2] text-white max-w-[700px]">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-2">
          {item.tvInfo?.showType && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPlay} className="text-pink-400" />
              <span>{item.tvInfo.showType}</span>
            </div>
          )}
          {item.tvInfo?.duration && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-pink-400" />
              <span>{item.tvInfo.duration}</span>
            </div>
          )}
          {item.tvInfo?.releaseDate && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-pink-400" />
              <span>{item.tvInfo.releaseDate}</span>
            </div>
          )}
          {item.tvInfo?.quality && (
            <span className="bg-yellow-400/20 text-yellow-300 font-semibold px-2 py-[2px] rounded text-xs">
              {item.tvInfo.quality}
            </span>
          )}
          {item.tvInfo?.episodeInfo && (
            <>
              {item.tvInfo.episodeInfo.sub && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-[2px] rounded">
                  <FontAwesomeIcon icon={faClosedCaptioning} />
                  <span>{item.tvInfo.episodeInfo.sub}</span>
                </div>
              )}
              {item.tvInfo.episodeInfo.dub && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-[2px] rounded">
                  <FontAwesomeIcon icon={faMicrophone} />
                  <span>{item.tvInfo.episodeInfo.dub}</span>
                </div>
              )}
            </>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-xl leading-tight">
          {language === "EN" ? item.title : item.japanese_title}
        </h1>

        <p className="text-white/80 text-[16px] leading-relaxed mb-6 max-w-[90%] line-clamp-3">
          {item.description}
        </p>

        <div className="flex gap-4">
          <Link
            to={`/watch/${item.id}`}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-transform hover:-translate-y-[2px]"
          >
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
            Watch Now
          </Link>

          <Link
            to={`/${item.id}`}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl font-semibold backdrop-blur-sm transition-transform hover:-translate-y-[2px]"
          >
            Details
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Banner;
