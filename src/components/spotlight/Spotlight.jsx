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
    <div className="relative h-[600px] max-[1390px]:h-[500px] max-[1300px]:h-[450px] max-md:h-[400px] pt-[20px]">
      {spotlights && spotlights.length > 0 ? (
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          allowTouchMove={false}
          navigation={{ nextEl: ".button-next", prevEl: ".button-prev" }}
          pagination={{ clickable: true, dynamicBullets: false }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          modules={[Navigation, Autoplay, Pagination]}
          className="h-full rounded-2xl overflow-hidden relative"
        >
          {/* Navigation Buttons */}
          <div className="absolute right-[20px] top-[20px] flex space-x-2 z-10">
            <div className="button-prev" />
            <div className="button-next" />
          </div>

          {/* Slides */}
          {spotlights.map((item, index) => (
            <SwiperSlide key={index} className="relative">
              <Banner item={item} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p>No spotlights to show.</p>
      )}
    </div>
  );
};

export default Spotlight;
