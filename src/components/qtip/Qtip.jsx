import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import getQtip from "@/src/utils/getQtip.utils";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faStar,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Qtip({ id }) {
  const [qtip, setQtip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQtipInfo = async () => {
      setLoading(true);
      try {
        const data = await getQtip(id);
        setQtip(data);
      } catch (err) {
        console.error("Error fetching anime info:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQtipInfo();
  }, [id]);

  return (
    <div className="w-[320px] h-fit rounded-xl p-4 flex justify-center items-center bg-[#3e3c50] bg-opacity-70 backdrop-blur-[10px] z-50">
      {loading || error || !qtip ? (
        <BouncingLoader />
      ) : (
        <div className="w-full flex flex-col justify-start gap-y-2">
          {/* Title */}
          <h1 className="text-xl font-semibold text-white text-[13px] leading-6">
            {qtip.title}
          </h1>

          {/* Rating + Badges */}
          <div className="w-full flex items-center relative mt-2 gap-x-3">
            {/* Rating */}
            {qtip?.rating && (
              <div className="flex gap-x-1 items-center">
                <FontAwesomeIcon icon={faStar} className="text-[#ffc107]" />
                <p className="text-[#b7b7b8] text-[13px]">{qtip.rating}</p>
              </div>
            )}

            {/* Sub / Dub Pills */}
            <div className="flex gap-x-2 items-center">
              {qtip?.subCount && (
                <div className="flex items-center gap-x-1 bg-black/80 px-2 py-[2px] rounded-full">
                  <FontAwesomeIcon
                    icon={faClosedCaptioning}
                    className="text-white text-[11px]"
                  />
                  <span className="text-white text-[11px] font-medium">
                    {qtip.subCount}
                  </span>
                </div>
              )}

              {qtip?.dubCount && (
                <div className="flex items-center gap-x-1 bg-black/80 px-2 py-[2px] rounded-full">
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className="text-white text-[11px]"
                  />
                  <span className="text-white text-[11px] font-medium">
                    {qtip.dubCount}
                  </span>
                </div>
              )}

              {qtip?.episodeCount && (
                <div className="flex items-center bg-black/80 px-2 py-[2px] rounded-full">
                  <span className="text-white text-[11px] font-medium">
                    {qtip.episodeCount}
                  </span>
                </div>
              )}
            </div>

            {/* Type Badge - now neutral */}
            {qtip?.type && (
              <div className="absolute right-0 top-0 rounded-sm bg-white/90 px-[6px]">
                <p className="font-semibold text-black text-[12px]">{qtip.type}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {qtip?.description && (
            <p className="text-[#d7d7d8] text-[13px] leading-4 font-light line-clamp-3 mt-1">
              {qtip.description}
            </p>
          )}

          {/* Info */}
          <div className="flex flex-col mt-1 gap-y-[2px]">
            {qtip?.japaneseTitle && (
              <div className="leading-4">
                <span className="text-[#b7b7b8] text-[13px]">Japanese:&nbsp;</span>
                <span className="text-[13px]">{qtip.japaneseTitle}</span>
              </div>
            )}

            {qtip?.Synonyms && (
              <div className="leading-4">
                <span className="text-[#b7b7b8] text-[13px]">Synonyms:&nbsp;</span>
                <span className="text-[13px]">{qtip.Synonyms}</span>
              </div>
            )}

            {qtip?.airedDate && (
              <div className="leading-4">
                <span className="text-[#b7b7b8] text-[13px]">Aired:&nbsp;</span>
                <span className="text-[13px]">{qtip.airedDate}</span>
              </div>
            )}

            {qtip?.status && (
              <div className="leading-4">
                <span className="text-[#b7b7b8] text-[13px]">Status:&nbsp;</span>
                <span className="text-[13px]">{qtip.status}</span>
              </div>
            )}

            {qtip?.genres && (
              <div className="leading-4 flex flex-wrap">
                <span className="text-[#b7b7b8] text-[13px]">Genres:&nbsp;</span>
                {qtip.genres.map((genre, index) => (
                  <Link
                    to={`/genre/${genre}`}
                    key={index}
                    className="text-[13px] hover:text-purple-400 transition"
                  >
                    <span>
                      {genre}
                      {index === qtip.genres.length - 1 ? "" : ","}&nbsp;
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Watch Button - now neutral */}
          <Link
            to={qtip.watchLink}
            className="w-[85%] mx-auto mt-4 flex justify-center items-center gap-x-2
                       bg-white/90
                       py-[10px] rounded-full
                       shadow-md shadow-black/30
                       hover:shadow-black/50
                       hover:scale-105
                       transition-all duration-300"
          >
            <FontAwesomeIcon
              icon={faPlay}
              className="text-black text-[14px]"
            />
            <p className="text-[14px] font-semibold text-black tracking-wide">
              Watch Now
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Qtip;
