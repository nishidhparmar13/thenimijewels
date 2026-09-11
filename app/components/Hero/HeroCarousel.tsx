'use client'

import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const slides = [
    {
        src: '/hero-banners/1.png',
        alt: 'nimi jewellery — oxidised necklace and earring set styled on a display bust',
    },
    {
        src: '/hero-banners/2.png',
        alt: 'nimi jewellery — handcrafted oxidised jewellery collection',
    },
    {
        src: '/hero-banners/4.png',
        alt: 'nimi jewellery — bridal and festive jewellery edit',
    },
]

const AUTOPLAY_DURATION = 5.5

const HeroCarousel = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const slideRefs = useRef<(HTMLDivElement | null)[]>([])
    const progressFillRefs = useRef<(HTMLDivElement | null)[]>([])

    const [active, setActive] = useState(0)
    const activeRef = useRef(0)
    const prevActiveRef = useRef(0)

    useEffect(() => {
        activeRef.current = active
    }, [active])

    const progressTweenRef = useRef<gsap.core.Tween | null>(null)
    const isAnimatingRef = useRef(false)
    const touchStartX = useRef<number | null>(null)

    const goToIndex = useCallback((next: number) => {
        const total = slides.length
        const normalized = ((next % total) + total) % total

        if (normalized === activeRef.current || isAnimatingRef.current) return
        isAnimatingRef.current = true
        setActive(normalized)
    }, [])

    const goNext = useCallback(
        () => goToIndex(activeRef.current + 1),
        [goToIndex]
    )
    const goPrev = useCallback(
        () => goToIndex(activeRef.current - 1),
        [goToIndex]
    )

    /*
     * Entrance reveal + initial slide stacking
     */
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                sectionRef.current,
                {
                    opacity: 0,
                    scale: 1.03,
                    filter: 'blur(14px)',
                },
                {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1.4,
                    ease: 'power3.out',
                    delay: 0.15,
                }
            )

            slides.forEach((_, i) => {
                gsap.set(slideRefs.current[i], {
                    xPercent: 0,
                    autoAlpha: i === 0 ? 1 : 0,
                    zIndex: i === 0 ? 2 : 1,
                })
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    /*
     * Directional slide transition + autoplay progress, driven by `active`.
     *
     * Deliberately NOT wrapped in gsap.context here — context.revert() undoes
     * every tween/inline-style it created as soon as this effect's cleanup
     * runs (i.e. on every single `active` change), which was snapping the
     * slides back to their pre-animation state for a frame and reading as a
     * blink. Plain gsap calls persist across re-renders as intended.
     */
    useEffect(() => {
        const total = slides.length
        const prev = prevActiveRef.current

        if (prev !== active) {
            const distance = (active - prev + total) % total
            const forward = distance <= total / 2

            const incoming = slideRefs.current[active]
            const outgoing = slideRefs.current[prev]

            gsap.killTweensOf([incoming, outgoing])

            gsap.set(incoming, {
                xPercent: forward ? 100 : -100,
                autoAlpha: 1,
                zIndex: 2,
            })
            gsap.set(outgoing, { zIndex: 1 })

            gsap
                .timeline({ defaults: { duration: 1.15, ease: 'power3.inOut' } })
                .to(incoming, { xPercent: 0 }, 0)
                .to(
                    outgoing,
                    {
                        xPercent: forward ? -30 : 30,
                        autoAlpha: 0,
                    },
                    0
                )
        }

        // Progress dots — fill the active one, reset the rest
        progressTweenRef.current?.kill()
        slides.forEach((_, i) => {
            gsap.set(progressFillRefs.current[i], {
                scaleX: i < active ? 1 : 0,
                transformOrigin: 'left center',
            })
        })

        const activeFill = progressFillRefs.current[active]
        if (activeFill) {
            progressTweenRef.current = gsap.fromTo(
                activeFill,
                { scaleX: 0, transformOrigin: 'left center' },
                {
                    scaleX: 1,
                    duration: AUTOPLAY_DURATION,
                    ease: 'none',
                    onComplete: () => {
                        isAnimatingRef.current = false
                        goNext()
                    },
                }
            )
        }

        prevActiveRef.current = active
        isAnimatingRef.current = false
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    const pauseAutoplay = () => {
        progressTweenRef.current?.pause()
    }

    const resumeAutoplay = () => {
        progressTweenRef.current?.resume()
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        pauseAutoplay()
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return
        const delta = e.changedTouches[0].clientX - touchStartX.current
        const SWIPE_THRESHOLD = 50

        if (delta > SWIPE_THRESHOLD) {
            goPrev()
        } else if (delta < -SWIPE_THRESHOLD) {
            goNext()
        } else {
            resumeAutoplay()
        }
        touchStartX.current = null
    }

    return (
        <section
            ref={sectionRef}
            aria-roledescription="carousel"
            aria-label="nimi jewellery highlights"
            onMouseEnter={pauseAutoplay}
            onMouseLeave={resumeAutoplay}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="
                group/carousel
                relative
                aspect-video
                w-full
                overflow-hidden
                md:mt-0
                md:aspect-auto
                md:h-[90vh]
            "
        >
            {/* Slides */}
            {slides.map((slide, i) => (
                <div
                    key={slide.src}
                    ref={(el) => {
                        slideRefs.current[i] = el
                    }}
                    aria-hidden={i !== active}
                    // Only ever reflects the *initial* slide (index 0) — once
                    // mounted, GSAP's inline opacity/visibility/transform own
                    // this element exclusively, so this must stay static and
                    // not react to `active` or it will race the transition
                    // tween and flash the incoming slide at full opacity.
                    className={`absolute inset-0 will-change-transform ${i === 0 ? 'visible opacity-100' : 'invisible opacity-0'
                        }`}
                >
                    <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        priority={i === 0}
                        sizes="100vw"
                        className="object-cover object-top"
                    />

                    {/* Subtle brand-tint scrim for legibility of the UI chrome */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-x-0
                            bottom-0
                            h-32
                            bg-linear-to-t
                            from-burgundy/35
                            via-burgundy/0
                            to-transparent
                        "
                    />
                </div>
            ))}

            {/* Prev / Next arrows */}
            <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="
                    absolute
                    left-3
                    top-1/2
                    z-10
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/40
                    bg-burgundy/20
                    text-white
                    opacity-0
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:bg-burgundy/40
                    focus-visible:opacity-100
                    group-hover/carousel:opacity-100
                    sm:left-5
                    sm:h-12
                    sm:w-12
                "
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path d="m15 6-6 6 6 6" />
                </svg>
            </button>

            <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="
                    absolute
                    right-3
                    top-1/2
                    z-10
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/40
                    bg-burgundy/20
                    text-white
                    opacity-0
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:bg-burgundy/40
                    focus-visible:opacity-100
                    group-hover/carousel:opacity-100
                    sm:right-5
                    sm:h-12
                    sm:w-12
                "
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path d="m9 6 6 6-6 6" />
                </svg>
            </button>

            {/* Progress dots */}
            <div
                className="
                    absolute
                    bottom-4
                    left-1/2
                    z-10
                    flex
                    -translate-x-1/2
                    items-center
                    gap-2
                    sm:bottom-6
                    sm:gap-3
                "
            >
                {slides.map((slide, i) => (
                    <button
                        key={slide.src}
                        type="button"
                        onClick={() => goToIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={i === active}
                        className="
                            group
                            relative
                            h-1.5
                            w-8
                            overflow-hidden
                            rounded-full
                            bg-white/30
                            transition-all
                            duration-300
                            sm:w-11
                        "
                    >
                        <div
                            ref={(el) => {
                                progressFillRefs.current[i] = el
                            }}
                            className="h-full w-full origin-left scale-x-0 rounded-full bg-champagne"
                        />
                    </button>
                ))}
            </div>

            {/* Slide counter */}
            <div
                className="
                    absolute
                    bottom-4
                    right-4
                    z-10
                    hidden
                    items-baseline
                    gap-1
                    font-heading
                    text-white
                    sm:flex
                    sm:bottom-6
                    sm:right-6
                "
            >
                <span className="text-lg tracking-wide">
                    {String(active + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-white/60">
                    / {String(slides.length).padStart(2, '0')}
                </span>
            </div>
        </section>
    )
}

export default HeroCarousel
