'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaInstagram } from 'react-icons/fa'

gsap.registerPlugin(ScrollTrigger)

const instagramProfile = 'https://www.instagram.com/thenimijewels/'

// Reel IDs — the part after /reel/ in a share link. Add a new ID here to
// show another reel; the share link's tracking params aren't needed.
const reels = ['DdoYTVmPvZq', 'DdjT516PmJ0', 'DdeB7Qdvyta']

/**
 * Home-page strip of Instagram reels, embedded with Instagram's own iframe
 * player. Swipes horizontally on phones, sits in three columns on desktop.
 */
const InstaReels = () => {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.from('[data-reels-head]', {
                    y: 26,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.09,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        once: true,
                    },
                })

                gsap.fromTo(
                    '[data-reel-card]',
                    { y: 60, opacity: 0, scale: 0.96 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.85,
                        stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: '[data-reels-grid]',
                            start: 'top 85%',
                            once: true,
                        },
                    },
                )
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="reels"
            aria-labelledby="reels-heading"
            className="
                relative
                scroll-mt-24
                overflow-hidden
                bg-ivory
                px-5 py-16
                sm:px-8 sm:py-20
                lg:px-10 lg:py-28
            "
        >
            {/* Champagne halo */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute -right-24 bottom-0
                    h-72 w-72
                    rounded-full
                    bg-champagne/20
                    blur-3xl
                "
            />

            <div className="relative mx-auto max-w-7xl">
                {/* ---------------- Heading ---------------- */}
                <div className="mx-auto max-w-2xl text-center">
                    <span
                        data-reels-head
                        className="
                            inline-block
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.35em]
                            text-taupe
                            sm:text-[11px]
                            sm:tracking-[0.4em]
                        "
                    >
                        On Instagram
                    </span>

                    <h2
                        id="reels-heading"
                        data-reels-head
                        className="
                            mt-3
                            font-heading
                            text-3xl
                            leading-tight
                            text-burgundy
                            xs:text-4xl
                            sm:text-5xl
                        "
                    >
                        See It in Motion
                    </h2>

                    {/* Champagne rule with a centre diamond */}
                    <div
                        data-reels-head
                        aria-hidden="true"
                        className="mt-5 flex items-center justify-center gap-3"
                    >
                        <span className="h-px w-10 bg-champagne sm:w-16" />
                        <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
                        <span className="h-px w-10 bg-champagne sm:w-16" />
                    </div>

                    <p
                        data-reels-head
                        className="mt-5 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        Watch our pieces catch the light — styled, worn and loved.
                    </p>
                </div>

                {/* ---------------- Reels ----------------
                    Scroll-snap row on phones, three columns from lg up. */}
                <div
                    data-reels-grid
                    className="
                        -mx-5 mt-10
                        flex snap-x snap-mandatory gap-5
                        overflow-x-auto
                        px-5 pb-4
                        sm:-mx-8 sm:mt-14 sm:px-8
                        lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0
                    "
                >
                    {reels.map((id) => (
                        <div
                            key={id}
                            data-reel-card
                            className="
                                w-[85%] max-w-[360px]
                                shrink-0 snap-center
                                overflow-hidden
                                rounded-2xl
                                border border-champagne/40
                                bg-white
                                shadow-[0_8px_24px_rgba(72,12,20,0.06)]
                                xs:w-[320px]
                                lg:mx-auto lg:w-full
                                @container
                            "
                        >
                            {/* The embed is cross-origin, so its footer
                                (like/comment icons, like count, "Add a
                                comment") can't be styled away — it's cropped
                                instead. Embed layout: 54px header, media at
                                125% of the width, then ~42px for "View more
                                on Instagram". `cqw` tracks the card's width
                                so the cut lands in the same place at every
                                size. */}
                            <div className="h-[calc(96px+125cqw)] overflow-hidden">
                                <iframe
                                    src={`https://www.instagram.com/reel/${id}/embed`}
                                    title={`nimi on Instagram — reel ${id}`}
                                    loading="lazy"
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                    allowFullScreen
                                    scrolling="no"
                                    className="block h-[calc(260px+125cqw)] w-full border-0"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ---------------- Follow ---------------- */}
                <div data-reels-head className="mt-10 text-center sm:mt-12">
                    <a
                        href={instagramProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            inline-flex items-center gap-2
                            rounded-full
                            border border-burgundy
                            px-6 py-3
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.2em]
                            text-burgundy
                            transition-colors duration-300
                            hover:bg-burgundy hover:text-ivory
                        "
                    >
                        <FaInstagram aria-hidden="true" className="h-3.5 w-3.5" />
                        Follow @thenimijewels
                    </a>
                </div>
            </div>
        </section>
    )
}

export default InstaReels
