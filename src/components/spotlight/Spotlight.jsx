import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Spotlight.css";

const Spotlight = ({ spotlights }) => {
  return (
    <div className="relative h-[450px] max-[1390px]:h-[400px] max-[1300px]:h-[350px] max-md:h-[300px] pt-[20px]">
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
          className="h-full rounded-2xl overflow-hidden relative"
          style={{
            "--swiper-pagination-bullet-inactive-color": "rgba(255, 255, 255, 0.5)",
          }}
        >
          {/* Navigation buttons */}
          <div className="absolute right-[20px] top-[20px] flex space-x-1.5 z-[5]">
            <div className="button-prev"></div>
            <div className="button-next"></div>
          </div>

          {/* Slides */}
          {spotlights.map((item, index) => (
            <SwiperSlide className="spotlight-slide" key={index}>
              <div className="spotlight-bg">
                <img
                  src={item.image}
                  alt={item.title}
                  className="spotlight-image"
                />
              </div>

              <div className="spotlight-overlay"></div>

              <div className="spotlight-content">
                <div className="spotlight-meta">
                  <span className="meta-tag">TV</span>
                  <span className="meta-time">24m</span>
                  <span className="meta-date">{item.releaseDate}</span>
                </div>
                <h1>{item.title}</h1>
                <p>{item.description}</p>
                <div className="spotlight-buttons">
                  <button className="watch">Watch Now</button>
                  <button className="details">Details</button>
                </div>
              </div>
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
