'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

import { heroSlides } from './heroSlides'

/**
 * Full-width hero banner carousel.
 *
 * Cross-fades between the banners in `heroSlides.ts` with a slow Ken Burns
 * zoom on whichever slide is showing (the zoom is CSS, keyed off Swiper's
 * own `swiper-slide-active` class — see globals.css).
 */
const HeroCarousel = () => {
    const swiperRef = useRef<SwiperClass | null>(null)

    return (
        <section
            aria-label="Featured collections"
            className="relative w-full overflow-hidden bg-ivory"
        >
            <Swiper
                onSwiper={(swiper) => {
                    swiperRef.current = swiper
                }}
                modules={[Autoplay, EffectFade, Pagination, Keyboard, A11y]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={1000}
                loop
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                keyboard={{ enabled: true }}
                pagination={{ clickable: true }}
                className="hero-swiper w-full"
            >
                {heroSlides.map((slide, index) => (
                    <SwiperSlide key={slide.src}>
                        {/* Taller crop on phones so the banner still has presence,
                            full 16:9 artwork from tablets up. */}
                        <div className="relative aspect-4/3 w-full sm:aspect-video">
                            <Image
                                src={slide.src}
                                alt={slide.alt}
                                fill
                                // Full-bleed at every breakpoint.
                                sizes="100vw"
                                // First banner is above the fold; the rest can wait.
                                priority={index === 0}
                                className="hero-swiper__image object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Arrows: desktop only — phones get swipe + bullets instead. */}
            <button
                type="button"
                aria-label="Previous banner"
                onClick={() => swiperRef.current?.slidePrev()}
                className="
                    absolute left-4 top-1/2 z-10
                    hidden h-11 w-11
                    -translate-y-1/2
                    items-center justify-center
                    rounded-full
                    border border-champagne/50
                    bg-ivory/70
                    text-burgundy
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:bg-ivory hover:border-burgundy/40
                    md:flex
                    lg:left-8
                "
            >
                <span aria-hidden="true" className="text-lg leading-none">
                    ‹
                </span>
            </button>

            <button
                type="button"
                aria-label="Next banner"
                onClick={() => swiperRef.current?.slideNext()}
                className="
                    absolute right-4 top-1/2 z-10
                    hidden h-11 w-11
                    -translate-y-1/2
                    items-center justify-center
                    rounded-full
                    border border-champagne/50
                    bg-ivory/70
                    text-burgundy
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:bg-ivory hover:border-burgundy/40
                    md:flex
                    lg:right-8
                "
            >
                <span aria-hidden="true" className="text-lg leading-none">
                    ›
                </span>
            </button>
        </section>
    )
}

export default HeroCarousel
