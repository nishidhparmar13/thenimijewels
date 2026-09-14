'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import mainCategories from '../data/main-categories.json'

gsap.registerPlugin(ScrollTrigger)

interface MainCategory {
    title: string
    slug: string
    description: string
    image: string
}

const categories = mainCategories as MainCategory[]

// The JSON ships "/" as a placeholder until real photography lands, so
// anything that isn't a real file path falls back to the monogram tile.
const hasImage = (image: string) => image.length > 1 && image !== '/'

const MainCategories = () => {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()
            const cards = gsap.utils.toArray<HTMLElement>('[data-cat-card]')

            // ----------------------------------------------------------
            // Scroll reveal. `once` + explicit end values mean a card can
            // never be left mid-flight (half-faded / offset) the way an
            // interrupted tween would.
            // ----------------------------------------------------------
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.from('[data-cat-head]', {
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
                    cards,
                    { y: 60, opacity: 0, scale: 0.96 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.85,
                        stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: '[data-cat-grid]',
                            start: 'top 88%',
                            once: true,
                        },
                    },
                )
            })

            // ----------------------------------------------------------
            // Hover: only on devices with a real pointer. Touch screens
            // get the plain (already complete) card.
            // ----------------------------------------------------------
            mm.add(
                '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
                () => {
                    const cleanups = cards.map((card) => {
                        const media = card.querySelector('[data-card-media]')
                        const overlay = card.querySelector('[data-card-overlay]')
                        const shine = card.querySelector('[data-card-shine]')
                        const title = card.querySelector('[data-card-title]')
                        const desc = card.querySelector('[data-card-desc]')
                        const cta = card.querySelector('[data-card-cta]')
                        const rule = card.querySelector('[data-card-rule]')
                        const arrow = card.querySelector('[data-card-arrow]')
                        const caption = card.querySelector('[data-card-caption]')

                        const hover = gsap
                            .timeline({ paused: true, defaults: { ease: 'power3.out' } })
                            .to(media, { scale: 1.1, duration: 0.9 }, 0)
                            .to(overlay, { opacity: 1, duration: 0.5 }, 0)
                            .to(title, { y: -4, duration: 0.5 }, 0)
                            .to(desc, { y: -2, opacity: 1, duration: 0.5 }, 0.05)
                            .to(cta, { y: -2, opacity: 1, duration: 0.5 }, 0.1)
                            .fromTo(
                                rule,
                                { scaleX: 0 },
                                { scaleX: 1, duration: 0.5 },
                                0.12,
                            )
                            .to(arrow, { x: 6, duration: 0.45 }, 0.12)
                            // Diagonal gloss sweeping across the card.
                            .fromTo(
                                shine,
                                { xPercent: -140 },
                                { xPercent: 140, duration: 1.1, ease: 'power2.inOut' },
                                0,
                            )

                        // Subtle 3D tilt that follows the cursor.
                        const rotX = gsap.quickTo(card, 'rotateX', {
                            duration: 0.6,
                            ease: 'power3.out',
                        })
                        const rotY = gsap.quickTo(card, 'rotateY', {
                            duration: 0.6,
                            ease: 'power3.out',
                        })
                        const shiftX = gsap.quickTo(caption, 'x', {
                            duration: 0.8,
                            ease: 'power3.out',
                        })

                        gsap.set(card, { transformPerspective: 900 })

                        const onEnter = () => {
                            hover.play()
                            gsap.to(card, {
                                y: -10,
                                boxShadow: '0 28px 60px rgba(72,12,20,0.22)',
                                duration: 0.5,
                                ease: 'power3.out',
                            })
                        }

                        const onMove = (e: PointerEvent) => {
                            const r = card.getBoundingClientRect()
                            // -0.5 … 0.5 from the centre of the card.
                            const px = (e.clientX - r.left) / r.width - 0.5
                            const py = (e.clientY - r.top) / r.height - 0.5

                            rotY(px * 10)
                            rotX(-py * 10)
                            shiftX(px * 12)
                        }

                        const onLeave = () => {
                            hover.reverse()
                            rotX(0)
                            rotY(0)
                            shiftX(0)
                            gsap.to(card, {
                                y: 0,
                                boxShadow: '0 10px 30px rgba(72,12,20,0.06)',
                                duration: 0.5,
                                ease: 'power3.out',
                            })
                        }

                        card.addEventListener('pointerenter', onEnter)
                        card.addEventListener('pointermove', onMove)
                        card.addEventListener('pointerleave', onLeave)

                        return () => {
                            card.removeEventListener('pointerenter', onEnter)
                            card.removeEventListener('pointermove', onMove)
                            card.removeEventListener('pointerleave', onLeave)
                            hover.kill()
                        }
                    })

                    return () => cleanups.forEach((fn) => fn())
                },
            )
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="categories"
            aria-labelledby="categories-heading"
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
            {/* Soft champagne halo behind the section */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute -right-24 top-0
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
                        data-cat-head
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
                        Categories
                    </span>

                    <h2
                        id="categories-heading"
                        data-cat-head
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
                        Shop by Category
                    </h2>

                    {/* Champagne rule with a centre diamond */}
                    <div
                        data-cat-head
                        aria-hidden="true"
                        className="mt-5 flex items-center justify-center gap-3"
                    >
                        <span className="h-px w-10 bg-champagne sm:w-16" />
                        <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
                        <span className="h-px w-10 bg-champagne sm:w-16" />
                    </div>

                    <p
                        data-cat-head
                        className="mt-5 text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        Discover jewellery made for every mood, moment & celebration. From everyday favourites to festive statement pieces, find the perfect piece to make every chapter a little more beautiful.
                    </p>
                </div>

                {/* ---------------- Cards ----------------
                    `auto-rows-fr` + `h-full` keep every card exactly the
                    same size no matter how long its description runs. */}
                <div
                    data-cat-grid
                    className="
                        mt-10
                        grid
                        auto-rows-fr
                        grid-cols-1
                        gap-5
                        sm:mt-14
                        sm:grid-cols-2
                        sm:gap-6
                        lg:grid-cols-3
                        lg:gap-8
                    "
                >
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            data-cat-card
                            href={`/categories/${category.slug}`}
                            className="
                                group
                                relative
                                block h-full
                                overflow-hidden
                                rounded-3xl
                                border border-champagne/40
                                bg-white
                                shadow-[0_10px_30px_rgba(72,12,20,0.06)]
                                transition-colors duration-500
                                will-change-transform
                                hover:border-champagne
                            "
                        >
                            {/* Fixed ratio → identical card size across the row */}
                            <div className="relative aspect-4/5 w-full overflow-hidden lg:aspect-3/4">
                                {hasImage(category.image) ? (
                                    <Image
                                        data-card-media
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    // Placeholder until real photography exists:
                                    // an oversized champagne monogram.
                                    <div
                                        data-card-media
                                        aria-hidden="true"
                                        className="
                                            flex h-full w-full
                                            items-center justify-center
                                            bg-gradient-to-br
                                            from-ivory
                                            via-champagne/25
                                            to-champagne/50
                                        "
                                    >
                                        <span className="font-heading text-[7rem] leading-none text-white/70 sm:text-[9rem]">
                                            {category.title.charAt(0)}
                                        </span>
                                    </div>
                                )}

                                {/* Base burgundy wash so the caption always reads */}
                                <div
                                    aria-hidden="true"
                                    className="
                                        absolute inset-0
                                        bg-gradient-to-t
                                        from-burgundy/85
                                        via-burgundy/0
                                        to-transparent
                                    "
                                />

                                {/* Deeper wash, faded in on hover */}
                                <div
                                    data-card-overlay
                                    aria-hidden="true"
                                    className="
                                        absolute inset-0
                                        bg-gradient-to-t
                                        from-burgundy
                                        via-burgundy/45
                                        to-burgundy/10
                                        opacity-0
                                    "
                                />

                                {/* Diagonal gloss, swept across on hover */}
                                <div
                                    data-card-shine
                                    aria-hidden="true"
                                    className="
                                        pointer-events-none
                                        absolute -inset-y-10 -left-1/3
                                        w-1/2
                                        -translate-x-full
                                        rotate-12
                                        bg-linear-to-r
                                        from-transparent
                                        via-white/25
                                        to-transparent
                                        blur-md
                                    "
                                />

                                {/* Caption */}
                                <div
                                    data-card-caption
                                    className="absolute inset-x-0 bottom-0 p-5 sm:p-6"
                                >
                                    <h3
                                        data-card-title
                                        className="font-heading text-2xl text-ivory sm:text-3xl"
                                    >
                                        {category.title}
                                    </h3>

                                    {/* <p
                                        data-card-desc
                                        className="mt-1 text-xs text-ivory/70 sm:text-sm"
                                    >
                                        {category.description}
                                    </p> */}

                                    <span
                                        data-card-cta
                                        className="
                                            relative
                                            mt-3
                                            inline-flex items-center gap-2
                                            pb-1
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-[0.22em]
                                            text-champagne
                                        "
                                    >
                                        Explore
                                        <span data-card-arrow aria-hidden="true">
                                            →
                                        </span>

                                        {/* Underline drawn left-to-right on hover */}
                                        <span
                                            data-card-rule
                                            aria-hidden="true"
                                            className="
                                                absolute inset-x-0 bottom-0
                                                h-px
                                                origin-left
                                                scale-x-0
                                                bg-champagne
                                            "
                                        />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default MainCategories
