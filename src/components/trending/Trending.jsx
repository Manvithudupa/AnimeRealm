import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";

const Trending = ({ trending }) => {
  const { language } = useLanguage();

  return (
    <div className="mt-6 max-[1200px]:px-4 max-md:px-0">
      <h1 className="text-[#ffbade] text-2xl font-bold max-md:pl-4">
        Trending
      </h1>

      <div className="relative mx-auto overflow-hidden mt-6">
        <Swiper
          className="w-full h-full"
          slidesPerView={3}
          spaceBetween={8} // slightly smaller spacing
          breakpoints={{
            479: { slidesPerView: 1, spaceBetween: 6 },
            640: { slidesPerView: 2, spaceBetween: 8 },
            900: { slidesPerView: 3, spaceBetween: 8 },
            1200: { slidesPerView: 4, spaceBetween: 10 },
          }}
          modules={[Pagination, Navigation]}
          navigation={{ nextEl: ".btn-next", prevEl: ".btn-prev" }}
        >
          {trending &&
            trending.map((item, idx) => (
              <SwiperSlide
                key={idx}
                className="text-center flex justify-center items-center"
              >
                <div className="relative w-full h-auto pb-[90%] overflow-hidden rounded-lg shadow-lg group max-[575px]:pb-[130%]">
                  {/* Rotated number and vertical title */}
                  <div className="absolute left-0 top-0 bottom-0 overflow-hidden w-[35px] text-center font-semibold bg-[#201F31] z-10 max-[575px]:relative max-[575px]:w-full max-[575px]:h-auto max-[575px]:flex max-[575px]:justify-between max-[575px]:items-center max-[575px]:bg-transparent">
                    <span className="absolute left-0 right-0 bottom-0 text-[20px] leading-[1.1em] text-center text-white transform -rotate-90 max-[575px]:rotate-0 max-[575px]:text-[16px]">
                      {item.number}
                    </span>
                    <div className="absolute bottom-[90px] left-[-45px] text-white text-[14px] font-medium leading-[35px] transform -rotate-90 max-[575px]:relative max-[575px]:rotate-0 max-[575px]:bottom-0 max-[575px]:left-0 max-[575px]:leading-[20px] max-[575px]:text-[14px]">
                      {language === "EN" ? item.title : item.japanese_title}
                    </div>
                  </div>

                  {/* Poster */}
                  <Link
                    to={`/${item.id}`}
                    className="absolute left-[35px] right-0 top-0 bottom-0 max-[575px]:relative max-[575px]:left-0 max-[575px]:top-0 max-[575px]:bottom-0"
                  >
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      title={item.title}
                    />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>

        {/* Navigation buttons */}
        <div className="absolute top-0 right-0 bottom-0 w-[40px] flex flex-col space-y-2 max-[759px]:hidden">
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
