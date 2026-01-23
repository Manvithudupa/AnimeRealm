import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";

function Banner({ item, index }) {
  const { language } = useLanguage();

  return (
    <section className="spotlight">
      {/* BACKGROUND IMAGE */}
      <img src={item.poster} alt={item.title} />

      {/* OVERLAY */}
      <div className="spotlight-overlay" />

      {/* CONTENT */}
      <div className="spotlight-content">
        <p className="spotlight-rank">#{index + 1} Spotlight</p>

        <h3 className="spotlight-title">
          {language === "EN" ? item.title : item.japanese_title}
        </h3>

        {/* META INFO */}
        {item.tvInfo && (
          <div className="spotlight-meta">
            {item.tvInfo.showType && (
              <span className="meta-item">
                <FontAwesomeIcon icon={faPlay} />
                {item.tvInfo.showType}
              </span>
            )}

            {item.tvInfo.duration && (
              <span className="meta-item">
                <FontAwesomeIcon icon={faClock} />
                {item.tvInfo.duration}
              </span>
            )}

            {item.tvInfo.releaseDate && (
              <span className="meta-item">
                <FontAwesomeIcon icon={faCalendar} />
                {item.tvInfo.releaseDate}
              </span>
            )}

            {item.tvInfo.quality && (
              <span className="meta-badge">{item.tvInfo.quality}</span>
            )}

            {item.tvInfo.episodeInfo?.sub && (
              <span className="meta-badge sub">
                <FontAwesomeIcon icon={faClosedCaptioning} />
                {item.tvInfo.episodeInfo.sub}
              </span>
            )}

            {item.tvInfo.episodeInfo?.dub && (
              <span className="meta-badge dub">
                <FontAwesomeIcon icon={faMicrophone} />
                {item.tvInfo.episodeInfo.dub}
              </span>
            )}
          </div>
        )}

        {/* DESCRIPTION */}
        <p className="spotlight-desc">{item.description}</p>

        {/* ACTIONS */}
        <div className="spotlight-actions">
          <Link to={`/watch/${item.id}`} className="watch-btn">
            <FontAwesomeIcon icon={faPlay} />
            WATCH NOW
          </Link>

          <Link to={`/${item.id}`} className="details-btn">
            DETAILS
            <FaChevronRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Banner;
