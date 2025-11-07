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
      <div className="relative h-[450px] max-[1390px]:h-[400px] max-[1300px]:h-[350px] max-md:h-[300px] pt-[20px]">
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
              className="h-[450px] max-[1390px]:h-full rounded-2xl overflow-hidden relative"
              style={{
                "--swiper-pagination-bullet-inactive-color":
                  "rgba(255, 255, 255, 0.5)",
                "--swiper-pagination-bullet-inactive-opacity": "1",
              }}
            >
              {/* Navigation Buttons */}
              <div className="absolute right-[20px] top-[20px] flex space-x-1.5 z-[5]">
                <div className="button-prev"></div>
                <div className="button-next"></div>
              </div>

              {/* Slides */}
              {spotlights.map((item, index) => (
                <SwiperSlide className="spotlight-slide relative" key={index}>
                  <div className="spotlight-bg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="spotlight-image"
                    />
                  </div>

                  <div className="spotlight-overlay"></div>

                  {/* Content Section */}
                  <div className="spotlight-content">
                    <div className="spotlight-meta">
                      <span className="meta-tag">TV</span>
                      <span className="meta-time">24m</span>
                      <span className="meta-date">{item.releaseDate}</span>
                      <span className="meta-quality">HD</span>
                      <span className="meta-rating">
                        <i className="fa-solid fa-star"></i> 5
                      </span>
                      <span className="meta-rating">
                        <i className="fa-solid fa-heart"></i> 5
                      </span>
                    </div>

                    <h1 className="spotlight-title">{item.title}</h1>
                    <p className="spotlight-description">{item.description}</p>

                    <div className="spotlight-buttons">
                      <button className="watch">
                        <i className="fa-solid fa-play"></i> Watch Now
                      </button>
                      <button className="details">Details</button>
                    </div>
                  </div>

                  {/* Keep Banner for structure or extra info */}
                  <Banner item={item} index={index} />
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
