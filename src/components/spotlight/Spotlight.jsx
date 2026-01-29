import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Spotlight.css";
import Banner from "../banner/Banner";

const Spotlight = ({ spotlights }) => {
  return (
    <>
      <div className="relative h-[600px] max-[1390px]:h-[500px] max-[1300px]:h-[450px] max-md:h-[400px] pt-[20px]">
        {spotlights && spotlights.length > 0 ? (
          <>
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              allowTouchMove={false}
              navigation={{
                nextEl: ".button-next",
                prevEl: ".button-prev",
              }}
              pagination={{
                clickable: true,
                dynamicBullets: false,
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[Navigation, Autoplay, Pagination]}
              className="h-full rounded-2xl overflow-hidden relative"
              style={{
                "--swiper-pagination-bullet-inactive-color": "rgba(255, 255, 255, 0.5)",
                "--swiper-pagination-bullet-inactive-opacity": "1",
              }}
            >
              {/* Navigation Arrows */}
              <div className="absolute right-[20px] top-[20px] flex space-x-1.5 z-[5]">
                <div className="button-prev"></div>
                <div className="button-next"></div>
              </div>

              {/* Slides */}
              {spotlights.map((item, index) => (
                <SwiperSlide className="relative" key={index}>
                  <Banner item={item} index={index} />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent rounded-2xl pointer-events-none" />

                  {/* Watch / Details Buttons */}
                  <div className="absolute bottom-6 right-6 flex gap-3 pointer-events-auto">
                    <a
                      href={`/watch/${item.id}/1`}
                      className="px-5 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Watch
                    </a>
                    <a
                      href={`/anime/${item.id}`}
                      className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
                    >
                      Details
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <p>No spotlights to show.</p>
        )}
      </div>
    </>
  );
};

export default Spotlight;
