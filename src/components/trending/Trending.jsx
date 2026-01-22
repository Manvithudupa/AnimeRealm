import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";

const Trending = ({ trending }) => {
  const { language } = useLanguage();

  return (
    <div className="mt-6 max-[1200px]:px-4 max-md:px-0">
      <h1 className="text-[#ffffff] text-2xl font-bold max-md:pl-4">
        Trending
      </h1>

      <div className="pr-[60px] relative mx-auto overflow-hidden z-[1] mt-6 max-[759px]:pr-0">
        <Swiper
          className="w-full h-full"
          slidesPerView={3}
          spaceBetween={12}
          breakpoints={{
            479: { spaceBetween: 12 },
            575: { spaceBetween: 15 },
            640: { slidesPerView: 3, spaceBetween: 15 },
            900: { slidesPerView: 4, spaceBetween: 15 },
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
                  className="group relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-[#2a2c31] shadow-lg"
                >
                  {/* Poster */}
                  <img
                    src={item.poster}
                    alt={item.title}
                    title={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* BIG Rank Number */}
                  <div className="absolute top-3 left-3 text-[#8f7bff] text-[48px] font-extrabold leading-none drop-shadow-lg">
                    {item.number}
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-medium truncate">
                      {language === "EN"
                        ? item.title
                        : item.japanese_title}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>

        {/* Navigation buttons */}
        <div className="absolute top-0 right-0 bottom-0 w-[45px] flex flex-col space-y-2 max-[759px]:hidden">
          <div className="btn-next bg-[#383747] h-[50%] flex justify-center items-center rounded-[8px] cursor-pointer transition-all duration-300 ease-out hover:bg-[#ffbade] hover:text-[#383747]">
            <FaChevronRight />
          </div>
          <div className="btn-prev bg-[#383747] h-[50%] flex justify-center items-center rounded-[8px] cursor-pointer transition-all duration-300 ease-out hover:bg-[#ffbade] hover:text-[#383747]">
            <FaChevronLeft />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
