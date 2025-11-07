import {
  FaAngleRight,
  FaCalendarDay,
  FaCirclePlay,
  FaClock,
} from "react-icons/fa6";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "./Banner.css";
import { Link } from "react-router-dom";
const HeroBanner = ({ slides }) => {
  return (
    <Swiper
      speed={400}
      grabCursor={true}
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      loop={true}
      autoplay={{ delay: 5000 }}
      pagination={{ clickable: true }}
      navigation={true}
      className="hero-swiper"
    >
      {slides &&
        slides.map((item) => (
          <SwiperSlide key={item.id} className="hero-slide">
            {/* Background image */}
            <div className="hero-bg">
              <img
                src={item.poster}
                alt={item.title}
                loading="lazy"
                className="hero-bg-img"
              />
              <div className="hero-overlay"></div>
            </div>

            {/* Content */}
            <div className="hero-content">
              <div className="hero-info text-sm md:text-base mb-3 hidden md:flex gap-6">
                <div className="item">
                  <FaCirclePlay /> <span>{item.type}</span>
                </div>
                <div className="item">
                  <FaClock /> <span>{item.duration}</span>
                </div>
                <div className="item">
                  <FaCalendarDay /> <span>{item.aired}</span>
                </div>
                <div className="item bg-primary text-black text-xs font-bold px-2 rounded-sm">
                  {item.quality}
                </div>
                <div className="item">
                  <SoundsInfo episodes={item.episodes} />
                </div>
              </div>

              <h1 className="hero-title">{item.title}</h1>
              <p className="hero-synopsis">{item.synopsis}</p>

              <div className="hero-buttons mt-5 flex gap-3">
                <Link
                  to={`/watch/${item.id}`}
                  className="hero-btn watch-btn flex items-center gap-2"
                >
                  <FaCirclePlay />
                  <span>Watch Now</span>
                </Link>
                <Link
                  to={`/anime/${item.id}`}
                  className="hero-btn detail-btn flex items-center gap-2"
                >
                  <span>Details</span>
                  <FaAngleRight />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
    </Swiper>
  );
};

export default Banner;
