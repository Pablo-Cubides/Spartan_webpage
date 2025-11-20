// src/components/Carousel.tsx
"use client"; // necesario en Next.js 14+

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

interface Slide {
  id: string;
  img: string;
  alt: string;
}

interface CarouselProps {
  slides: Slide[];
}

export default function Carousel({ slides }: CarouselProps) {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={24}
        loop={true}
        autoplay={{ delay: 3000 }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-72 rounded-lg shadow-lg overflow-hidden">
              <Image src={slide.img} alt={slide.alt} fill className="object-cover" unoptimized />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
