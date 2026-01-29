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
    <div className="spotlight-fullwidth">
      {spotlights && spotlights.length > 0 ? (
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          allowTouchMove={false}
          navigation={{ nextEl: ".button-next", prevEl: ".button-prev" }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          modules={[Navigation, Autoplay, Pagination]}
          className="h-full relative"
        >
          {/* Navigation Buttons */}
          <div className="absolute right-6 top-6 flex space-x-2 z-10">
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
        <p className="text-center text-white py-10">No spotlights to show.</p>
      )}
    </div>
  );
};

export default Spotlight;
