'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const values = [
    {
        title: 'Thoughtfully Curated',
        copy: 'Every piece is selected with care to bring you designs that feel unique and beautiful.',
    },
    {
        title: 'Made for Every Chapter',
        copy: 'From everyday moments to festive celebrations, find jewellery that belongs in your story.',
    },
    {
        title: 'Affordable Luxury',
        copy: "Beautiful jewellery shouldn't have to wait for a special occasion. Our pieces are made to be loved, worn and enjoyed.",
    },
    {
        title: 'Jewellery with Soul',
        copy: "Because the best pieces aren't just accessories. They become part of your memories, moments and stories.",
    },
]

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
                // Headline animation
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

                // Supporting content animation
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

                // Image reveal
                gsap.fromTo(
                    '[data-about-frame]',
                    {
                        clipPath: 'inset(0% 0% 100% 0%)',
                        opacity: 0,
                    },
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

                // Image parallax
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

                // Champagne outline animation
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

                // Stats counter animation
                gsap.utils
                    .toArray<HTMLElement>('[data-about-stat]')
                    .forEach((el) => {
                        const target = Number(
                            el.dataset.aboutStat ?? 0,
                        )

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
                    items-start
                    gap-10
                    lg:grid-cols-2
                    lg:gap-16
                "
            >
                {/* ---------------- Photo ---------------- */}
                <div className="relative order-1 lg:order-none">
                    {/* Champagne outline */}
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
                            src="/categories/neckless/NIMI-NECK-004/2.png"
                            alt="A nimi necklace, hand-finished in our studio"
                            fill
                            sizes="(min-width: 1024px) 45vw, 100vw"
                            className="scale-110 object-cover"
                        />

                        {/* <div
                            aria-hidden="true"
                            className="
                                absolute inset-0
                                bg-gradient-to-t
                                from-burgundy/50
                                to-transparent
                            "
                        /> */}
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

                    {/* Main heading */}
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
                            Jewellery with a story, made for your everyday chapters.
                        </span>
                    </h2>

                    {/* Decorative divider */}
                    <div
                        data-about-fade
                        aria-hidden="true"
                        className="mt-5 flex items-center gap-3"
                    >
                        <span className="h-px w-12 bg-champagne sm:w-16" />
                        <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
                    </div>

                    {/* Intro */}
                    <p
                        data-about-fade
                        className="mt-5 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        At <strong className="text-burgundy">nimi</strong>, we
                        believe jewellery is more than something you wear. It
                        is a little part of who you are.
                    </p>

                    <p
                        data-about-fade
                        className="mt-4 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        We created nimi to bring you beautiful, expressive
                        pieces that feel special without waiting for a special
                        occasion. From everyday favourites to festive statement
                        pieces, every design is chosen to add a little more soul
                        to your look.
                    </p>

                    <p
                        data-about-fade
                        className="mt-4 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        Our collections are thoughtfully curated with a love
                        for detail, traditional inspiration and modern styling.
                        so you can wear your jewellery your way, every day.
                    </p>

                    {/* Values */}
                    <div
                        data-about-fade
                        className="mt-8"
                    >
                        <h3 className="font-heading text-xl text-burgundy sm:text-2xl">
                            What makes nimi special
                        </h3>

                        <ul className="mt-5 space-y-4">
                            {values.map((value) => (
                                <li
                                    key={value.title}
                                    className="flex gap-3"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="
                                            mt-2
                                            h-1.5 w-1.5
                                            shrink-0
                                            rotate-45
                                            bg-champagne
                                        "
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
                    </div>

                    {/* Our Promise */}
                    <div
                        data-about-fade
                        className="
                            mt-8
                            rounded-2xl
                            bg-ivory
                            p-5
                            sm:p-6
                        "
                    >
                        <h3 className="font-heading text-xl text-burgundy sm:text-2xl">
                            Our Promise
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-taupe sm:text-base">
                            We want every nimi piece to make you feel a little
                            more <strong className="text-burgundy">you</strong>
                            {' '}— confident, beautiful and ready for whatever
                            your next chapter brings.
                        </p>

                        <p className="mt-4 font-heading text-lg text-burgundy">
                            nimi — Jewels with Soul.
                        </p>
                    </div>

                    {/* Stats */}
                    {/* <div
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
                    </div> */}

                    {/* CTA */}
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
                            className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-1
                            "
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
