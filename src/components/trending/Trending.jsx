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
                      h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px]
                      overflow-hidden rounded-lg bg-black border border-white/5 shadow-2xl
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
                      text-[#eb3349] font-black leading-none
                      drop-shadow-[0_2px_8px_rgba(0,0,0,1)]
                      text-[32px] sm:text-[40px] md:text-[48px] lg:text-[54px]
                      tracking-tighter
                    "
                  >
                    {item.number}
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold truncate text-[14px] sm:text-[15px] group-hover:text-[#eb3349] transition-colors">
                      {language === "EN" ? item.title : item.japanese_title}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>

        {/* Navigation buttons */}
        <div className="absolute top-0 right-0 bottom-0 w-[45px] flex flex-col space-y-2 max-[759px]:hidden">
          <div className="btn-next bg-white/5 hover:bg-[#eb3349] h-[50%] flex justify-center items-center rounded-lg cursor-pointer transition-all duration-300 text-white">
            <FaChevronRight />
          </div>

          <div className="btn-prev bg-white/5 hover:bg-[#eb3349] h-[50%] flex justify-center items-center rounded-lg cursor-pointer transition-all duration-300 text-white">
            <FaChevronLeft />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
