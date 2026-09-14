import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import RelicCard from "./RelicCard";
import { Relic } from "../types";

interface RelicCarouselProps {
  relics: Relic[];
}

const RelicCarousel: React.FC<RelicCarouselProps> = ({ relics }) => {
  if (!relics || relics.length === 0) {
    return null; // Don't render anything if there are no relics
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          // when window width is >= 768px
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          // when window width is >= 1024px
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        }}
      >
        {relics.map((relic) => (
          <SwiperSlide key={relic.title}>
            <RelicCard relic={relic} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RelicCarousel;
