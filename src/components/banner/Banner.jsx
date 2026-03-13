import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";

function Banner({ item, index }) {
  const { language } = useLanguage();

  return (
    // 🔥 REMOVED rounded + overflow
    <section className="spotlight w-full h-full relative">

      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <OptimizedImage
          src={item.bannerImage || item.poster}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
          lazy={false}
        />
      </div>

      {/* Overlay */}
      <div className="spotlight-overlay absolute inset-0 z-[1]" />

      {/* Left Content */}
      <div className="absolute flex flex-col left-0 bottom-[40px] w-[55%] p-6 z-[2]
        max-[1390px]:w-[45%]
        max-[1300px]:w-[600px]
        max-[1120px]:w-[60%]
        max-md:w-[90%]
        max-md:bottom-[20px]
        max-[300px]:w-full"
      >

        <p className="text-[#ffbade] font-semibold text-[20px] w-fit max-[1300px]:text-[15px]">
          #{index + 1} Spotlight
        </p>

        <h3 className="text-white line-clamp-2 text-5xl font-bold mt-4 text-left
          max-[1390px]:text-[45px]
          max-[1300px]:text-3xl
          max-[1300px]:mt-3
          max-md:text-2xl
          max-md:mt-1
          max-[575px]:text-[22px]
          max-sm:leading-6
          max-sm:w-[80%]
          max-[320px]:w-full"
        >
          {language === "EN" ? item.title : item.japanese_title}
        </h3>

        {/* Info Row */}
        <div className="flex h-fit justify-start items-center w-fit space-x-5 mt-5 max-[1300px]:mt-4 max-md:hidden">

          {item.tvInfo && (
            <>

              {item.tvInfo.showType && (
                <div className="flex space-x-1 items-center">
                  <FontAwesomeIcon
                    icon={faPlay}
                    className="text-[8px] bg-white/10 text-white px-[4px] py-[3px] rounded-full"
                  />
                  <p className="text-white/70 text-[16px]">
                    {item.tvInfo.showType}
                  </p>
                </div>
              )}

              {item.tvInfo.duration && (
                <div className="flex space-x-1 items-center">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-white/70 text-[14px]"
                  />
                  <p className="text-white/70 text-[17px]">
                    {item.tvInfo.duration}
                  </p>
                </div>
              )}

              {item.tvInfo.releaseDate && (
                <div className="flex space-x-1 items-center">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="text-white/70 text-[14px]"
                  />
                  <p className="text-white/70 text-[16px]">
                    {item.tvInfo.releaseDate}
                  </p>
                </div>
              )}

            </>
          )}

        </div>

        {/* Description */}
        <p className="text-white/70 text-[17px] font-sm mt-4 text-left line-clamp-3
          max-[1200px]:line-clamp-2
          max-[1300px]:w-[500px]
          max-[1120px]:w-[90%]
          max-md:hidden"
        >
          {item.description}
        </p>

        {/* Buttons (all screen sizes) */}
        <div className="flex mt-5 gap-x-3 max-md:mt-3 max-md:w-full max-[1300px]:mt-4">

          <Link
            to={`/watch/${item.id}`}
            className="bg-white/90 hover:bg-white text-black font-medium px-7 py-2 rounded-lg transition-all duration-200 flex items-center gap-x-2.5 shadow-lg shadow-black/10 backdrop-blur-sm
              max-md:px-5 max-md:py-1.5 max-md:text-sm"
          >
            <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
            <span>Watch Now</span>
          </Link>

          <Link
            to={`/${item.id}`}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium px-7 py-2 rounded-lg transition-all duration-200 flex items-center gap-x-2.5 backdrop-blur-sm
              max-md:px-5 max-md:py-1.5 max-md:text-sm"
          >
            <span>Details</span>
          </Link>

        </div>

      </div>

    </section>
  );
}

export default Banner;

