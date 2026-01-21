import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";

const Trending = ({ trending }) => {
  const { language } = useLanguage();

  return (
    <div className="mt-6 max-[1200px]:px-4 max-md:px-0">
      <h1 className="text-[#ffffff] text-2xl font-bold max-md:pl-4">Trending</h1>

      <div className="relative mx-auto mt-6 overflow-hidden z-10">
        <Swiper
          className="w-full h-full"
          slidesPerView={3}
          spaceBetween={15}
          breakpoints={{
            479: { slidesPerView: 1, spaceBetween: 10 },
            640: { slidesPerView: 2, spaceBetween: 15 },
            900: { slidesPerView: 3, spaceBetween: 15 },
            1200: { slidesPerView: 4, spaceBetween: 15 },
            1500: { slidesPerView: 5, spaceBetween: 20 },
          }}
          modules={[Pagination, Navigation]}
          navigation={{ nextEl: ".btn-next", prevEl: ".btn-prev" }}
        >
          {trending &&
            trending.map((item, idx) => (
              <SwiperSlide key={idx} className="group relative cursor-pointer">
                <Link to={`/${item.id}`} className="block relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Poster Image */}
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                  {/* Title text overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm sm:text-base truncate">
                    {language === "EN" ? item.title : item.japanese_title}
                  </div>

                  {/* Number badge */}
                  <div className="absolute top-3 left-3 bg-[#ffbade] text-[#2a2c31] font-bold px-2 py-1 rounded-md text-[12px]">
                    #{item.number}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>

        {/* Navigation buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col space-y-2 max-[759px]:hidden z-20">
          <div className="btn-next bg-[#383747] w-10 h-10 flex justify-center items-center rounded-full cursor-pointer transition-all duration-300 hover:bg-[#ffbade] hover:text-[#383747] shadow-md">
            <FaChevronRight />
          </div>
          <div className="btn-prev bg-[#383747] w-10 h-10 flex justify-center items-center rounded-full cursor-pointer transition-all duration-300 hover:bg-[#ffbade] hover:text-[#383747] shadow-md">
            <FaChevronLeft />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
