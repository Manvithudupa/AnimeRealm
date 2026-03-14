import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";

const Trending = ({ trending }) => {
  const { language } = useLanguage();

  return (
    <div className="mt-6 max-[1200px]:px-4 max-md:px-0">
      <h1 className="text-white text-2xl font-bold max-md:pl-4">
        Trending
      </h1>

      <div className="pr-[60px] relative mx-auto overflow-hidden z-[1] mt-6 max-md:pr-2">
        <Swiper
          className="w-full h-full"
          slidesPerView={1.4} // default for very small screens
          spaceBetween={10}
          breakpoints={{
            360: { slidesPerView: 1.8, spaceBetween: 12 },
            480: { slidesPerView: 2.2, spaceBetween: 12 },
            640: { slidesPerView: 3, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 15 }, // reduced for tablets/iPads
            900: { slidesPerView: 4, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 15 },
            1300: { slidesPerView: 6, spaceBetween: 15 },
          }}
          modules={[Pagination, Navigation]}
          navigation={{
            nextEl: ".btn-next",
            prevEl: ".btn-prev",
          }}
        >
          {trending &&
            trending.map((item, idx) => (
              <SwiperSlide key={idx} className="flex justify-center">
                <Link
                  to={`/${item.id}`}
                  className="
                    trending-card-link
                    group relative w-full 
                    h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] 
                    overflow-hidden rounded-xl bg-[#2a2c31] shadow-lg
                  "
                >
                  {/* Poster */}
                  <div className="w-full h-full">
                    <OptimizedImage
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      lazy={true}
                    />
                  </div>

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* BIG Rank Number */}
                  <div
                    className="
                      absolute top-2 left-2
                      text-white font-extrabold leading-none
                      opacity-70
                      drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]
                      text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px]
                    "
                  >
                    {item.number}
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                    <p className="text-white font-medium truncate text-[12px] sm:text-sm md:text-[15px]">
                      {language === "EN" ? item.title : item.japanese_title}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>

        {/* Navigation buttons */}
        <div className="absolute top-0 right-0 bottom-0 w-[45px] flex flex-col space-y-2 max-[759px]:hidden">
          <div className="btn-next bg-[#383747] h-[50%] flex justify-center items-center rounded-[8px] cursor-pointer transition-all duration-300 ease-out hover:bg-purple-400 hover:text-[#383747]">
            <FaChevronRight />
          </div>

          <div className="btn-prev bg-[#383747] h-[50%] flex justify-center items-center rounded-[8px] cursor-pointer transition-all duration-300 ease-out hover:bg-purple-400 hover:text-[#383747]">
            <FaChevronLeft />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
