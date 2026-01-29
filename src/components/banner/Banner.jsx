import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faClosedCaptioning, faMicrophone, faClock, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./Banner.css";

function Banner({ item, index }) {
  return (
    <section className="spotlight relative w-full h-full rounded-2xl overflow-hidden">
      {/* Background Image */}
      <img
        src={item.poster}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl spotlight-img"
      />

      {/* Overlay */}
      <div className="spotlight-overlay absolute inset-0 rounded-2xl" />

      {/* Info */}
      <div className="absolute left-6 bottom-24 w-[55%] z-10 max-md:bottom-16 max-md:w-[90%]">
        <p className="text-purple-400 font-semibold text-sm">#{index + 1} Spotlight</p>
        <h1 className="text-white text-5xl font-bold mt-2 line-clamp-2 max-md:text-2xl">{item.title}</h1>
        <p className="text-white/70 mt-3 text-sm line-clamp-3 max-md:hidden">
          {item.description || "No description available."}
        </p>

        {/* Metadata Pills */}
        <div className="flex gap-2 mt-4 max-md:hidden">
          {item.tvInfo?.showType && (
            <div className="info-pill">
              <FontAwesomeIcon icon={faPlay} className="info-icon" />
              {item.tvInfo.showType}
            </div>
          )}
          {item.tvInfo?.duration && (
            <div className="info-pill">
              <FontAwesomeIcon icon={faClock} className="info-icon" />
              {item.tvInfo.duration}
            </div>
          )}
          {item.tvInfo?.releaseDate && (
            <div className="info-pill">
              <FontAwesomeIcon icon={faCalendar} className="info-icon" />
              {new Date(item.tvInfo.releaseDate).toLocaleDateString()}
            </div>
          )}
          {item.tvInfo?.quality && <span className="quality-pill">{item.tvInfo.quality}</span>}
          {item.tvInfo?.episodeInfo && (
            <div className="flex overflow-hidden rounded-md">
              {item.tvInfo.episodeInfo.sub && (
                <span className="lang-pill">
                  <FontAwesomeIcon icon={faClosedCaptioning} /> Sub
                </span>
              )}
              {item.tvInfo.episodeInfo.dub && (
                <span className="lang-pill dub">
                  <FontAwesomeIcon icon={faMicrophone} /> Dub
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-6 right-6 flex gap-3 max-md:bottom-4 max-md:right-4">
        <Link to={`/watch/${item.id}`} className="btn-watch flex items-center gap-2">
          <FontAwesomeIcon icon={faPlay} /> Watch Now
        </Link>
        <Link to={`/${item.id}`} className="btn-details">
          More Details
        </Link>
      </div>
    </section>
  );
}

export default Banner;
