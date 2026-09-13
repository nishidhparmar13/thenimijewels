'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Short, scannable promises — the three things the brand wants remembered.
const values = [
    {
        title: 'Handcrafted',
        copy: 'Every piece is finished by hand, so no two are exactly alike.',
    },
    {
        title: 'Skin-kind metals',
        copy: 'Anti-tarnish, nickel-free alloys that sit easy on sensitive skin.',
    },
    {
        title: 'Made to be worn',
        copy: 'Designed for a Tuesday commute as much as a wedding sangeet.',
    },
]

// Counters animate from 0 up to `value` when the row scrolls into view.
const stats = [
    { value: 250, suffix: '+', label: 'Designs' },
    { value: 4800, suffix: '+', label: 'Happy customers' },
    { value: 100, suffix: '%', label: 'Hand-finished' },
]

const AboutUs = () => {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                // ---- Headline: word-by-word reveal ----
                const split = new SplitText('[data-about-title]', {
                    type: 'words',
                    wordsClass: 'inline-block',
                })

                gsap.from(split.words, {
                    yPercent: 120,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.06,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '[data-about-copy]',
                        start: 'top 82%',
                        once: true,
                    },
                })

                // ---- Supporting copy, values, CTA ----
                gsap.from('[data-about-fade]', {
                    y: 28,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '[data-about-copy]',
                        start: 'top 75%',
                        once: true,
                    },
                })

                // ---- Image: masked wipe in, then a slow parallax drift ----
                gsap.fromTo(
                    '[data-about-frame]',
                    { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 },
                    {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        opacity: 1,
                        duration: 1.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: '[data-about-frame]',
                            start: 'top 85%',
                            once: true,
                        },
                    },
                )

                gsap.to('[data-about-photo]', {
                    yPercent: -12,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '[data-about-frame]',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                })

                // ---- Champagne outline that draws around the photo ----
                gsap.from('[data-about-outline]', {
                    scale: 0.9,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '[data-about-frame]',
                        start: 'top 85%',
                        once: true,
                    },
                })

                // ---- Stats count up ----
                gsap.utils
                    .toArray<HTMLElement>('[data-about-stat]')
                    .forEach((el) => {
                        const target = Number(el.dataset.aboutStat ?? 0)
                        const counter = { n: 0 }

                        gsap.to(counter, {
                            n: target,
                            duration: 1.6,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: '[data-about-stats]',
                                start: 'top 88%',
                                once: true,
                            },
                            onUpdate: () => {
                                el.textContent = Math.round(
                                    counter.n,
                                ).toLocaleString('en-IN')
                            },
                        })
                    })

                return () => split.revert()
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="about"
            aria-labelledby="about-heading"
            className="
                relative
                scroll-mt-24
                overflow-hidden
                bg-white
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
                    absolute -left-32 top-1/3
                    h-80 w-80
                    rounded-full
                    bg-champagne/25
                    blur-3xl
                "
            />

            <div
                className="
                    relative mx-auto
                    grid max-w-7xl
                    items-center
                    gap-10
                    lg:grid-cols-2
                    lg:gap-16
                "
            >
                {/* ---------------- Photo ---------------- */}
                <div className="relative order-1 lg:order-none">
                    {/* Offset champagne outline behind the photo */}
                    <div
                        data-about-outline
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute -bottom-4 -left-4
                            h-full w-full
                            rounded-3xl
                            border border-champagne
                            sm:-bottom-6 sm:-left-6
                        "
                    />

                    <div
                        data-about-frame
                        className="
                            relative
                            aspect-4/5
                            w-full
                            overflow-hidden
                            rounded-3xl
                            shadow-[0_20px_60px_rgba(72,12,20,0.18)]
                            sm:aspect-square
                            lg:aspect-4/5
                        "
                    >
                        <Image
                            data-about-photo
                            src="/main-categories/neckless.png"
                            alt="A nimi necklace, hand-finished in our studio"
                            fill
                            sizes="(min-width: 1024px) 45vw, 100vw"
                            // Taller than the frame so the parallax has room
                            // to drift without exposing an edge.
                            className="scale-110 object-cover"
                        />

                        <div
                            aria-hidden="true"
                            className="
                                absolute inset-0
                                bg-gradient-to-t
                                from-burgundy/50
                                to-transparent
                            "
                        />
                    </div>
                </div>

                {/* ---------------- Copy ---------------- */}
                <div data-about-copy className="order-2 lg:order-none">
                    <span
                        data-about-fade
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
                        About Us
                    </span>

                    {/* overflow-hidden clips the words as they swing up */}
                    <h2
                        id="about-heading"
                        className="mt-3 overflow-hidden py-1"
                    >
                        <span
                            data-about-title
                            className="
                                block
                                font-heading
                                text-3xl
                                leading-tight
                                text-burgundy
                                xs:text-4xl
                                sm:text-5xl
                            "
                        >
                            Jewels with soul, made for everyday chapters
                        </span>
                    </h2>

                    <div
                        data-about-fade
                        aria-hidden="true"
                        className="mt-5 flex items-center gap-3"
                    >
                        <span className="h-px w-12 bg-champagne sm:w-16" />
                        <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
                    </div>

                    <p
                        data-about-fade
                        className="mt-5 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        nimi began with a simple frustration — jewellery that
                        looked beautiful in a photo, then turned your skin green
                        by lunchtime. So we started making the pieces we wanted
                        to wear: hand-finished, kind to skin, and priced so you
                        can own more than one favourite.
                    </p>

                    <p
                        data-about-fade
                        className="mt-4 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        Every design is drawn, sampled and quality-checked by a
                        small team before it ever reaches you — because the
                        piece you reach for on an ordinary Tuesday deserves as
                        much care as the one you save for a wedding.
                    </p>

                    {/* ---- Values ---- */}
                    <ul className="mt-8 space-y-4">
                        {values.map((value) => (
                            <li
                                key={value.title}
                                data-about-fade
                                className="flex gap-3"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-champagne"
                                />

                                <span>
                                    <span className="block text-sm font-medium text-burgundy">
                                        {value.title}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-relaxed text-taupe sm:text-sm">
                                        {value.copy}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* ---- Stats ---- */}
                    <div
                        data-about-stats
                        className="
                            mt-10
                            grid grid-cols-3
                            gap-4
                            border-y border-champagne/40
                            py-6
                        "
                    >
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="font-heading text-2xl text-burgundy sm:text-3xl">
                                    <span
                                        data-about-stat={stat.value}
                                        // Rendered value is the fallback when
                                        // JS or motion is unavailable.
                                    >
                                        {stat.value.toLocaleString('en-IN')}
                                    </span>
                                    {stat.suffix}
                                </p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-taupe sm:text-xs">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ---- CTA ---- */}
                    <Link
                        data-about-fade
                        href="/#categories"
                        className="
                            group
                            mt-8
                            inline-flex items-center gap-3
                            rounded-full
                            bg-burgundy
                            px-7 py-3.5
                            text-[11px]
                            font-medium
                            uppercase
                            tracking-[0.22em]
                            text-ivory
                            shadow-[0_10px_30px_rgba(72,12,20,0.25)]
                            transition-all duration-300
                            hover:bg-wine
                            hover:shadow-[0_16px_40px_rgba(72,12,20,0.35)]
                        "
                    >
                        Explore the collection
                        <span
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default AboutUs
