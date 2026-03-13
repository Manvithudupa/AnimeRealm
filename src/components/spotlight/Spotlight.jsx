import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Thumbs, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import "./Spotlight.css";
import Banner from "../banner/Banner";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";

const Spotlight = ({ spotlights }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className="spotlight-wrapper">

      {spotlights && spotlights.length > 0 ? (

        <>
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            loop
            allowTouchMove={false}

            navigation={{
              nextEl: ".button-next",
              prevEl: ".button-prev",
            }}

            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}

            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}

            modules={[Navigation, Autoplay, Thumbs, FreeMode]}

            className="spotlight-swiper"
          >

            {/* Navigation Buttons */}
            <div className="spotlight-nav">
              <div className="button-prev"></div>
              <div className="button-next"></div>
            </div>

            {/* Slides */}
            {spotlights.map((item, index) => (
              <SwiperSlide
                key={index}
                className="spotlight-slide"
              >
                <Banner item={item} index={index} />
              </SwiperSlide>
            ))}

          </Swiper>

          {/* Thumbnail Strip */}
          <div className="spotlight-thumbs-container">
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={false}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode
              watchSlidesProgress
              modules={[FreeMode, Thumbs]}
              className="spotlight-thumbs-swiper"
            >
              {spotlights.map((item, index) => (
                <SwiperSlide key={index} className="spotlight-thumb-slide">
                  <div className="spotlight-thumb-item">
                    <OptimizedImage
                      src={item.poster || item.bannerImage}
                      alt={item.title}
                      className="spotlight-thumb-img"
                    />
                    <div className="spotlight-thumb-overlay">
                      <span className="spotlight-thumb-num">#{index + 1}</span>
                      <span className="spotlight-thumb-title">{item.title}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>

      ) : (
        <p className="text-white text-center mt-10">
          No spotlights to show.
        </p>
      )}

    </div>
  );
};

export default Spotlight;
